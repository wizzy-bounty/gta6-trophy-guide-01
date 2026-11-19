// Leonida Platinum Atlas — trophy tracker for GTA VI (PS5).
// Loads app/data/trophies.json, renders the checklist, the 5-phase roadmap and a
// guide panel per trophy. Progress lives in localStorage and can be exported to
// a file and imported back. No network at run time beyond this one JSON file;
// every link out is a plain <a> the reader follows on purpose.
const PROGRESS_KEY = 'leonida-platinum-atlas-progress-v1';
const SPOILER_KEY = 'leonida-platinum-atlas-spoiler-v1';

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPanel');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const gradeCountsEl = document.getElementById('gradeCounts');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const hideEarnedEl = document.getElementById('hideEarnedToggle');
const emptyNote = document.getElementById('emptyNote');
const listHeading = document.getElementById('listHeading');

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(readStoredIds());
let kind = params.get('filter') ?? 'all';
let selectedId = Number(params.get('detail') ?? '') || null;
let spoilerOn = params.get('spoiler') === null
  ? readStoredSpoiler()
  : params.get('spoiler') !== '0';

// Deep-link demo states (used by the maker's screenshots, and handy for sharing):
// ?earned=2,3,8 pre-ticks trophies, ?detail=17 opens a guide, ?view=roadmap scrolls
// to the roadmap, ?filter=missable&spoiler=1 shows the missable list with spoilers on.
if (params.get('earned')) {
  for (const n of params.get('earned').split(',')) {
    const id = Number(n);
    if (byId.has(id)) earned.add(id);
  }
  saveProgress();
}

function readStoredIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => byId.has(n)) : [];
  } catch {
    return [];
  }
}

function readStoredSpoiler() {
  const raw = localStorage.getItem(SPOILER_KEY);
  return raw === null ? true : raw === '1';
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function isStorySpoiler(t) {
  return spoilerOn && t.hidden && t.kind === 'story' && !earned.has(t.id);
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = `badge ${cls}`;
  s.textContent = text;
  return s;
}

function trophyMatches(t) {
  if (kind === 'missable' && !t.missable) return false;
  if (kind === 'online') return false;
  if (kind !== 'all' && kind !== 'missable' && kind !== 'online' && t.kind !== kind) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  return true;
}

function renderRoadmap() {
  const ol = document.getElementById('roadmapList');
  ol.replaceChildren();
  for (const phase of doc.roadmap) {
    const li = document.createElement('li');
    const kicker = document.createElement('p');
    kicker.className = 'roadmap-phase';
    kicker.textContent = `Phase ${phase.phase} · ${phase.trophies.length} trophies`;
    const h = document.createElement('h3');
    h.textContent = phase.title;
    const p = document.createElement('p');
    p.textContent = phase.text;
    const done = document.createElement('p');
    done.className = 'roadmap-count';
    const got = phase.trophies.filter((id) => earned.has(id)).length;
    done.textContent = `${got} of ${phase.trophies.length} earned in this phase`;
    li.append(kicker, h, p, done);
    ol.append(li);
  }
}

function renderProgress() {
  const total = trophies.length;
  const got = earned.size;
  const pct = Math.round((got / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${got} of ${total} earned · ${pct}% to the platinum`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${g} ${have}/${all}`;
  });
  gradeCountsEl.textContent = parts.join(' · ');
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatches);
  const label = kind === 'all' ? 'Trophy checklist' : `Trophy checklist — ${kind}`;
  listHeading.textContent = `${label} (${shown.length} of ${trophies.length})`;
  if (kind === 'online') {
    emptyNote.hidden = false;
    emptyNote.textContent = 'No online trophies: all 55 trophies are single-player and offline (Push Square / Planet GTA 6). Nothing to track here — the whole list is yours alone.';
  } else if (shown.length === 0) {
    emptyNote.hidden = false;
    emptyNote.textContent = 'No trophies match this filter. Clear the search or pick another filter.';
  } else {
    emptyNote.hidden = true;
  }
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'trophy-check';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEarned(t.id);
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = isStorySpoiler(t) ? '🔒 Hidden story trophy' : t.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isStorySpoiler(t) ? 'Hidden on PlayStation until earned — tick it to reveal.' : t.description;
    if (isStorySpoiler(t)) {
      name.classList.add('spoiler-hidden');
      desc.classList.add('spoiler-hidden');
    }
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(badge(t.grade, t.grade));
    if (t.hidden) meta.append(badge('Hidden', 'hidden'));
    if (t.missable) meta.append(badge('⚠ Missable', 'missable'));
    if (t.count) meta.append(badge(`× ${t.count}`, 'count'));
    meta.append(badge(t.kind, 'kind'));
    body.append(name, desc, meta);
    const open = document.createElement('span');
    open.textContent = 'Guide →';
    open.style.cssText = 'color:var(--gold);font-size:13px;font-weight:700;white-space:nowrap;';
    li.append(box, body, open);
    li.addEventListener('click', () => {
      selectedId = t.id;
      renderList();
      renderDetail();
    });
    listEl.append(li);
  }
}

