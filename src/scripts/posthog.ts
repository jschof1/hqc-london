import type { PostHog, CaptureResult } from 'posthog-js';

declare global {
  interface Window {
    posthog?: PostHog;
    hqcCookiePreferences?: { analytics: boolean };
  }
}

const projectToken = import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = import.meta.env.PUBLIC_POSTHOG_HOST;
const productionHosts = new Set(['highqualityclean.co.uk', 'www.highqualityclean.co.uk']);
const isProduction = productionHosts.has(location.hostname);
const isPreview = location.hostname.endsWith('.hqc-london.pages.dev') || location.hostname === 'hqc-london.pages.dev';
const configured = Boolean(projectToken) && apiHost === 'https://eu.i.posthog.com';
const siteEnvironment = isProduction ? 'production' : 'preview';
const hasConsent = () => window.hqcCookiePreferences?.analytics === true;

const allowedEvents = new Set([
  '$pageview', 'quick_form_submitted', 'quote_submitted', 'contact_form_submitted',
  'discount_claim_submitted', 'feedback_rating_selected', 'google_review_started',
  'feedback_submitted', 'enquiry_route_selected', 'phone_click', 'whatsapp_click',
  'find_my_service', 'request_quote', 'primary_cta', 'secondary_cta',
  'conversion_prompt_view', 'service_selector_result',
]);

// SDK-added URL, campaign, person and session-entry properties can contain
// enquiry data. Keep only this explicit set of technical and categorical fields.
const technicalProperties = new Set([
  'token', 'distinct_id', '$device_id', '$session_id', '$window_id', '$lib',
  '$lib_version', '$browser', '$browser_version', '$os', '$os_version',
  '$device_type', '$screen_height', '$screen_width', '$viewport_height',
  '$viewport_width', '$is_identified', '$process_person_profile',
]);
const categories: Record<string, Set<string>> = {
  route: new Set(['residential', 'commercial', 'complex']),
  quote_flow: new Set(['routed', 'detailed']),
  form_source: new Set(['areas_page', 'process_page', 'services_page', 'why_us_page', 'offer_component', 'website_form']),
  service_type: new Set(['Residential', 'Commercial', 'home', 'commercial']),
  result: new Set(['maintain', 'restore', 'professional']),
  trigger: new Set(['exit_intent', 'mobile_scroll']),
};

function sanitizeEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event || !hasConsent() || !allowedEvents.has(event.event)) return null;
  const input = event.properties || {};
  const properties: Record<string, unknown> = {};
  for (const key of technicalProperties) {
    if (input[key] !== undefined) properties[key] = input[key];
  }
  for (const [key, values] of Object.entries(categories)) {
    if (values.has(input[key])) properties[key] = input[key];
  }
  const rating = Number(input.rating);
  if (Number.isInteger(rating) && rating >= 1 && rating <= 5) properties.rating = rating;
  Object.assign(properties, {
    $current_url: location.origin + location.pathname,
    $pathname: location.pathname,
    $geoip_disable: true,
    site_environment: siteEnvironment,
    tracking_version: 'hqc-posthog-v1',
  });
  event.properties = properties;
  return event;
}

let client: PostHog | undefined;
let loading: Promise<void> | undefined;
let lastPage = '';

function capturePageview() {
  if (!client || !hasConsent() || lastPage === location.pathname) return;
  lastPage = location.pathname;
  client.capture('$pageview');
}

async function applyPreferences() {
  if (!configured || (!isProduction && !isPreview)) return;
  if (!hasConsent()) {
    client?.opt_out_capturing();
    client?.set_config({ disable_persistence: true });
    client?.reset();
    lastPage = '';
    return;
  }
  if (!client) {
    // Import the SDK only after consent. Recheck after download in case the
    // visitor withdrew consent while it was loading.
    loading ||= import('posthog-js').then(({ default: posthog }) => {
      if (!hasConsent()) return;
      client = posthog.init(projectToken, {
        api_host: apiHost,
        defaults: '2026-05-30',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_exceptions: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_flags: true,
        person_profiles: 'never',
        opt_out_capturing_by_default: true,
        before_send: sanitizeEvent,
      });
      window.posthog = client;
    }).catch(() => {
      // Analytics failure must never prevent the visitor from sending an enquiry.
    }).finally(() => { loading = undefined; });
    await loading;
  }
  if (!client || !hasConsent()) return;
  client.set_config({ disable_persistence: false });
  client.opt_in_capturing();
  capturePageview();
}

// Existing consent-aware Umami/dataLayer events continue unchanged. Form
// events already have explicit PostHog captures at their success boundaries.
window.addEventListener('hqc:conversion', ((event: CustomEvent) => {
  const { event: name, ...properties } = event.detail || {};
  if (!client || !hasConsent() || !allowedEvents.has(name)) return;
  if (['quote_submitted', 'quick_form_submitted', 'discount_claim_submitted', 'enquiry_route_selected'].includes(name)) return;
  client.capture(name, properties);
}) as EventListener);
window.addEventListener('hqc:cookie-preferences-updated', applyPreferences);
document.addEventListener('astro:page-load', capturePageview);
window.addEventListener('popstate', capturePageview);
void applyPreferences();
