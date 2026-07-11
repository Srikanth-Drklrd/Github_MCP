import { api } from '../api/tmdb.js';
import { state, stopFb } from '../state/store.js';
import { SECTIONS_MOVIE, SECTIONS_TV } from '../config/sections.js';
import { cardHTML } from '../components/card.js';
import { skels, toast } from '../utils/helpers.js';
import { closeDD } from '../components/playerControls.js';
import { setActiveType, clearSearch as cs } from '../components/header.js';

export async function renderHomePage() {
  stopFb(); closeDD();
  const frame = document.getElementById('playerFrame');
  if (frame) frame.src = '';

  document.getElementById('homePage').classList.add('active');
  document.getElementById('playerPage').classList.remove('active');
  document.getElementById('header').classList.remove('hidden');
  document.body.style.overflow = '';

  if (!document.getElementById('sectionsWrap').innerHTML && !document.getElementById('searchInput').value) {
    await loadHome();
  }
}

export async function loadHome() {
  document.getElementById('searchSection').style.display = 'none';
  document.getElementById('sectionsWrap').style.display  = '';
  const secs = state.mediaType === 'movie' ? SECTIONS_MOVIE : SECTIONS_TV;
  const wrap = document.getElementById('sectionsWrap');

  wrap.innerHTML = secs.map((s, i) => `
    <div class="section" id="sec${i}">
      <div class="section-head">
        <div class="section-title">${s.icon} ${s.title} <b>— ${s.sub}</b></div>
      </div>
      <div class="h-row" id="row${i}">${skels(10)}</div>
    </div>`).join('');

  await api(secs[0].ep, 1);

  for (let i = 0; i < secs.length; i++) {
    try {
      const s = secs[i];
      const [p1, p2] = await Promise.all([api(s.ep, 1), api(s.ep, 2)]);
      const results  = [...(p1.results || []), ...(p2.results || [])];
      const row = document.getElementById(`row${i}`);
      if (!row) return;
      const currentGmap = state.mediaType === 'movie' ? state.gMovies : state.gTv;
      row.innerHTML = results.length
        ? results.map(item => cardHTML(item, state.mediaType, currentGmap)).join('')
        : `<p class="empty">No results</p>`;
    } catch (e) {
      console.error('Section load error:', e);
    }
  }
}

export async function search(q) {
  if (!q.trim()) {
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('sectionsWrap').style.display  = '';
    if (!document.getElementById('sectionsWrap').innerHTML) await loadHome();
    return;
  }

  if (window.location.hash.startsWith('#play')) {
    window.location.hash = '';
  }

  document.getElementById('sectionsWrap').style.display  = 'none';
  document.getElementById('searchSection').style.display = 'block';
  document.getElementById('searchLabel').textContent = `"${q}"`;

  const grid = document.getElementById('searchGrid');
  grid.innerHTML = skels(12, true);

  const gmap = state.mediaType === 'movie' ? state.gMovies : state.gTv;
  const [p1, p2] = await Promise.all([
    api(`/search/multi?query=${encodeURIComponent(q)}`, 1),
    api(`/search/multi?query=${encodeURIComponent(q)}`, 2),
  ]);
  const results = [...(p1.results||[]), ...(p2.results||[])]
    .filter(x => x.media_type === 'movie' || x.media_type === 'tv');

  grid.innerHTML = results.length
    ? results.map(item => cardHTML(item, state.mediaType, gmap)).join('')
    : `<div class="empty">No results for "${q}"</div>`;
}

export function goHome() {
  window.location.hash = '';
  cs();
}

export function switchType(t) {
  state.mediaType = t;
  setActiveType(t);
  const q = document.getElementById('searchInput').value.trim();
  if (q) { search(q); return; }
  loadHome();
}