function renderDetail() {
  const t = byId.get(selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-hint">Select a trophy on the left to read its full guide, its sources and its missable warning here.</p>';
    return;
  }
  detailEl.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = t.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official: “${t.description}” — ${t.grade}${t.hidden ? ' · hidden on PlayStation until earned' : ''}${t.count ? ` · tracked count: ${t.count}` : ''}`;
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(badge(t.grade, t.grade));
  if (t.hidden) meta.append(badge('Hidden', 'hidden'));
  if (t.missable) meta.append(badge('⚠ Missable', 'missable'));
  meta.append(badge(t.kind, 'kind'));
  const guideH = document.createElement('h3');
  guideH.textContent = 'How to get it';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  detailEl.append(h, official, meta, guideH, guide);
  if (t.missable && t.missable_note) {
    const warn = document.createElement('p');
    warn.className = 'missable-box';
    warn.textContent = `⚠ Missable: ${t.missable_note}`;
    detailEl.append(warn);
  }
  const srcH = document.createElement('h3');
  srcH.textContent = 'Sources';
  const ul = document.createElement('ul');
  ul.className = 'source-list';
  for (const s of t.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    ul.append(li);
  }
  detailEl.append(srcH, ul);
  const state = document.createElement('p');
  state.className = earned.has(t.id) ? 'earned-line' : 'not-earned-line';
  state.textContent = earned.has(t.id) ? '✓ Earned — ticked in your checklist.' : 'Not earned yet.';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tick-btn';
  btn.textContent = earned.has(t.id) ? 'Untick this trophy' : 'Mark as earned';
  btn.addEventListener('click', () => toggleEarned(t.id));
  detailEl.append(state, btn);
}

function renderSourcesFooter() {
  const seen = new Map();
  for (const t of trophies) for (const s of t.sources) seen.set(s.url, s.name);
  const ul = document.getElementById('sourceList');
  for (const [url, name] of seen) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = name;
    li.append(a);
    ul.append(li);
  }
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress();
  renderAll();
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
  renderDetail();
}

document.getElementById('kindFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-kind]');
  if (!btn) return;
  kind = btn.dataset.kind;
  for (const b of document.querySelectorAll('#kindFilters button')) b.classList.toggle('active', b === btn);
  renderList();
});
gradeEl.addEventListener('change', renderList);
searchEl.addEventListener('input', renderList);
hideEarnedEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  saveSpoiler();
  renderList();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = {
    game: 'Grand Theft Auto VI',
    exported: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    total: trophies.length,
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-atlas-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('bad file');
    earned = new Set(ids.filter((n) => byId.has(n)));
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a Leonida Platinum Atlas progress export.');
  }
  e.target.value = '';
});

// Initial filter + spoiler state from the URL or storage.
spoilerEl.checked = spoilerOn;
for (const b of document.querySelectorAll('#kindFilters button')) {
  b.classList.toggle('active', b.dataset.kind === kind);
}
renderSourcesFooter();
renderAll();
if (params.get('view') === 'roadmap') {
  document.getElementById('roadmap').scrollIntoView();
}
if (params.get('view') === 'checklist') {
  document.querySelector('.checklist').scrollIntoView();
}
