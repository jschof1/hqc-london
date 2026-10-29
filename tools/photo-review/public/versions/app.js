const fragmentKey = (() => {
  const raw = location.hash.slice(1);
  if (raw) history.replaceState(null, '', location.pathname + location.search);
  try { return decodeURIComponent(raw).trim(); } catch { return ''; }
})();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

async function api(path, body) {
  const r = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });
  let v = null;
  try { v = await r.json(); } catch {}
  if (!r.ok) throw Object.assign(Error(v?.error || 'Something went wrong. Please try again.'), { status: r.status });
  if (v == null) throw Error('The server sent an unreadable response.');
  return v;
}

const uuid = () => crypto.randomUUID ? crypto.randomUUID()
  : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

const MODES = ['side', 'slider', 'toggle'];
const VIEWS = ['desktop', 'mobile'];
const ZOOMS = ['fit', 'actual'];
const AUTHORS = ['Pedro', 'Jack'];

let manifest, versions = [], pages = [];
let comments = [], revision = 0;
const sel = { before: '', after: '', page: '', view: 'desktop', mode: 'side', zoom: 'fit', flip: 'after', split: 50 };
const pending = new Map();
let saving = false;
const drafts = new Map();
const draftKey = () => `${sel.after}/${sel.page}`;


const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
function fmtDate(value, withTime = false) {
  if (!value) return '';
  const d = dateOnly.test(value) ? new Date(value + 'T12:00:00Z') : new Date(value);
  if (Number.isNaN(+d)) return String(value);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...(withTime && !dateOnly.test(value) ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: dateOnly.test(value) ? 'UTC' : 'Europe/London',
  }).format(d);
}
const shortCommit = c => (typeof c === 'string' && c ? c.slice(0, 7) : '');
const version = id => versions.find(v => v.id === id);
const page = id => pages.find(p => p.id === id);
const pageName = id => page(id)?.label || id || 'Unknown page';
const versionName = id => version(id)?.label || id || 'Unknown release';

