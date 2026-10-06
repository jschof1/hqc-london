import { dataset, endpoint, payload, safePath, pageType, previewDomain, services } from './analytics-contract.js';

// No storage, replay, visitor identifiers, form values or pre-consent queue.
if (dataset(location.hostname)) {
  const seen = new Set();
  const forms = new Map();
  const pendingForms = new Map();
  const inFlight = new Set();
  let enabled = false;
  let activeSeconds = 0;
  let lastActivity = 0;
  let lastTick = performance.now();
  let totalEvents = 0;
  let selectedRoute = null;
  const formIds = { 'routed-quote-form': 'quote', 'contact-form': 'contact', 'feedback-form': 'feedback', 'discount-form': 'discount', 'quote-multi-step-form': 'legacy_quote' };
  const allowedNow = () => {
    try {
      return enabled && window.hqcCookiePreferences?.analytics === true && localStorage.getItem('plausible_ignore') !== 'true'
        && !(location.hostname !== previewDomain && navigator.webdriver);
    } catch { return false; }
  };
  function send(name, props = {}, once) {
    if (!allowedNow() || totalEvents >= 180 || (once && seen.has(once))) return;
    const body = payload(name, props, location, document.referrer);
    if (!body) return;
    if (once) seen.add(once);
    totalEvents++;
    const controller = new AbortController();
    inFlight.add(controller);
    // No retries: analytics failure never changes form behaviour or creates duplicates.
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' },
      credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
      signal: controller.signal, body: JSON.stringify(body) })
      .catch(() => {}).finally(() => inFlight.delete(controller));
  }
  function route(form) {
    if (form.id === 'routed-quote-form') return document.querySelector('.route-tab[aria-selected="true"]')?.dataset.route || 'unspecified';
    if (form.id === 'discount-form') return ({home: 'residential', commercial: 'commercial'})[form.querySelector('[name="type"]')?.value] || 'unspecified';
    return 'unspecified';
  }
  function formState(form) {
    const type = formIds[form?.id] || (form?.hasAttribute('data-hqc-form') ? 'quick' : null);
    if (!type) return null;
    const key = `${type}:${route(form)}`;
    if (!forms.has(key)) forms.set(key, { form: type, route: route(form), started: false, finished: false, abandoned: false, attempts: 0, steps: new Set(), validations: new Set() });
    const state = forms.get(key);
    const choice = form.querySelector('[name="service"]')?.value;
    state.service = Object.hasOwn(services, choice) ? services[choice] : undefined;
    return state;
  }
  function start(state) {
    if (!state || !allowedNow()) return;
    if (state.abandoned || (state.finished && !state.pending)) { state.started = false; state.finished = false; state.abandoned = false; state.steps.clear(); state.validations.clear(); }
    if (!state.started) { state.started = true; send('form_started', state); }
  }
  function stepFor(field) {
    const name = field?.name || '';
    if (['name', 'firstName', 'lastName', 'email', 'phone', 'first_name', 'last_name'].includes(name)) return 'identity';
    if (['service', 'service_type', 'type', 'frequency'].includes(name)) return 'service';
    if (['address', 'postcode', 'size', 'bedrooms', 'bathrooms'].includes(name)) return 'property';
    if (['details', 'message', 'feedback', 'summary', 'desired_date', 'checkout_date', 'inspection_date', 'move_in_date', 'operating_hours', 'tupe_context', 'mobilisation_requirements'].includes(name)) return 'requirements';
    if (['email_marketing_consent', 'consent'].includes(name)) return 'permission';
    return 'other';
  }
  function stage(detail) {
    if (!allowedNow()) return;
    const form = detail?.form instanceof HTMLFormElement ? detail.form : document.getElementById(detail?.id);
    const state = detail.stage === 'attempted' ? formState(form) : pendingForms.get(form);
    if (!state) return;
    start(state);
    const props = detail.stage === 'attempted' ? { form: state.form, route: state.route, service: state.service } : state.attemptProps;
    if (detail.stage === 'attempted') {
      if (state.pending) return;
      state.attemptProps = props;
      pendingForms.set(form, state);
      state.attempts++; state.pending = true; state.finished = false; state.abandoned = false;
      send('form_attempted', props);
    } else if (['receipt', 'preview', 'error'].includes(detail.stage) && state.pending) {
      pendingForms.delete(form);
      state.pending = false;
      state.finished = detail.stage !== 'error';
      send(`form_${detail.stage}`, { ...props, reason: detail.stage === 'error' ? detail.reason || 'receipt_unconfirmed' : undefined });
    }
  }
  window.addEventListener('hqc:form-stage', event => stage(event.detail));
  document.addEventListener('focusin', event => {
    if (!allowedNow() || !event.target?.form) return;
    const state = formState(event.target.form);
    start(state);
    if (!state) return;
    const step = stepFor(event.target);
    if (!state.steps.has(step)) { state.steps.add(step); send('form_step', { ...state, step }); }
  });
  document.addEventListener('change', event => {
    if (!allowedNow() || event.target?.id !== 'service-options') return;
    const state = formState(event.target.form); start(state);
    if (state?.service) send('quote_service_selected', state, `service:${state.route}:${state.service}`);
  });
  document.addEventListener('invalid', event => {
    if (!allowedNow()) return;
    const state = formState(event.target.form); start(state); if (!state) return;
    const step = stepFor(event.target);
    const reason = event.target.validity.valueMissing ? 'required' : event.target.validity.typeMismatch || event.target.validity.patternMismatch ? 'format' : 'constraint';
    const key = `${state.attempts}:${step}:${reason}`;
    if (!state.validations.has(key)) { state.validations.add(key); send('form_validation', { ...state, step, reason }); }
  }, true);
  window.addEventListener('hqc:conversion', event => {
    const detail = event.detail || {};
    if (detail.event === 'enquiry_route_selected' && allowedNow()) {
      const previous = forms.get(`quote:${selectedRoute}`);
      if (previous?.started && !previous.finished && !previous.abandoned && !previous.pending && selectedRoute !== detail.route) {
        previous.abandoned = true; send('form_abandoned', { ...previous, reason: 'route_changed' });
      }
      selectedRoute = detail.route;
      send('quote_route_selected', { route: detail.route }, `route:${detail.route}`);
    }
    if (detail.event === 'service_selector_result') send('service_selector_selected', { result: detail.result }, `selector:${detail.result}`);
    const offer = { essential_offer_impression: 'offer_impression', essential_offer_dismissal: 'offer_dismissed', essential_offer_cta_suitability: 'offer_clicked', essential_offer_cta_book: 'offer_clicked' };
    if (offer[detail.event]) send(offer[detail.event], { placement: 'offer' }, detail.event);
  });
  const placement = element => element.closest('header, nav') ? 'header' : element.closest('footer') ? 'footer' : element.closest('#hqc-essential-offer') ? 'offer' : element.closest('main') ? 'main' : 'other';
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element) || !allowedNow()) return;
    const menu = event.target.closest('button[aria-controls]');
    const menuName = { 'property-menu-toggle': 'property', 'workplaces-menu-toggle': 'workplaces', 'homes-menu-toggle': 'homes', 'mobile-menu-toggle': 'mobile' }[menu?.id];
    if (menuName && menu.getAttribute('aria-expanded') === 'true') send('menu_opened', { menu: menuName }, `menu:${menuName}`);
    if (event.target.closest('#private-feedback-toggle')?.getAttribute('aria-expanded') === 'true') send('private_feedback_opened', {}, 'private-feedback');
    const link = event.target.closest('a[href]'); if (!link) return;
    let url; try { url = new URL(link.getAttribute('href'), location.href); } catch { return; }
    const internal = url.origin === location.origin;
    const destination = internal ? safePath(url.pathname) : undefined;
    let category = 'external';
    if (url.protocol === 'tel:') category = 'phone';
    else if (url.protocol === 'mailto:') category = 'email';
    else if (['wa.me', 'api.whatsapp.com'].includes(url.hostname)) category = 'whatsapp';
    else if (link.id === 'google-review-link') category = 'google_review';
    else if (url.hostname === 'highqualitycleanlimited.launch27.com') category = 'booking';
    else if (internal) {
      const type = pageType(destination);
      category = url.pathname === location.pathname && url.hash ? 'anchor' : ['quote', 'booking', 'service', 'location'].includes(type) ? type : 'internal';
    }
    if (link.hasAttribute('download')) category = 'download';
    const props = { category, placement: placement(link), destination };
    // Identical destinations are counted once per document, not once per rapid tap.
    const key = `link:${category}:${props.placement}:${destination || ''}`;
    send(category === 'booking' && !internal ? 'booking_fallback_clicked' : ['internal', 'service', 'location', 'anchor'].includes(category) ? 'navigation_clicked' : 'cta_clicked', props, key);
  });
  document.querySelectorAll('main details').forEach((element, index) => {
    element.addEventListener('toggle', () => { if (element.open) send('faq_opened', { item: String(index + 1) }, `faq:${index}`); });
  });
  const sections = [...document.querySelectorAll('main section')].slice(0, 20);
  const observer = new IntersectionObserver(entries => {
    if (!allowedNow()) return;
    for (const entry of entries) if (entry.isIntersecting && lastActivity > 0) {
      const item = String(sections.indexOf(entry.target) + 1);
      send('content_viewed', { item }, `content:${item}`);
    }
  }, { threshold: 0.2 });
  function observeSections() { observer.disconnect(); if (enabled) sections.forEach(section => observer.observe(section)); }
  function activity() {
    if (!allowedNow()) return;
    const first = lastActivity === 0;
    lastActivity = performance.now();
    if (first) observeSections();
  }
  for (const event of ['pointerdown', 'keydown', 'scroll']) document.addEventListener(event, activity, { passive: true });
  let scrollPending = false;
  document.addEventListener('scroll', () => {
    if (scrollPending || !allowedNow()) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      scrollPending = false;
      const available = document.documentElement.scrollHeight - innerHeight;
      if (available <= 0) return;
      const depth = scrollY / available * 100;
      for (const milestone of [25, 50, 75, 90]) if (depth >= milestone) send('scroll_depth', { depth: String(milestone) }, `scroll:${milestone}`);
    });
  }, { passive: true });
  setInterval(() => {
    const now = performance.now();
    if (allowedNow() && document.visibilityState === 'visible' && lastActivity > 0 && now - lastActivity <= 30000) {
      activeSeconds += Math.min(1.5, (now - lastTick) / 1000);
      for (const seconds of [15, 30, 60, 120]) if (activeSeconds >= seconds) send('active_engagement', { seconds: String(seconds) }, `active:${seconds}`);
    }
    lastTick = now;
  }, 1000);
  window.addEventListener('pagehide', () => {
    for (const state of forms.values()) if (state.started && !state.finished && !state.abandoned) {
      state.abandoned = true; send('form_abandoned', { ...state, reason: 'page_exit' });
    }
  });
  function consent() {
    enabled = window.hqcCookiePreferences?.analytics === true;
    if (!enabled) {
      for (const controller of inFlight) controller.abort();
      inFlight.clear(); forms.clear(); pendingForms.clear(); activeSeconds = 0; lastActivity = 0;
    } else {
      send('pageview', {}, 'pageview');
      const quoteForm = document.getElementById('routed-quote-form');
      if (quoteForm) {
        selectedRoute = route(quoteForm); send('quote_route_selected', { route: selectedRoute }, `route:${selectedRoute}`);
        const state = formState(quoteForm);
        if (state?.service) send('quote_service_selected', state, `service:${state.route}:${state.service}`);
      }
      if (pageType(safePath(location.pathname)) === 'booking') send('booking_page_viewed', {}, 'booking-page');
    }
    observeSections();
  }
  window.addEventListener('hqc:cookie-preferences-updated', consent);
  // A second tab can withdraw consent too; never wait for a reload.
  window.addEventListener('storage', event => {
    if (event.key !== 'hqc:cookie-preferences:v1' && event.key !== null) return;
    try { const saved = JSON.parse(localStorage.getItem('hqc:cookie-preferences:v1') || 'null'); window.hqcCookiePreferences = { analytics: saved?.version === 1 && saved.analytics === true }; }
    catch { window.hqcCookiePreferences = { analytics: false }; }
    consent();
  });
  consent();
}
