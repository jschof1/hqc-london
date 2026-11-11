// Homepage motion engine. Dependency-free and presentation-only: it never changes copy.
// The inline gate in index.astro adds `hqc-motion` to <html> before first paint when
// reduced motion is off; without JavaScript, or if this module fails, everything stays visible.
// The hero intro is pure CSS (data-intro), so the headline and actions never wait for this module.
// Parallax runs on the CSS scroll timeline (home-motion.css), not here.

declare global {
  interface Window { __hqcMotion?: boolean }
}

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionOn = () => root.classList.contains('hqc-motion') && !reduceMotion.matches;

function initReveals() {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    const count = group.children.length;
    // Cap a group's total stagger at 300ms so late items never trail a quick scroll.
    const step = Math.min(Number(group.dataset.stagger) || 80, count > 1 ? 300 / (count - 1) : 0);
    Array.from(group.children).forEach((child, i) => {
      const el = child as HTMLElement;
      el.style.setProperty('--d', `${i * step}ms`);
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', group.dataset.staggerType || 'up');
    });
  });

  // Start slightly before an element enters, so nothing is caught mid-fade at normal speed.
  const options = { rootMargin: '0px 0px 6% 0px', threshold: 0 };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, options);
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.parentElement?.hasAttribute('data-stagger-together')) return; // revealed with the group
    io.observe(el);
  });
  const groupIo = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      Array.from(entry.target.children).forEach((child) => child.classList.add('is-in'));
      groupIo.unobserve(entry.target);
    }
  }, options);
  document.querySelectorAll<HTMLElement>('[data-stagger-together]').forEach((group) => groupIo.observe(group));

  // Anything already above the fold on load (restored scroll, anchors) shows at once.
  requestAnimationFrame(() => {
    document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => {
      if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in');
    });
  });
}

// Hero: the three routes steer the photograph. Autoplay only while the hero is on screen,
// the tab is visible and motion is allowed; hovering or focusing a route takes over.
function initHeroSlides() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const slides = Array.from(hero.querySelectorAll<HTMLElement>('[data-slide]'));
  const tabs = Array.from(hero.querySelectorAll<HTMLElement>('[data-slide-tab]'));
  if (slides.length < 2) return;
  const interval = 6500;
  hero.style.setProperty('--hm-slide-ms', `${interval}ms`);
  let current = 0;
  let timer = 0;
  let inView = true;
  let held = false;

  const show = (index: number) => {
    if (index === current) return;
    hero.classList.add('is-started');
    current = index;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    tabs.forEach((tab) => {
      const active = Number(tab.dataset.slideTab) === index;
      tab.classList.toggle('is-active', active);
      // Restart the tab timer animation.
      const bar = tab.querySelector<HTMLElement>('.hm-route-tab-timer');
      if (active && bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
  };
  const playing = () => motionOn() && inView && !held && document.visibilityState === 'visible';
  const schedule = () => {
    clearTimeout(timer);
    hero.classList.toggle('is-playing', playing());
    if (!playing()) return;
    timer = window.setTimeout(() => { show((current + 1) % slides.length); schedule(); }, interval);
  };

  tabs.forEach((tab) => {
    const index = Number(tab.dataset.slideTab);
    const take = () => { held = true; show(index); schedule(); };
    const release = () => { held = false; schedule(); };
    tab.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') take(); });
    tab.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse') release(); });
    tab.addEventListener('focus', take);
    tab.addEventListener('blur', release);
  });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: 0.25 }).observe(hero);
  document.addEventListener('visibilitychange', schedule);
  reduceMotion.addEventListener('change', schedule);
  schedule();
}

