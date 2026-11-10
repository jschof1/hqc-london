// Homepage motion engine. Dependency-free and presentation-only: it never changes copy.
// The inline gate in index.astro adds `hqc-motion` to <html> before first paint when
// reduced motion is off; without JavaScript, or if this module fails, everything stays visible.

declare global {
  interface Window { __hqcMotion?: boolean }
}

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const motionOn = () => root.classList.contains('hqc-motion') && !reduceMotion.matches;

window.__hqcMotion = true;

// Split display headings into masked words. Text nodes are wrapped in place, so
// textContent, element order and nested emphasis stay exactly as authored.
function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = '1';
  let index = 0;
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? '').split(/(\s+)/);
        if (parts.every((part) => !part.trim())) continue;
        const fragment = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (!part.trim()) {
            fragment.append(document.createTextNode(part));
            continue;
          }
          const outer = document.createElement('span');
          outer.className = 'hm-word';
          const inner = document.createElement('span');
          inner.className = 'hm-word-inner';
          inner.style.setProperty('--w', String(index++));
          inner.textContent = part;
          outer.append(inner);
          fragment.append(outer);
        }
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== 'BR') {
        walk(child);
      }
    }
  };
  walk(el);
}

function initReveals() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach(splitWords);
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    const step = Number(group.dataset.stagger) || 80;
    const startAt = Number(group.dataset.staggerStart) || 0;
    Array.from(group.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty('--d', `${startAt + i * step}ms`);
      if (!(child as HTMLElement).hasAttribute('data-reveal')) (child as HTMLElement).setAttribute('data-reveal', group.dataset.staggerType || 'up');
    });
  });

  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-split]');
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  targets.forEach((el) => {
    if (el.closest('[data-hero]')) return; // hero choreography starts immediately
    if (el.parentElement?.hasAttribute('data-stagger-together')) return; // revealed with the group
    io.observe(el);
  });
  const groupIo = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      Array.from(entry.target.children).forEach((child) => child.classList.add('is-in'));
      groupIo.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  document.querySelectorAll<HTMLElement>('[data-stagger-together]').forEach((group) => groupIo.observe(group));

  // Hero plays on load, without waiting for observers, so first paint is never delayed.
  requestAnimationFrame(() => {
    document.querySelectorAll<HTMLElement>('[data-hero] [data-reveal], [data-hero] [data-split]').forEach((el) => el.classList.add('is-in'));
    document.querySelector('[data-hero]')?.classList.add('is-in');
  });
}

// Scroll-linked values: one rAF loop writes CSS custom properties; CSS does the drawing.
function initScrollLinked() {
  const progressBar = document.querySelector<HTMLElement>('[data-page-progress]');
  const parallax = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  const tracks = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-track]'));
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const max = root.scrollHeight - vh;
    if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;

    for (const el of tracks) {
      const rect = el.getBoundingClientRect();
      // 0 when the element's top reaches 85% of the viewport, 1 when its bottom reaches 55%.
      const start = vh * 0.85;
      const end = vh * 0.55;
      const total = rect.height + (start - end);
      const p = Math.min(1, Math.max(0, (start - rect.top) / total));
      el.style.setProperty('--p', p.toFixed(4));
      const steps = el.querySelectorAll<HTMLElement>('[data-step]');
      steps.forEach((step, i) => step.classList.toggle('is-active', p >= (i + 0.35) / steps.length));
    }

    if (!motionOn() || !finePointer.matches) return;
    for (const el of parallax) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) continue;
      const speed = Number(el.dataset.parallax) || 0.08;
      const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
      el.style.setProperty('--py', `${offset.toFixed(1)}px`);
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

// Spotlight and magnetic pull, for precise pointers only.
function initPointer() {
  if (!finePointer.matches) return;
  document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      el.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
  if (!motionOn()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.28;
      el.style.setProperty('--mgx', `${x.toFixed(1)}px`);
      el.style.setProperty('--mgy', `${y.toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--mgx', '0px');
      el.style.setProperty('--mgy', '0px');
    });
  });
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -4;
      const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

// Count up figures that are already rendered; the final text is the authored text.
function initCounts() {
  if (!motionOn()) return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      const el = entry.target as HTMLElement;
      const final = el.textContent ?? '';
      const target = Number(final);
      if (!Number.isFinite(target) || target <= 0) continue;
      const started = performance.now();
      const duration = 900 + target * 120;
      const frame = (now: number) => {
        const t = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = t < 1 ? String(Math.max(0, Math.round(eased * target))) : final;
        if (t < 1) requestAnimationFrame(frame);
      };
      el.textContent = '0';
      requestAnimationFrame(frame);
    }
  }, { threshold: 0.6 });
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => io.observe(el));
}

// Mobile action dock: visible once the hero actions leave view, hidden while the
// selector or the closing call to action is on screen, or while another bottom layer is open.
function initDock() {
  const dock = document.querySelector<HTMLElement>('[data-action-dock]');
  const heroActions = document.querySelector<HTMLElement>('[data-hero-actions]');
  if (!dock || !heroActions) return;
  const blockers = Array.from(document.querySelectorAll<HTMLElement>('[data-dock-hide]'));
  const state = { pastHero: false, blocked: new Set<Element>() };
  const overlays = ['#conversion-prompt', '#hqc-cookie-banner'];

  const overlayOpen = () => overlays.some((selector) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return false;
    const style = getComputedStyle(el);
    return !el.hidden && !el.classList.contains('hidden') && style.display !== 'none' && style.visibility !== 'hidden';
  });

  const render = () => {
    const show = state.pastHero && state.blocked.size === 0 && !overlayOpen();
    dock.classList.toggle('is-visible', show);
    dock.toggleAttribute('inert', !show);
    dock.setAttribute('aria-hidden', String(!show));
  };

  new IntersectionObserver(([entry]) => {
    state.pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    render();
  }).observe(heroActions);

  const blockIo = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      // data-dock-hide="after" keeps the dock away once the visitor has scrolled past it
      // (the closing call to action and footer already carry the same actions).
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
  render();
}

function start() {
  if (motionOn()) initReveals();
  initScrollLinked();
  initPointer();
  initCounts();
  initDock();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();

reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) root.classList.remove('hqc-motion');
});

export {};
