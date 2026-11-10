// Homepage motion engine. Dependency-free and presentation-only: it never changes copy.
// The inline gate in index.astro adds `hqc-motion` to <html> before first paint when
// reduced motion is off; without JavaScript, or if this module fails, everything stays visible.
// The hero intro is pure CSS (data-intro), so the headline and actions never wait for this module.

declare global {
  interface Window { __hqcMotion?: boolean }
}

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const motionOn = () => root.classList.contains('hqc-motion') && !reduceMotion.matches;

window.__hqcMotion = true;

// Split display headings into masked words. Text nodes are wrapped in place, so textContent,
// element order and nested emphasis stay exactly as authored. The heading keeps its authored text
// as its accessible name, so screen readers do not stop on each word.
function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = '1';
  const name = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (name && !el.hasAttribute('aria-label')) el.setAttribute('aria-label', name);
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
          outer.setAttribute('aria-hidden', 'true');
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

function reveal(el: Element) {
  el.classList.add('is-in');
  // Once the masked words have risen, release the mask so italic swashes and descenders show.
  if (el.hasAttribute('data-split')) setTimeout(() => el.classList.add('is-done'), 1500);
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

  const options = { rootMargin: '0px 0px -4% 0px', threshold: 0 };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target);
      io.unobserve(entry.target);
    }
  }, options);
  document.querySelectorAll<HTMLElement>('[data-reveal], [data-split]').forEach((el) => {
    if (el.parentElement?.hasAttribute('data-stagger-together')) return; // revealed with the group
    io.observe(el);
  });
  const groupIo = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      Array.from(entry.target.children).forEach(reveal);
      groupIo.unobserve(entry.target);
    }
  }, options);
  document.querySelectorAll<HTMLElement>('[data-stagger-together]').forEach((group) => groupIo.observe(group));
}

// Pause looping ambient animation while its section is off screen.
function initAmbient() {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.classList.toggle('is-paused', !entry.isIntersecting);
  });
  document.querySelectorAll<HTMLElement>('[data-ambient]').forEach((el) => io.observe(el));
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
        const active = p >= (i + 0.35) / steps.length;
        step.classList.toggle('is-active', active);
        if (active) current = i;
      });
      steps.forEach((step, i) => step.classList.toggle('is-current', i === current));
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

// Spotlight, magnetic pull and tilt, for precise pointers only.
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
      el.style.setProperty('--mgx', `${((event.clientX - rect.left - rect.width / 2) * 0.18).toFixed(1)}px`);
      el.style.setProperty('--mgy', `${((event.clientY - rect.top - rect.height / 2) * 0.28).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--mgx', '0px');
      el.style.setProperty('--mgy', '0px');
    });
  });
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--rx', `${(((event.clientY - rect.top) / rect.height - 0.5) * -4).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(((event.clientX - rect.left) / rect.width - 0.5) * 5).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

// Mobile action dock: visible whenever the hero actions are out of view (above or, on short
// phones, below), hidden while the selector or the closing call to action is on screen, after
// the closing call to action, and while the cookie banner or help prompt is open.
function initDock() {
  const dock = document.querySelector<HTMLElement>('[data-action-dock]');
  const heroActions = document.querySelector<HTMLElement>('[data-hero-actions]');
  if (!dock || !heroActions) return;
  const blockers = Array.from(document.querySelectorAll<HTMLElement>('[data-dock-hide]'));
  const state = { heroActionsHidden: false, blocked: new Set<Element>() };
  const overlays = ['#conversion-prompt', '#hqc-cookie-banner'];
  const desktop = matchMedia('(min-width: 1024px)');

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

  new IntersectionObserver(([entry]) => {
    state.heroActionsHidden = !entry.isIntersecting;
    render();
  }).observe(heroActions);

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
  render();
}

function start() {
  if (motionOn()) initReveals();
  initAmbient();
  initScrollLinked();
  initPointer();
  initDock();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();

reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) root.classList.remove('hqc-motion');
});

export {};
