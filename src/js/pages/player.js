import { state } from '../state/store.js';
import { closeModal } from '../components/modal.js';
import { buildDD, loadSrc } from '../components/playerControls.js';
import { buildSeasons } from '../components/seasonEpisode.js';
import { loadSimilar } from '../components/similar.js';

export async function renderPlayerPage() {
  closeModal();
  state.curS = 1; state.curE = 1;

  document.getElementById('homePage').classList.remove('active');
  document.getElementById('playerPage').classList.add('active');
  document.getElementById('header').classList.remove('hidden');
  document.body.style.overflow = '';

  document.getElementById('pTitle').textContent = state.curItem ? (state.curItem.title || state.curItem.name) : '';
  document.getElementById('pSub').textContent   = '';

  if (state.mediaType === 'tv') {
    document.getElementById('epRow').style.display = 'flex';
    await buildSeasons();
  } else {
    document.getElementById('epRow').style.display = 'none';
  }
  buildDD();
  loadSrc(0);
  loadSimilar();
}

export function openPlayer() {
  window.location.hash = `play/${state.mediaType}/${state.curId}`;
}