import './styles/main.css';
import { api } from './js/api/tmdb.js';
import { state } from './js/state/store.js';
import { initHeader, setActiveType, clearSearch } from './js/components/header.js';
import { openModal, closeModal, openTrailer } from './js/components/modal.js';
import { renderHomePage, loadHome, search, goHome, switchType } from './js/pages/home.js';
import { renderPlayerPage, openPlayer } from './js/pages/player.js';
import { buildDD, toggleDD, closeDD, selSrc, changeSource, reloadSrc, loadSrc } from './js/components/playerControls.js';
import { buildSeasons, onSeasonChange, playEp } from './js/components/seasonEpisode.js';
import { loadSimilar } from './js/components/similar.js';
import { toast, skels, escapeHtml, gname } from './js/utils/helpers.js';
import { stopFb } from './js/state/store.js';
import { cardHTML } from './js/components/card.js';
import { W500, W1280 } from './js/config/constants.js';
import { PROVIDERS, QC } from './js/config/providers.js';
import { SECTIONS_MOVIE, SECTIONS_TV } from './js/config/sections.js';

// Global exports for inline onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.openTrailer = openTrailer;
window.openPlayer = openPlayer;
window.goHome = goHome;
window.switchType = switchType;
window.search = search;
window.renderHomePage = renderHomePage;
window.loadHome = loadHome;
window.renderPlayerPage = renderPlayerPage;
window.buildDD = buildDD;
window.toggleDD = toggleDD;
window.closeDD = closeDD;
window.selSrc = selSrc;
window.changeSource = changeSource;
window.reloadSrc = reloadSrc;
window.loadSrc = loadSrc;
window.buildSeasons = buildSeasons;
window.onSeasonChange = onSeasonChange;
window.playEp = playEp;
window.loadSimilar = loadSimilar;
window.toast = toast;
window.stopFb = stopFb;
window.skels = skels;
window.escapeHtml = escapeHtml;
window.gname = gname;
window.cardHTML = cardHTML;
window.toggleFullscreen = toggleFullscreen;

// Expose for dynamic access
window.state = state;
window.PROVIDERS = PROVIDERS;
window.QC = QC;
window.SECTIONS_MOVIE = SECTIONS_MOVIE;
window.SECTIONS_TV = SECTIONS_TV;
window.W500 = W500;
window.W1280 = W1280;
window.api = api;

function toggleFullscreen() {
  const elem = document.querySelector('.player-box') || document.getElementById('playerPage');
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

// Routing
window.addEventListener('hashchange', handleRoute);

async function handleRoute() {
  const hash = window.location.hash.substring(1);

  if (hash.startsWith('play/')) {
    const parts = hash.split('/');
    const type = parts[1];
    const id = parts[2];

    if (!state.curItem || state.curId != id) {
      state.curId = id; state.mediaType = type;
      try {
        state.curItem = await api(`/${type}/${id}`);
      } catch(e) { console.error(e); window.location.hash = ''; return; }
    }
    renderPlayerPage();
  } else {
    renderHomePage();
  }
}

async function init() {
  const [gm, gt] = await Promise.all([api('/genre/movie/list'), api('/genre/tv/list')]);
  (gm.genres || []).forEach(g => state.gMovies[g.id] = g.name);
  (gt.genres || []).forEach(g => state.gTv[g.id] = g.name);

  initHeader(search, switchType, goHome);
  handleRoute();

  // Keyboard support
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('mSheet').style.display === 'block') closeModal();
      else if (state.ddOpen) closeDD();
    }
  });
}

init();