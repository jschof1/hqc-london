export function isNonProductionRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname.toLowerCase();
  return !['highqualityclean.co.uk', 'www.highqualityclean.co.uk'].includes(hostname);
}

export function previewResponse(): Response {
  return new Response(JSON.stringify({
    ok: true,
    preview: true,
    message: 'Preview submission accepted for interface testing only; no notification was sent.'
  }), {
    status: 202,
    headers: { 'Content-Type': 'application/json' }
  });
}
