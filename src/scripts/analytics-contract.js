import paths from '../data/analytics-paths.json';

export const previewDomain = 'phase8-2026-09-28-staging.hqc-london.pages.dev';
export const endpoint = 'https://analytics.aspectstudio.net/api/event';
export const formStages = ['started', 'step', 'validation', 'attempted', 'receipt', 'preview', 'error', 'abandoned'];
export const eventNames = [
  'pageview', ...formStages.map(stage => `form_${stage}`), 'quote_route_selected', 'quote_service_selected',
  'cta_clicked', 'navigation_clicked', 'menu_opened', 'service_selector_selected',
  'faq_opened', 'content_viewed', 'scroll_depth', 'active_engagement',
  'booking_page_viewed', 'booking_fallback_clicked', 'private_feedback_opened',
  'offer_impression', 'offer_dismissed', 'offer_clicked'
];
const knownPaths = new Set(paths);
export function safePath(path) {
  const clean = path.toLowerCase().replace(/\/+$/, '') + '/';
  return knownPaths.has(clean) ? clean : '/other/';
}
export function dataset(host) {
  if (['highqualityclean.co.uk', 'www.highqualityclean.co.uk'].includes(host)) return 'highqualityclean.co.uk';
  return host === previewDomain ? previewDomain : null;
}
export function pageType(path) {
  if (path === '/') return 'home';
  if (path.startsWith('/locations/')) return 'location';
  if (/quote/.test(path)) return 'quote';
  if (/book-essential/.test(path)) return 'booking';
  if (/contact|feedback|discount/.test(path)) return path.split('/')[1];
  if (/faq/.test(path)) return 'faq';
  if (/privacy|terms|disclaimer/.test(path)) return 'legal';
  if (/cleaning|essential-clean|services/.test(path)) return 'service';
  return path === '/other/' ? 'other' : 'content';
}
export const services = {
  "Essential Clean™ suitability": "essential_clean",
  "Deep Clean™": "deep_clean",
  "Move-In Reset™": "move_in",
  "End of Tenancy™": "end_of_tenancy",
  "Post-Construction™": "post_construction",
  "Other residential requirement": "other_residential",
  "Communal Area Cleaning": "communal",
  "Agency or Portfolio Support": "portfolio",
  "Move-In and Void Property Cleaning": "move_in_void",
  "Other property requirement": "other_property",
  "Office Cleaning": "office",
  "Commercial Cleaning": "commercial",
  "Commercial Deep Cleaning": "commercial_deep",
  "Other professional requirement": "other_professional",
  "Large or Executive Property": "executive_property",
  "Office or Workplace Project": "workplace_project",
  "Commercial Deep-Clean Project": "commercial_deep_project",
  "Communal Site Assessment": "communal_assessment",
  "Post-Construction Project": "post_construction_project",
  "Multi-Site or Portfolio Project": "multi_site",
  "Other Complex Requirement": "other_complex"
};
const allowed = {
  service: Object.values(services),
  form: ['quote', 'contact', 'feedback', 'discount', 'legacy_quote', 'quick'],
  route: ['residential', 'property', 'commercial', 'complex', 'unspecified'],
  step: ['identity', 'service', 'property', 'requirements', 'permission', 'other'],
  reason: ['required', 'format', 'constraint', 'receipt_unconfirmed', 'server_validation', 'route_changed', 'page_exit'],
  category: ['quote', 'booking', 'phone', 'email', 'whatsapp', 'google_review', 'service', 'location', 'internal', 'external', 'anchor', 'download'],
  placement: ['header', 'footer', 'offer', 'main', 'other'],
  result: ['maintain', 'restore', 'professional'],
  menu: ['property', 'workplaces', 'homes', 'mobile'],
  depth: ['25', '50', '75', '90'],
  seconds: ['15', '30', '60', '120'],
  item: Array.from({length: 100}, (_, i) => String(i + 1)),
};
export function safeProps(raw = {}) {
  const result = {};
  for (const [key, values] of Object.entries(allowed)) {
    if (values.includes(String(raw[key]))) result[key] = String(raw[key]);
  }
  if (typeof raw.destination === 'string' && knownPaths.has(raw.destination)) result.destination = raw.destination;
  return result;
}
// The installed CE 2.0 manual script copies document.referrer verbatim. Use its
// verified event protocol with a sanitized URL, referrer and HTTP referrer policy.
export function payload(name, raw, location, referrer = '') {
  const domain = dataset(location.hostname);
  if (!domain || !eventNames.includes(name) || (name === 'form_preview' && domain !== previewDomain)) return null;
  const path = safePath(location.pathname);
  let source = null;
  try {
    const host = new URL(referrer).hostname;
    // Only known public sources; unknown referrers are intentionally omitted.
    if (['google.com', 'www.google.com', 'google.co.uk', 'www.google.co.uk', 'bing.com', 'www.bing.com', 'facebook.com', 'www.facebook.com', 'l.facebook.com', 'instagram.com', 'www.instagram.com', 'linkedin.com', 'www.linkedin.com'].includes(host)) source = `https://${host}/`;
  } catch { /* No referrer. */ }
  return { n: name, u: `https://${domain}${path}`, d: domain, r: source,
    p: { ...safeProps(raw), page_type: pageType(path), environment: domain === previewDomain ? 'staging' : 'production' } };
}
