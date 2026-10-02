import { isNonProductionRequest, previewResponse } from './preview';

type Environment = Record<string, string | undefined>;
type FormKind = 'quote' | 'contact' | 'feedback';
const MAX_BYTES = 32_768;
const fields = new Set(['name', 'email', 'phone', 'postcode', 'service', 'route', 'buyer',
  'enquiry_type', 'service_context', 'address', 'area', 'size', 'frequency', 'desired_date',
  'required_service_date', 'checkout_date', 'inspection_date', 'move_in_date', 'details',
  'operating_hours', 'mobilisation_requirements', 'tupe_context', 'email_marketing_consent',
  'source_page', 'landing_page', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_content', 'utm_term', 'utm_id', 'intent', 'message', 'rating', 'reference', 'feedback', 'property_type', 'bedrooms', 'bathrooms']);

function json(body: object, status: number) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store'
  } });
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

// Server validation also runs in previews. No preview host can deliver to a live webhook.
export async function submitForm(request: Request, env: Environment, kind: FormKind): Promise<Response> {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid request origin' }, 403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'Please submit this form as JSON' }, 415);
  }
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) return json({ error: 'Form is too large' }, 413);
  let input: Record<string, unknown>;
  try {
    // Bound streamed bodies too; Content-Length is not required or trusted.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Missing form' }, 400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { await reader.cancel(); return json({ error: 'Form is too large' }, 413); }
      chunks.push(value);
    }
    const buffer = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    input = JSON.parse(new TextDecoder().decode(buffer));
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid object');
  } catch { return json({ error: 'Invalid form data' }, 400); }

  const body: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!fields.has(key)) continue;
    if (typeof value !== 'string' || value.length > (['details', 'message', 'feedback'].includes(key) ? 8000 : 2000)) {
      return json({ error: 'Please check this field', field: key }, 400);
    }
    body[key] = value.trim();
  }
  const required = kind === 'quote' ? ['name', 'email', 'phone', 'postcode', 'service', 'details'] : kind === 'contact' ? ['name', 'email', 'service', 'message'] : ['name', 'email', 'feedback'];
  for (const field of required) if (!body[field]) return json({ error: 'Please complete this field', field }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return json({ error: 'Please enter a valid email address', field: 'email' }, 400);

  if (kind === 'quote') {
    body.route ||= 'residential';
    if (!['residential', 'commercial', 'complex'].includes(body.route)) return json({ error: 'Invalid enquiry route', field: 'route' }, 400);
    body.enquiry_type = body.route === 'commercial' && ['property', 'agency'].includes(body.buyer) ? 'property' : body.route;
    if (body.enquiry_type === 'commercial') {
      for (const field of ['frequency', 'operating_hours', 'mobilisation_requirements']) {
        if (!body[field]) return json({ error: 'Please complete this field', field }, 400);
      }
    }
    if (body.service === 'Essential Clean™ suitability' && !['Weekly', 'Fortnightly'].includes(body.frequency)) {
      return json({ error: 'Please choose weekly or fortnightly', field: 'frequency' }, 400);
    }
    if (body.required_service_date && body.desired_date && body.required_service_date !== body.desired_date) {
      return json({ error: 'Service dates must match', field: 'desired_date' }, 400);
    }
    body.required_service_date = body.required_service_date || body.desired_date || '';
    body.desired_date = body.required_service_date; // Existing downstream contract remains compatible.
    for (const field of ['required_service_date', 'checkout_date', 'inspection_date', 'move_in_date']) {
      if (body[field] && !validDate(body[field])) return json({ error: 'Please enter a valid date', field: field === 'required_service_date' ? 'desired_date' : field }, 400);
      body[field] ||= ''; // Explicitly empty on the next enquiry, never reuse an earlier date.
    }
    body.source = 'request_a_quote';
  } else if (kind === 'contact') {
    if (!['general-inquiry', 'existing-client', 'supplier', 'partnership', 'administrative', 'other'].includes(body.service)) {
      return json({ error: 'Please choose a contact topic', field: 'service' }, 400);
    }
    // Never accept sales-stage/route overrides from a Contact submission.
    for (const key of Object.keys(body)) if (!['name', 'email', 'phone', 'postcode', 'service', 'message', 'email_marketing_consent'].includes(key)) delete body[key];
    body.source = 'contact_page';
    body.enquiry_type = 'contact';
  } else {
    if (body.rating && !/^[1-5]$/.test(body.rating)) return json({ error: 'Please choose a rating from 1 to 5', field: 'rating' }, 400);
    for (const key of Object.keys(body)) if (!['name', 'email', 'rating', 'reference', 'feedback'].includes(key)) delete body[key];
    body.source = 'feedback_page';
    body.enquiry_type = 'private_feedback';
  }
  body.email_marketing_consent = body.email_marketing_consent === 'yes' ? 'yes' : 'no';
  body.privacy_notice_version = 'phase8-batch6-2026-09-28';
  body.timestamp = new Date().toISOString();
  body.submission_id = crypto.randomUUID();

  if (isNonProductionRequest(request)) return previewResponse();
  const webhookUrl = kind === 'quote' ? env.QUOTE_FORM_WEBHOOK : kind === 'contact' ? env.CONTACT_FORM_WEBHOOK : env.FEEDBACK_WEBHOOK;
  if (!webhookUrl || (kind === 'contact' && [env.QUOTE_FORM_WEBHOOK, env.QUICK_FORM_WEBHOOK, env.DISCOUNT_FORM_WEBHOOK].includes(webhookUrl))) {
    return json({ error: 'This form is temporarily unavailable. Please contact HQC directly.' }, 503);
  }
  try {
    if (new URL(webhookUrl).protocol !== 'https:') throw new Error('Invalid webhook configuration');
    const response = await fetch(webhookUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error('Webhook rejected submission');
    const result = await response.json().catch(() => null);
    if (result?.ok === false || result?.success === false || result?.error) throw new Error('Webhook reported failure');
    return json({ ok: true, submission_id: body.submission_id }, 200);
  } catch {
    // Do not expose webhook URLs, customer details or provider errors in logs/responses.
    return json({ error: 'We could not confirm receipt. Please contact HQC before submitting again.' }, 502);
  }
}
