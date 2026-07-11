import { api } from '../api/tmdb.js';
import { state } from '../state/store.js';
import { cardHTML } from '../components/card.js';
import { skels } from '../utils/helpers.js';

export async function loadSimilar() {
  const grid = document.getElementById('simGrid');
  grid.innerHTML = skels(6, true);
  const gmap = state.mediaType === 'movie' ? state.gMovies : state.gTv;
  const [sim, rec] = await Promise.all([
    api(`/${state.mediaType}/${state.curId}/similar`),
    api(`/${state.mediaType}/${state.curId}/recommendations`),
  ]);
  const seen = new Set();
  const results = [...(rec.results||[]), ...(sim.results||[])]
    .filter(i => { if(seen.has(i.id))return false; seen.add(i.id); return true; })
    .slice(0, 18);
  grid.innerHTML = results.length
    ? results.map(item => cardHTML(item, state.mediaType, gmap)).join('')
    : `<div class="empty">No similar titles</div>`;
}