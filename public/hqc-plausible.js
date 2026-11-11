(() => {
  const domain = 'highqualityclean.co.uk';
  if (!['highqualityclean.co.uk', 'www.highqualityclean.co.uk'].includes(location.hostname)) return;
  if (window.hqcPlausibleLoaded) return;
  window.hqcPlausibleLoaded = true;

  // Do not transmit query strings, fragments, contact details or form fields.
  const cleanUrl = (value) => {
    try { const url = new URL(value); return url.origin + url.pathname; }
    catch { return null; }
  };
  const track = (name) => {
    try {
      if (window.localStorage.getItem('plausible_ignore') === 'true') return;
    } catch { /* Analytics does not require storage. */ }
    fetch('https://analytics.aspectstudio.net/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ n: name, d: domain, u: cleanUrl(location.href), r: cleanUrl(document.referrer) }),
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {});
  };
  track('pageview');
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href); } catch { return; }
    if (url.protocol === 'tel:') track('Website Phone Click');
    else if (url.protocol === 'mailto:') track('Website Email Click');
    else if (url.protocol === 'https:' && ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname)) {
      track('Website WhatsApp Click');
    }
  });
  // Existing hooks fire only after the server confirms acceptance, excluding previews.
  window.addEventListener('hqc:conversion', (event) => {
    const detail = event.detail || {};
    if (detail.event === 'form_submit' || ['/api/quick-form', '/api/quick-form/', '/api/discount', '/api/discount/'].includes(detail.endpoint)) {
      track('Website Enquiry Accepted');
    }
  });
})();
