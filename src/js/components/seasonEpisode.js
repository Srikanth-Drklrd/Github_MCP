import { api } from '../api/tmdb.js';
import { state } from '../state/store.js';
import { loadSrc } from './playerControls.js';

export async function buildSeasons() {
  const seasons = (state.curItem.seasons||[]).filter(s=>s.season_number>0);
  document.getElementById('seasonSel').innerHTML =
    seasons.map(s=>`<option value="${s.season_number}">Season ${s.season_number}</option>`).join('');
  state.curS = seasons[0]?.season_number || 1;
  try {
    await buildEpisodes(state.curS);
  } catch (e) {
    console.error('Failed to load episodes:', e);
    document.getElementById('episodeSel').innerHTML = '<option value="1">Ep 1</option>';
  }
}

export async function onSeasonChange() {
  state.curS = parseInt(document.getElementById('seasonSel').value);
  await buildEpisodes(state.curS);
}

export async function buildEpisodes(s) {
  const d = await api(`/tv/${state.curId}/season/${s}`);
  document.getElementById('episodeSel').innerHTML =
    (d.episodes||[]).map(ep => `<option value="${ep.episode_number}">Ep ${ep.episode_number}${ep.name ? ' — '+ep.name : ''}</option>`).join('');
  state.curE = (d.episodes||[])[0]?.episode_number || 1;
}

export function playEp() {
  state.curS = parseInt(document.getElementById('seasonSel').value);
  state.curE = parseInt(document.getElementById('episodeSel').value);
  loadSrc(state.srcIdx);
}