import { isNonProductionRequest, previewResponse } from './preview';

type Environment = Record<string, string | undefined>;
type FormKind = 'quote' | 'quick-form' | 'discount' | 'feedback';
const MAX_BYTES = 32_768;
const bindings: Record<FormKind, string> = {
  quote: 'QUOTE_FORM_WEBHOOK', 'quick-form': 'QUICK_FORM_WEBHOOK',
  discount: 'DISCOUNT_FORM_WEBHOOK', feedback: 'FEEDBACK_WEBHOOK',
};
const contactTopics = new Set(['general-inquiry', 'existing-client', 'supplier', 'partnership', 'administrative', 'other']);
const quoteFields = ['phone', 'postcode', 'service', 'route', 'buyer', 'service_context',
  'address', 'area', 'size', 'frequency', 'desired_date', 'required_service_date',
  'checkout_date', 'inspection_date', 'move_in_date', 'details', 'operating_hours',
  'mobilisation_requirements', 'tupe_context', 'property_type', 'bedrooms', 'bathrooms',
  'privacy_consent', 'source_page', 'landing_page', 'referrer', 'utm_source', 'utm_medium',
  'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'intent'];
const allowedFields: Record<FormKind, string[]> = {
  quote: quoteFields,
  'quick-form': ['phone', 'postcode', 'service', 'area', 'property_type', 'details', 'message', 'privacy_consent', 'page_url'],
  discount: ['phone', 'type', 'summary', 'message', 'page_url'],
  feedback: ['rating', 'reference', 'feedback'],
};

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store',
  } });
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
}

function quickFormSource(request: Request) {
  // Only known same-origin page paths select a source; never forward a supplied source.
  const sources: Record<string, string> = {
    '/areas/': 'areas_page', '/process/': 'process_page',
    '/services/': 'services_page', '/why-us/': 'why_us_page',
  };
  try {
    const referrer = new URL(request.headers.get('Referer') || '');
    if (referrer.origin === new URL(request.url).origin) return sources[referrer.pathname] || 'website_form';
  } catch { /* Referrer is optional. */ }
  return 'website_form';
}