function safeSrc(src) {
  if (typeof src !== 'string' || !src.startsWith('/') || src.startsWith('//') || src.includes('\\')) return null;
  return src;
}
function safeExternal(url) {
  try { const u = new URL(url); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
}
function capture(versionId, pageId, view) {
  const c = version(versionId)?.pages?.[pageId]?.[view];
  if (!c) return null;
  const src = safeSrc(c.src), width = Number(c.width), height = Number(c.height);
  if (!src || !(width > 0) || !(height > 0)) return null;
  return { src, width, height };
}


function status(text) { $('#status').textContent = text; }

async function unlock(key) {
  $('#login-error').textContent = '';
  $('#login-button').disabled = true;
  try {
    await api('/api/session', { key });
    $('#review-key').value = '';
    await start();
  } catch (e) {
    showLogin(e.status === 401 ? 'That review link or code is not recognised.' : 'Unable to open the review. Please try again.');
  } finally {
    $('#login-button').disabled = false;
  }
}

function showLogin(message = '') {
  $('#app').hidden = true;
  $('#login').hidden = false;
  $('#login-error').textContent = message;
  status('Private link required');
}

$('#login-form').addEventListener('submit', e => {
  e.preventDefault();
  const key = $('#review-key').value.trim();
  if (key) unlock(key);
});


async function start() {
  let m;
  try {
    m = await api('/versions/manifest.json');
  } catch (e) {
    if (e.status === 401) return showLogin();
    $('#login').hidden = true;
    $('#app').hidden = false;
    $('#loading').hidden = true;
    $('#load-error').hidden = false;
    $('#load-error').replaceChildren('The version history could not be loaded. ',
      h('button', { type: 'button', class: 'secondary', onclick: () => location.reload() }, 'Reload'));
    status('Unable to load');
    return;
  }
  $('#login').hidden = true;
  $('#app').hidden = false;
  setupManifest(m);
  $('#loading').hidden = true;
  $('#content').hidden = false;
  status('Signed in');
  await loadComments();
}

function setupManifest(m) {
  manifest = m && typeof m === 'object' ? m : {};
  versions = (Array.isArray(manifest.versions) ? manifest.versions : [])
    .filter(v => v && typeof v.id === 'string' && v.id)
    .map(v => ({ ...v, changes: Array.isArray(v.changes) ? v.changes.filter(c => typeof c === 'string') : [], pages: v.pages && typeof v.pages === 'object' ? v.pages : {} }))
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  pages = (Array.isArray(manifest.pages) ? manifest.pages : []).filter(p => p && typeof p.id === 'string' && p.id);

  if (!versions.length || !pages.length) {
    $('#load-error').hidden = false;
    $('#load-error').textContent = 'No releases or pages have been captured yet.';
    return;
  }

  const opt = v => h('option', { value: v.id }, `${v.label || v.id}`);
  $('#before-select').replaceChildren(...versions.map(opt));
  $('#after-select').replaceChildren(...versions.map(opt));
  $('#page-select').replaceChildren(...pages.map(p => h('option', { value: p.id }, p.path ? `${p.label || p.id} (${p.path})` : p.label || p.id)));

  const notes = (Array.isArray(manifest.notes) ? manifest.notes : []).filter(n => typeof n === 'string');
  $('#manifest-notes').replaceChildren(...notes.map(n => h('li', {}, n)));
  $('#manifest-notes').hidden = !notes.length;

  readUrl();
  renderAll();
}


function readUrl() {
  const q = new URLSearchParams(location.search);
  const ids = versions.map(v => v.id);
  const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
  const latest = ids[ids.length - 1], previous = ids[Math.max(0, ids.length - 2)];
  const defAfter = pick(manifest.defaultAfter, ids, latest);
  const defBefore = pick(manifest.defaultBefore, ids, previous);
  sel.before = pick(q.get('before'), ids, defBefore);
  sel.after = pick(q.get('after'), ids, defAfter);
  sel.page = pick(q.get('page'), pages.map(p => p.id), pages[0].id);
  const smallScreen = matchMedia('(max-width:760px)').matches;
  sel.view = pick(q.get('view'), VIEWS, smallScreen ? 'mobile' : 'desktop');
  sel.mode = pick(q.get('mode'), MODES, smallScreen ? 'toggle' : 'side');
  sel.zoom = pick(q.get('zoom'), ZOOMS, 'fit');
}

function writeUrl() {
  const q = new URLSearchParams({ before: sel.before, after: sel.after, page: sel.page, view: sel.view, mode: sel.mode });
  if (sel.zoom !== 'fit') q.set('zoom', sel.zoom);
  history.replaceState(null, '', `${location.pathname}?${q}`);
}


function renderAll() {
  const focusKey = document.activeElement?.dataset?.key;
  $('#before-select').value = sel.before;
  $('#after-select').value = sel.after;
  $('#page-select').value = sel.page;
  for (const name of ['view', 'mode', 'zoom', 'flip']) {
    const input = document.querySelector(`input[name="${name}"][value="${sel[name]}"]`);
    if (input) input.checked = true;
  }
  $('#same-warning').hidden = sel.before !== sel.after;
  $('#slider-controls').hidden = sel.mode !== 'slider';
  $('#toggle-controls').hidden = sel.mode !== 'toggle';
  renderTimeline();
  renderRelease('before');
  renderRelease('after');
  renderStage();
  renderComments();
  writeUrl();
  if (focusKey) document.querySelector(`[data-key="${CSS.escape(focusKey)}"]`)?.focus();
}

function renderTimeline() {
  $('#timeline').replaceChildren(...versions.map(v => {
    const role = v.id === sel.before && v.id === sel.after ? 'Before & after' : v.id === sel.before ? 'Before' : v.id === sel.after ? 'After' : '';
    const count = comments.filter(c => c.versionId === v.id).length;
    return h('li', { class: `tl-card${role ? ' is-selected' : ''}${v.id === sel.after ? ' is-after' : ''}${v.id === sel.before ? ' is-before' : ''}` },
      h('div', { class: 'tl-dot', 'aria-hidden': 'true' }),
      h('p', { class: 'tl-date' }, h('time', { datetime: v.date || '' }, fmtDate(v.date) || 'Date unknown')),
      role ? h('span', { class: 'tl-role' }, role) : null,
      h('h3', {}, v.label || v.id),
      h('p', { class: 'tl-meta' }, [v.kind, shortCommit(v.commit) && `#${shortCommit(v.commit)}`].filter(Boolean).join(' · ')),
      v.summary ? h('p', { class: 'tl-summary' }, v.summary) : null,
      count ? h('p', { class: 'tl-comments' }, `${count} comment${count === 1 ? '' : 's'}`) : null,
      h('div', { class: 'tl-actions' },
        h('button', { type: 'button', class: 'chip', 'aria-pressed': String(v.id === sel.before), 'aria-label': `Use ${v.label || v.id} as before`, 'data-key': `before:${v.id}`, onclick: () => update({ before: v.id }) }, 'Before'),
        h('button', { type: 'button', class: 'chip', 'aria-pressed': String(v.id === sel.after), 'aria-label': `Use ${v.label || v.id} as after`, 'data-key': `after:${v.id}`, onclick: () => update({ after: v.id }) }, 'After')));
  }));
  const current = $('#timeline .is-after'), list = $('#timeline');
  if (current && (current.offsetLeft < list.scrollLeft || current.offsetLeft + current.offsetWidth > list.scrollLeft + list.clientWidth)) {
    list.scrollLeft = Math.max(0, current.offsetLeft - list.clientWidth / 2 + current.offsetWidth / 2);
  }
}

function renderRelease(side) {
  const v = version(sel[side]);
  const el = $(`#release-${side}`);
  el.className = `release release-${side}`;
  const shot = capture(sel[side], sel.page, sel.view);
  const link = safeExternal(v?.deploymentUrl);
  const meta = [
    v?.kind,
    shortCommit(v?.commit) && h('code', { title: v.commit }, shortCommit(v.commit)),
    v?.captureDate && `Captured ${fmtDate(v.captureDate, true)}`,
  ].filter(Boolean);
  el.replaceChildren(
    h('p', { class: 'release-side' }, side === 'before' ? 'Before' : 'After'),
    h('h3', { id: `release-${side}-title` }, v?.label || 'Unknown release'),
    h('p', { class: 'release-date' }, 'Released ', h('time', { datetime: v?.date || '' }, fmtDate(v?.date) || 'date unknown')),
    meta.length ? h('p', { class: 'release-meta' }, ...meta.flatMap((m, i) => (i ? [' · ', m] : [m]))) : null,
    v?.summary ? h('p', { class: 'release-summary' }, v.summary) : null,
    v?.changes?.length ? h('details', { class: 'changes', open: v.changes.length <= 4 },
      h('summary', {}, `What changed in this release (${v.changes.length})`),
      h('ul', {}, v.changes.map(c => h('li', {}, c)))) : h('p', { class: 'muted' }, 'No change notes recorded.'),
    v?.provenance ? h('p', { class: 'fine' }, v.provenance) : null,
    shot ? null : h('p', { class: 'missing-tag' }, `No ${sel.view} screenshot of ${pageName(sel.page)} for this release.`),
    link ? h('p', { class: 'release-link' },
      h('a', { href: link, target: '_blank', rel: 'noopener noreferrer' }, 'Open this release in a new tab ↗'),
      h('span', { class: 'fine' }, 'Opens a live deployment. Do not submit forms there unless you mean to send a real enquiry.')) : null);
}

function unavailable(side) {
  const v = version(sel[side]);
  return h('div', { class: 'unavailable', role: 'note' },
    h('strong', {}, `${side === 'before' ? 'Before' : 'After'} screenshot unavailable`),
    h('span', {}, `There is no ${sel.view} capture of “${pageName(sel.page)}” for ${v?.label || 'this release'}.`),
    h('span', {}, 'We never substitute a screenshot from another page, screen size or release.'));
}

function shotImg(side, shot) {
  const v = version(sel[side]);
  const img = h('img', {
    src: shot.src, width: shot.width, height: shot.height, decoding: 'async', draggable: 'false',
    alt: `${side === 'before' ? 'Before' : 'After'}: ${pageName(sel.page)}, ${sel.view} screenshot of ${v?.label || 'release'}`,
  });
  if (sel.zoom === 'actual') { img.style.width = `${shot.width}px`; img.style.maxWidth = 'none'; }
  img.addEventListener('load', () => img.closest('.shot')?.classList.remove('is-loading'));
  img.addEventListener('error', () => {
    const holder = img.closest('.shot, .layer');
    holder?.classList.remove('is-loading');
    holder?.replaceChildren(h('div', { class: 'unavailable', role: 'note' },
      h('strong', {}, 'Screenshot failed to load'),
      h('span', {}, `The ${side} image for this page could not be loaded. Try refreshing the page.`)));
  });
  return img;
}

function renderStage() {
  const stage = $('#stage');
  const prevTop = stage.scrollTop, prevLeft = stage.scrollLeft;
  const b = capture(sel.before, sel.page, sel.view), a = capture(sel.after, sel.page, sel.view);
  stage.className = `stage mode-${sel.mode} zoom-${sel.zoom} view-${sel.view}`;
  let body;

  if (sel.mode === 'side') {
    const col = (side, shot) => h('figure', { class: `col col-${side}` },
      h('figcaption', { class: 'col-label' }, h('span', { class: `pill pill-${side}` }, side === 'before' ? 'Before' : 'After'), ` ${versionName(sel[side])}`),
      shot ? h('div', { class: 'shot is-loading' }, shotImg(side, shot)) : h('div', { class: 'shot' }, unavailable(side)));
    body = h('div', { class: 'side-grid' }, col('before', b), col('after', a));
    if (sel.zoom === 'actual') {
      body.style.gridTemplateColumns = `${b ? b.width : 420}px ${a ? a.width : 420}px`;
    }
  } else if (!a || !b) {
    body = h('div', { class: 'overlay-missing' },
      h('p', { class: 'inline-note' }, `${sel.mode === 'slider' ? 'The slider' : 'Toggle'} needs both screenshots. Showing what is available instead.`),
      h('div', { class: 'side-grid' },
        h('div', { class: 'shot' }, b ? shotImg('before', b) : unavailable('before')),
        h('div', { class: 'shot' }, a ? shotImg('after', a) : unavailable('after'))));
  } else {
    const wrap = h('div', { class: 'overlay' });
    const maxW = Math.max(a.width, b.width);
    const rel = s => s.height / s.width;
    if (sel.zoom === 'actual') {
      wrap.style.width = `${maxW}px`;
      wrap.style.height = `${Math.max(a.height, b.height)}px`;
    } else {
      wrap.style.aspectRatio = `1 / ${Math.max(rel(a), rel(b))}`;
    }
    const layer = (side, shot) => h('div', { class: `layer layer-${side}` }, shotImg(side, shot),
      h('p', { class: 'capture-end' }, `End of ${side} capture · ${versionName(sel[side])}`));
    const before = layer('before', b), after = layer('after', a);
    wrap.append(before, after);
    if (sel.mode === 'slider') {
      wrap.append(h('div', { class: 'divider', 'aria-hidden': 'true' }, h('span', { class: 'knob' }, '⇆')),
        h('span', { class: 'corner corner-before', 'aria-hidden': 'true' }, 'Before'),
        h('span', { class: 'corner corner-after', 'aria-hidden': 'true' }, 'After'));
    } else {
      wrap.append(h('span', { class: `corner corner-${sel.flip}`, 'aria-hidden': 'true' }, sel.flip === 'before' ? `Before · ${versionName(sel.before)}` : `After · ${versionName(sel.after)}`));
    }
    body = wrap;
  }

  stage.replaceChildren(body);
  applyOverlay();
  stage.scrollTop = prevTop;
  stage.scrollLeft = prevLeft;
}

function applyOverlay() {
  const after = $('#stage .layer-after');
  const before = $('#stage .layer-before');
  const divider = $('#stage .divider');
  if (!after || !before) return;
  if (sel.mode === 'slider') {
    after.hidden = false;
    before.hidden = false;
    after.style.clipPath = `inset(0 0 0 ${sel.split}%)`;
    if (divider) divider.style.left = `${sel.split}%`;
    $('#slider').value = String(sel.split);
    $('#slider').setAttribute('aria-valuetext', `${sel.split}% before on the left, ${100 - sel.split}% after on the right`);
  } else {
    after.style.clipPath = '';
    after.hidden = sel.flip !== 'after';
    before.hidden = sel.flip !== 'before';
  }
}


async function loadComments(manual = false) {
  const btn = $('#refresh');
  btn.disabled = true;
  if (manual) btn.textContent = 'Refreshing…';
  try {
    applyCommentState(await api('/api/versions'));
    $('#comment-error').hidden = true;
  } catch (e) {
    if (e.status === 401) return showLogin('Your session has ended. Open the private link again.');
    $('#comment-error').hidden = false;
    $('#comment-error').replaceChildren('Comments could not be loaded. ',
      h('button', { type: 'button', class: 'secondary', onclick: () => loadComments(true) }, 'Try again'));
  } finally {
    btn.disabled = false;
    btn.textContent = 'Refresh comments';
  }
}

function applyCommentState(state) {
  if (Number.isInteger(state?.revision) && state.revision < revision) return;
  comments = (Array.isArray(state?.comments) ? state.comments : [])
    .filter(c => c && typeof c.text === 'string')
    .sort((x, y) => String(x.createdAt || '').localeCompare(String(y.createdAt || '')));
  revision = Number.isInteger(state?.revision) ? state.revision : revision;
  renderComments();
  renderTimeline();
}

function renderComments() {
  if (!versions.length) return;
  const filter = $('#comment-filter').value;
  $('#bound-label').replaceChildren('Your comment will be attached to ',
    h('strong', {}, versionName(sel.after)), ' (the after release) on ', h('strong', {}, pageName(sel.page)), '.');
  const list = comments.filter(c => filter === 'all' || (c.versionId === sel.after && (filter === 'release' || c.pageId === sel.page)));
  $('#comment-count').textContent = `${list.length} of ${comments.length} comment${comments.length === 1 ? '' : 's'}`;
  $('#comment-empty').hidden = list.length > 0;
  $('#comment-empty').textContent = filter === 'here'
    ? `No comments on ${pageName(sel.page)} for ${versionName(sel.after)} yet.`
    : filter === 'release' ? `No comments on ${versionName(sel.after)} yet.` : 'No comments yet.';
  $('#comment-list').replaceChildren(...list.map(c => {
    const author = AUTHORS.includes(c.author) ? c.author : 'Unknown';
    const here = c.versionId === sel.after && c.pageId === sel.page;
    return h('li', { class: `comment author-${author.toLowerCase()}` },
      h('div', { class: 'comment-head' },
        h('span', { class: 'avatar', 'aria-hidden': 'true' }, author[0]),
        h('strong', {}, author),
        h('time', { datetime: c.createdAt || '' }, fmtDate(c.createdAt, true))),
      h('p', { class: 'comment-text' }, c.text),
      h('p', { class: 'comment-context' },
        `${versionName(c.versionId)} · ${pageName(c.pageId)}`,
        !here && version(c.versionId) && page(c.pageId)
          ? h('button', { type: 'button', class: 'link-button', onclick: () => { update({ after: c.versionId, page: c.pageId }); $('#compare').focus(); } }, 'View this')
          : null));
  }));
}

function setSaveState(state, message = '') {
  const btn = $('#comment-save');
  const statusEl = $('#comment-status');
  statusEl.className = `save-${state}`;
  statusEl.textContent = message;
  btn.disabled = state === 'saving';
  btn.textContent = state === 'saving' ? 'Saving…' : state === 'failed' ? 'Retry save' : 'Save comment';
  $('#comment-text').readOnly = state === 'saving';
  $$('input[name="author"]').forEach(i => { i.disabled = state === 'saving'; });
}

$('#comment-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (saving) return;
  const author = document.querySelector('input[name="author"]:checked')?.value;
  const text = $('#comment-text').value.trim();
  if (!AUTHORS.includes(author)) { setSaveState('idle', 'Choose who is posting first.'); document.querySelector('input[name="author"]').focus(); return; }
  if (!text) { setSaveState('idle', 'Write a comment first.'); $('#comment-text').focus(); return; }
  const payload = { author, text, versionId: sel.after, pageId: sel.page };
  const key = JSON.stringify(payload);
  if (!pending.has(key)) pending.set(key, uuid());
  saving = true;
  setSaveState('saving', `Saving to ${versionName(payload.versionId)} · ${pageName(payload.pageId)}…`);
  try {
    const state = await api('/api/versions', { ...payload, requestId: pending.get(key) });
    pending.delete(key);
    $('#comment-text').value = '';
    drafts.delete(`${payload.versionId}/${payload.pageId}`);
    try { localStorage.setItem('hqc-versions-author', author); } catch {}
    applyCommentState(state);
    setSaveState('saved', 'Saved to the shared history.');
  } catch (err) {
    if (err.status === 401) { setSaveState('failed', 'Your session has ended. Copy your comment, then open the private link again.'); return; }
    setSaveState('failed', `Not saved: ${err.message} Your text is still here.`);
  } finally {
    saving = false;
    if ($('#comment-save').textContent === 'Saving…') setSaveState('idle');
  }
});

