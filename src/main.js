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
import { PROVIDERS, QC, PROVIDER_STATUS } from './js/config/providers.js';
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
window.PROVIDER_STATUS = PROVIDER_STATUS;
window.SECTIONS_MOVIE = SECTIONS_MOVIE;
window.SECTIONS_TV = SECTIONS_TV;
window.W500 = W500;
window.W1280 = W1280;
window.api = api;

// Track fullscreen state
let isPlayerFullscreen = false;
let fullscreenChangeHandler = null;

function toggleFullscreen() {
  const playerBox = document.querySelector('.player-box');
  const iframe = document.getElementById('playerFrame');
  const elem = playerBox || document.getElementById('playerPage');

  if (!document.fullscreenElement) {
    // Request fullscreen on the player container
    elem.requestFullscreen().catch(() => {});
    
    // Set up fullscreen change listener
    if (!fullscreenChangeHandler) {
      fullscreenChangeHandler = () => {
        isPlayerFullscreen = !!document.fullscreenElement;
        const fsBtn = document.getElementById('fsBtn');
        if (fsBtn) {
          fsBtn.classList.toggle('fullscreen-active', isPlayerFullscreen);
        }
        // If exiting fullscreen, ensure iframe gets focus back
        if (!isPlayerFullscreen && iframe) {
          iframe.focus();
        }
      };
      document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    }
    
    // Also try to trigger fullscreen on the iframe if it supports it
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage({ type: 'requestFullscreen' }, '*');
      } catch (e) {
        // Cross-origin, ignore
      }
    }
  } else {
    document.exitFullscreen();
  }
}

// Handle messages from iframe (for play/pause, fullscreen responses)
window.addEventListener('message', (event) => {
  // Only accept messages from our player iframe
  const frame = document.getElementById('playerFrame');
  if (frame && event.source === frame.contentWindow) {
    if (event.data?.type === 'playPause') {
      // Iframe requested play/pause - we could toggle UI here
    } else if (event.data?.type === 'fullscreenChange') {
      isPlayerFullscreen = event.data.isFullscreen;
      const fsBtn = document.getElementById('fsBtn');
      if (fsBtn) {
        fsBtn.classList.toggle('fullscreen-active', isPlayerFullscreen);
      }
    }
  }
});

// Keyboard shortcuts for player
document.addEventListener('keydown', (e) => {
  // Only handle shortcuts when player page is active
  if (!document.getElementById('playerPage').classList.contains('active')) return;

  // Ignore if typing in an input/select
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT' || active.tagName === 'TEXTAREA')) return;

  switch (e.key) {
    case 'f':
    case 'F':
      e.preventDefault();
      toggleFullscreen();
      break;
    case ' ':
      // Space for play/pause - try to send to iframe
      e.preventDefault();
      const frame = document.getElementById('playerFrame');
      if (frame && frame.contentWindow) {
        try {
          frame.contentWindow.postMessage({ type: 'playPause' }, '*');
        } catch (err) {
          // Cross-origin - focus iframe and let browser handle space
          frame.focus();
        }
      }
      break;
    case 'Escape':
      // Escape is handled by browser for fullscreen exit,
      // but also close modal/dropdown if open
      if (document.getElementById('mSheet').style.display === 'block') closeModal();
      else if (window.state?.ddOpen) closeDD();
      break;
    case 'ArrowLeft':
      // Seek backward 10 seconds
      e.preventDefault();
      seekIframe(-10);
      break;
    case 'ArrowRight':
      // Seek forward 10 seconds
      e.preventDefault();
      seekIframe(10);
      break;
    case 'ArrowUp':
      // Volume up
      e.preventDefault();
      adjustVolumeIframe(0.1);
      break;
    case 'ArrowDown':
      // Volume down
      e.preventDefault();
      adjustVolumeIframe(-0.1);
      break;
    case 'm':
    case 'M':
      // Mute toggle
      e.preventDefault();
      toggleMuteIframe();
      break;
  }
});

// Helper functions to send control messages to iframe
function seekIframe(seconds) {
  const frame = document.getElementById('playerFrame');
  if (frame && frame.contentWindow) {
    try {
      frame.contentWindow.postMessage({ type: 'seek', seconds }, '*');
    } catch (err) {
      frame.focus();
    }
  }
}

function adjustVolumeIframe(delta) {
  const frame = document.getElementById('playerFrame');
  if (frame && frame.contentWindow) {
    try {
      frame.contentWindow.postMessage({ type: 'volume', delta }, '*');
    } catch (err) {
      frame.focus();
    }
  }
}

function toggleMuteIframe() {
  const frame = document.getElementById('playerFrame');
  if (frame && frame.contentWindow) {
    try {
      frame.contentWindow.postMessage({ type: 'mute' }, '*');
    } catch (err) {
      frame.focus();
    }
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

  // Keyboard support for modal/dropdown
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('mSheet').style.display === 'block') closeModal();
      else if (state.ddOpen) closeDD();
    }
  });
}

init();