// Scroll-linked values: one rAF-throttled pass writes CSS custom properties; CSS does the drawing.
function initScrollLinked() {
  const progressBar = document.querySelector<HTMLElement>('[data-page-progress]');
  const tracks = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-track]'));
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const max = root.scrollHeight - vh;
    if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;

    for (const el of tracks) {
      let p: number;
      const pin = el.closest<HTMLElement>('[data-pin]');
      const stage = pin?.querySelector<HTMLElement>('[data-pin-stage]');
      if (pin && stage && getComputedStyle(stage).position === 'sticky') {
        // Pinned sequence: progress runs across the extra scroll height of the section.
        const rect = pin.getBoundingClientRect();
        const range = Math.max(1, rect.height - stage.offsetHeight);
        p = Math.min(1, Math.max(0, (80 - rect.top) / range));
      } else {
        // 0 when the element's top reaches 85% of the viewport, 1 when its bottom reaches 55%.
        const rect = el.getBoundingClientRect();
        const start = vh * 0.85;
        const end = vh * 0.55;
        p = Math.min(1, Math.max(0, (start - rect.top) / (rect.height + (start - end))));
      }
      el.style.setProperty('--p', p.toFixed(4));
      const steps = Array.from(el.querySelectorAll<HTMLElement>('[data-step]'));
      let current = -1;
      steps.forEach((step, i) => {
        const active = p >= i / steps.length; // step 01 leads from the first frame
        step.classList.toggle('is-active', active);
        if (active) current = i;
      });
      steps.forEach((step, i) => step.classList.toggle('is-current', i === current));
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();
}

// Mobile action dock: visible whenever the hero actions are out of view, hidden while the
// selector or the closing call to action is on screen, after the closing call to action, and
// while the cookie banner or help prompt is open.
function initDock() {
  const dock = document.querySelector<HTMLElement>('[data-action-dock]');
  const heroActions = document.querySelector<HTMLElement>('[data-hero-actions]');
  if (!dock || !heroActions) return;
  const blockers = Array.from(document.querySelectorAll<HTMLElement>('[data-dock-hide]'));
  const state = { heroActionsHidden: false, blocked: new Set<Element>() };
  const overlays = ['#conversion-prompt', '#hqc-cookie-banner'];
  const desktop = matchMedia('(min-width: 1280px)'); // tablets and small laptops keep the dock

  const overlayOpen = () => overlays.some((selector) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return false;
    const style = getComputedStyle(el);
    return !el.hidden && !el.classList.contains('hidden') && style.display !== 'none' && style.visibility !== 'hidden';
  });

  const render = () => {
    const show = !desktop.matches && state.heroActionsHidden && state.blocked.size === 0 && !overlayOpen();
    dock.classList.toggle('is-visible', show);
    dock.toggleAttribute('inert', !show);
    dock.setAttribute('aria-hidden', String(!show));
  };

  // A sliver of the hero buttons is not "in view": treat them as hidden below 60% visibility.
  new IntersectionObserver(([entry]) => {
    state.heroActionsHidden = entry.intersectionRatio < 0.6;
    render();
  }, { threshold: [0, 0.6, 1] }).observe(heroActions);

  const blockIo = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const after = (entry.target as HTMLElement).dataset.dockHide === 'after' && entry.boundingClientRect.top < 0;
      if (entry.isIntersecting || after) state.blocked.add(entry.target);
      else state.blocked.delete(entry.target);
    }
    render();
  }, { threshold: 0.15 });
  blockers.forEach((el) => blockIo.observe(el));

  const mo = new MutationObserver(render);
  overlays.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) mo.observe(el, { attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
  });
  desktop.addEventListener('change', render);
  // Jumps and restored scroll positions skip observer transitions: re-check "after" blockers on scroll.
  addEventListener('scroll', () => {
    let changed = false;
    for (const el of blockers) {
      if (el.dataset.dockHide !== 'after') continue;
      const block = el.getBoundingClientRect().top < innerHeight;
      if (block !== state.blocked.has(el)) {
        if (block) state.blocked.add(el);
        else state.blocked.delete(el);
        changed = true;
      }
    }
    if (changed) render();
  }, { passive: true });
  render();
}

// Reduced motion: the shared site script always smooth-scrolls in-page anchors. On the homepage,
// finish that scroll instantly instead. Nothing is cancelled or stopped, so analytics and the
// shared handler still see the click.
function initReducedMotionAnchors() {
  document.addEventListener('click', (event) => {
    if (!reduceMotion.matches) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    const href = link?.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    setTimeout(() => window.scrollTo({ top: target.offsetTop - 80, behavior: 'instant' }), 0);
  }, true);
}

function start() {
  try {
    if (motionOn()) initReveals();
  } catch (error) {
    root.classList.remove('hqc-motion'); // never leave content hidden
    console.error(error);
  } finally {
    window.__hqcMotion = true;
  }
  initReducedMotionAnchors();
  initHeroSlides();
  initScrollLinked();
  initDock();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();

reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) root.classList.remove('hqc-motion');
});

export {};