// Adapted from the staged intake boundary, retaining the production form contracts.
export async function submitForm(request: Request, env: Environment, kind: FormKind): Promise<Response> {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid request origin' }, 403);
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return json({ error: 'Please submit this form as JSON' }, 415);
  }
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) return json({ error: 'Form is too large' }, 413);
  let input: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Missing form' }, 400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        return json({ error: 'Form is too large' }, 413);
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    input = JSON.parse(new TextDecoder().decode(buffer));
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error();
  } catch { return json({ error: 'Invalid form data' }, 400); }

  const body: Record<string, string> = {};
  for (const key of ['name', 'email', ...allowedFields[kind]]) {
    if (!Object.hasOwn(input, key)) continue;
    const value = input[key];
    const limit = ['details', 'message', 'summary', 'feedback', 'mobilisation_requirements'].includes(key) ? 8000 : 2000;
    if (typeof value !== 'string' || value.length > limit) return json({ error: 'Please check this field', field: key }, 400);
    body[key] = value.trim();
  }
  const contact = kind === 'quick-form' && ('message' in body || contactTopics.has(body.service));
  const routedQuote = kind === 'quote' && 'route' in body;
  const offer = kind === 'discount' && 'message' in body;
  const required = ['name', 'email'];
  if (kind === 'quote') {
    required.push('phone', 'postcode', 'service');
    required.push(...(routedQuote ? ['route', 'details', 'privacy_consent'] : ['property_type', 'frequency']));
    if (routedQuote && body.route === 'commercial') required.push('frequency', 'operating_hours', 'mobilisation_requirements');
  } else if (kind === 'quick-form') {
    required.push(...(contact ? ['service', 'message', 'privacy_consent'] : ['postcode', 'property_type', 'privacy_consent']));
    if (!contact) required.push(body.area && !body.service ? 'area' : 'service');
  } else if (kind === 'discount') {
    required.push('type');
    // The embedded offer only requires name/email; the dedicated page also requires phone/summary.
    if (!offer) required.push('phone', 'summary');
  } else required.push('feedback');
  for (const field of required) if (!body[field]) return json({ error: 'Please complete this field', field }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return json({ error: 'Please enter a valid email address', field: 'email' }, 400);
  if (body.phone && (!/^[+\d\s().-]+$/.test(body.phone) || !/^\d{7,15}$/.test(body.phone.replace(/\D/g, '')))) {
    return json({ error: 'Please enter a valid phone number', field: 'phone' }, 400);
  }
  if (required.includes('privacy_consent') && body.privacy_consent !== 'yes') {
    return json({ error: 'Please confirm the privacy notice', field: 'privacy_consent' }, 400);
  }

  if (kind === 'quote') {
    body.route ||= body.service === 'office' ? 'commercial' : 'residential';
    if (!['residential', 'commercial', 'complex'].includes(body.route)) return json({ error: 'Invalid enquiry route', field: 'route' }, 400);
    if (body.service === 'Essential Clean™ suitability' && !['Weekly', 'Fortnightly'].includes(body.frequency)) {
      return json({ error: 'Please choose weekly or fortnightly', field: 'frequency' }, 400);
    }
    if (body.required_service_date && body.desired_date && body.required_service_date !== body.desired_date) {
      return json({ error: 'Service dates must match', field: 'desired_date' }, 400);
    }
    body.required_service_date = body.required_service_date || body.desired_date || '';
    body.desired_date = body.required_service_date;
    for (const field of ['required_service_date', 'checkout_date', 'inspection_date', 'move_in_date']) {
      if (body[field] && !validDate(body[field])) return json({ error: 'Please enter a valid date', field: field === 'required_service_date' ? 'desired_date' : field }, 400);
      body[field] ||= '';
    }
    body.enquiry_type = body.route === 'commercial' && ['property', 'agency'].includes(body.buyer) ? 'property' : body.route;
    // The existing receiver maps Enquiry Notes from details. Append new context there too.
    body.details = [body.details, ...[
      ['Service', body.service], ['Address', body.address], ['Area', body.area], ['Size', body.size],
      ['Required service date', body.required_service_date], ['Checkout date', body.checkout_date],
      ['Inspection date', body.inspection_date], ['Move-in date', body.move_in_date],
      ['Route', body.route], ['Buyer', body.buyer], ['Service context', body.service_context],
      ['Intent', body.intent], ['Operating hours', body.operating_hours],
      ['Mobilisation requirements', body.mobilisation_requirements], ['Current cleaner / TUPE', body.tupe_context],
    ].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`)].filter(Boolean).join('\n');
    body.source = routedQuote ? 'request_a_quote' : 'website_detailed_quote_page';
  } else if (kind === 'quick-form') {
    if (contact) {
      if (!contactTopics.has(body.service)) return json({ error: 'Please choose a contact topic', field: 'service' }, 400);
      for (const key of Object.keys(body)) if (!['name', 'email', 'phone', 'postcode', 'service', 'message', 'privacy_consent'].includes(key)) delete body[key];
      body.source = 'contact_page';
      body.enquiry_type = 'contact';
    } else {
      body.source = quickFormSource(request);
      body.enquiry_type = 'quick_form';
    }
  } else if (kind === 'discount') {
    const type = ['home', 'Residential'].includes(body.type) ? 'Residential'
      : ['commercial', 'Commercial'].includes(body.type) ? 'Commercial' : '';
    if (!type) return json({ error: 'Please choose a service type', field: 'type' }, 400);
    body.type = type;
    body.summary ||= body.message || '';
    body.tag = 'discount offer';
    body.source = offer ? 'offer_component' : 'discount_page';
    body.enquiry_type = type === 'Residential' ? 'residential' : 'commercial';
  } else {
    if (body.rating && !/^[1-5]$/.test(body.rating)) return json({ error: 'Please choose a rating from 1 to 5', field: 'rating' }, 400);
    body.source = 'feedback_page';
    body.enquiry_type = 'private_feedback';
  }
  body.form_type = contact ? 'contact' : kind;
  body.timestamp = new Date().toISOString();
  // Correlation only: a UUID does not provide durable delivery or replay protection.
  body.submission_id = crypto.randomUUID();
  if (kind === 'quote') body.details += `\nSubmission reference: ${body.submission_id}\nReceived: ${body.timestamp}`;

  if (isNonProductionRequest(request)) return previewResponse();
  // Contact intentionally retains QUICK_FORM_WEBHOOK until a separate receiver is configured.
  const webhookUrl = env[bindings[kind]];
  try {
    if (!webhookUrl || new URL(webhookUrl).protocol !== 'https:') throw new Error();
  } catch { return json({ error: 'This form is temporarily unavailable. Please contact HQC directly.' }, 503); }
  let category = 'timeout_setup';
  let providerStatus: number | null = null;
  try {
    const signal = AbortSignal.timeout(10_000);
    category = 'fetch';
    const response = await fetch(webhookUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      // workerd supports manual/follow; a 3xx fails the response.ok check below.
      body: JSON.stringify(body), redirect: 'manual', signal,
    });
    providerStatus = response.status;
    category = 'http';
    if (!response.ok) throw new Error();
    category = 'body';
    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { /* Some receivers acknowledge with plain text or an empty 2xx. */ }
    const status = result?.statusCode ?? result?.status;
    const errors = result?.errors;
    const hasErrors = errors && (typeof errors !== 'object' || Object.keys(errors).length > 0);
    category = 'rejected';
    if (signal.aborted || result?.ok === false || result?.success === false || result?.accepted === false || result?.error
      || hasErrors || Number(status) >= 400 || /^(error|failed|failure|rejected)$/i.test(String(status))) throw new Error();
    return json({ ok: true, submission_id: body.submission_id }, 200);
  } catch {
    // Only bounded categories/statuses enter logs; never URLs, payloads or provider error text.
    console.error('HQC form delivery failed', { form: kind, category, provider_status: providerStatus });
    // Never retry automatically: a failed acknowledgement may still have delivered the request.
    return json({ error: 'We could not confirm receipt. Please contact HQC before submitting again.' }, 502);
  }
}