$('#comment-text').addEventListener('input', () => {
  if ($('#comment-status').className === 'save-saved') setSaveState('idle');
});

$('#refresh').addEventListener('click', () => loadComments(true));
$('#comment-filter').addEventListener('change', renderComments);

window.addEventListener('beforeunload', e => {
  if (saving || $('#comment-text').value.trim() || [...drafts.values()].some(t => t.trim())) { e.preventDefault(); e.returnValue = ''; }
});


function update(patch) {
  if (saving) { renderAll(); return; }
  const oldContext = draftKey();
  drafts.set(oldContext, $('#comment-text').value);
  Object.assign(sel, patch);
  if (draftKey() !== oldContext) {
    $('#comment-text').value = drafts.get(draftKey()) || '';
    setSaveState('idle', $('#comment-text').value ? 'Unsaved comment restored for this page and release.' : '');
  }
  renderAll();
}

$('#before-select').addEventListener('change', e => update({ before: e.target.value }));
$('#after-select').addEventListener('change', e => update({ after: e.target.value }));
$('#page-select').addEventListener('change', e => update({ page: e.target.value }));
$('#swap').addEventListener('click', () => update({ before: sel.after, after: sel.before }));
for (const name of ['view', 'mode', 'zoom']) {
  $$(`input[name="${name}"]`).forEach(i => i.addEventListener('change', () => update({ [name]: i.value })));
}
$$('input[name="flip"]').forEach(i => i.addEventListener('change', () => {
  sel.flip = i.value;
  const corner = $('#stage .corner');
  if (corner) {
    corner.className = `corner corner-${sel.flip}`;
    corner.textContent = sel.flip === 'before' ? `Before · ${versionName(sel.before)}` : `After · ${versionName(sel.after)}`;
  }
  applyOverlay();
}));
$('#slider').addEventListener('input', e => { sel.split = Math.min(100, Math.max(0, Number(e.target.value) || 0)); applyOverlay(); });

(() => {
  const stage = $('#stage');
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop, moved: false };
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    stage.classList.add('is-panning');
    stage.scrollLeft = drag.left - dx;
    stage.scrollTop = drag.top - dy;
  });
  window.addEventListener('pointerup', () => { drag = null; stage.classList.remove('is-panning'); });
})();

try {
  const saved = localStorage.getItem('hqc-versions-author');
  const input = AUTHORS.includes(saved) && document.querySelector(`input[name="author"][value="${saved}"]`);
  if (input) input.checked = true;
} catch {}

if (fragmentKey) unlock(fragmentKey);
else start();
