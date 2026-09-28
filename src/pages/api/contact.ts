import type { APIRoute } from 'astro';
import { isNonProductionRequest, previewResponse } from '../../lib/preview';

// General and administrative contact must not enter the qualified sales pipeline.
// A distinct GHL routing endpoint is required before this route can be enabled live.
export const POST: APIRoute = async ({ request, locals }) => {
  if (isNonProductionRequest(request)) return previewResponse();
  const env = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env;
  if (!env?.CONTACT_FORM_WEBHOOK) {
    return new Response(JSON.stringify({ error: 'Contact route not configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const body = await request.json();
    const response = await fetch(env.CONTACT_FORM_WEBHOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Contact webhook returned ${response.status}`);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Contact routing failed:', error);
    return new Response(JSON.stringify({ error: 'Contact submission failed' }), {
      status: 502, headers: { 'Content-Type': 'application/json' }
    });
  }
};
