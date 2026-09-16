export function isNonProductionRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname.toLowerCase();
  return ['localhost', '127.0.0.1', '::1'].includes(hostname) || hostname.endsWith('.pages.dev');
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
