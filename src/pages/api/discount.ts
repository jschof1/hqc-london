import type { APIRoute } from 'astro';
import siteSettings from '../../data/site-settings.json';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env;
  const webhookUrl = env?.DISCOUNT_FORM_WEBHOOK ?? siteSettings.discountFromWebhook;
  if (!webhookUrl) {
    return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const body = await request.json();
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return new Response(text || undefined, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
    });
  } catch (e) {
    console.error('Discount form webhook error:', e);
    return new Response(JSON.stringify({ error: 'Submission failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
