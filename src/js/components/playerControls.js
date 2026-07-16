import { PROVIDERS, QC } from '../config/providers.js';
import { state, stopFb } from '../state/store.js';
import { toast } from '../utils/helpers.js';

export function buildDD() {
  document.getElementById('srcDD').innerHTML = PROVIDERS.map((p, i) => {
    const c = QC[p.q] || '#aaa';
    return `<div class="src-opt" id="so${i}" onclick="selSrc(${i})">
      <span class="opt-n">${i+1}</span>
      <span>Server ${i+1}</span>
      <span class="opt-q" style="color:${c};border:1px solid ${c}33;background:${c}11">${p.q}</span>
    </div>`;
  }).join('');
  updateDD(0);
}

export function updateDD(idx) {
  document.getElementById('srcLabel').textContent = `Server ${idx+1}`;
  document.getElementById('srcCount').textContent = `${idx+1}/${PROVIDERS.length}`;
  document.querySelectorAll('.src-opt').forEach((el,i) => el.classList.toggle('sel', i===idx));
  document.getElementById('prevBtn').disabled = idx === 0;
  document.getElementById('nextBtn').disabled = idx === PROVIDERS.length-1;
}

export function toggleDD() {
  state.ddOpen = !state.ddOpen;
  document.getElementById('srcDD').classList.toggle('open', state.ddOpen);
  document.getElementById('srcBtn').classList.toggle('open', state.ddOpen);
  document.getElementById('srcChev').classList.toggle('up', state.ddOpen);
}

export function closeDD() {
  state.ddOpen = false;
  document.getElementById('srcDD').classList.remove('open');
  document.getElementById('srcBtn').classList.remove('open');
  document.getElementById('srcChev').classList.remove('up');
}

document.addEventListener('click', e => { if (state.ddOpen && !document.getElementById('srcWrap').contains(e.target)) closeDD(); });

export function selSrc(i) { closeDD(); loadSrc(i, true); }
export function changeSource(d) { const n = state.srcIdx + d; if (n >= 0 && n < PROVIDERS.length) loadSrc(n, false); }
export function reloadSrc() { loadSrc(state.srcIdx, false); }

function buildSrcUrl(idx) {
  const p = PROVIDERS[idx];
  return state.mediaType === 'movie' ? p.movie(state.curId) : p.tv(state.curId, state.curS, state.curE);
}

export function loadSrc(idx, manual = false) {
  stopFb();
  if (idx < 0 || idx >= PROVIDERS.length) { toast('No more servers.'); return; }
  state.srcIdx = idx;
  const frame = document.getElementById('playerFrame');
  const load  = document.getElementById('pLoading');
  load.classList.remove('gone');
  document.getElementById('pLoadSub').textContent = `Trying server ${idx+1} of ${PROVIDERS.length}…`;
  updateDD(idx);

  frame.onload = null;
  frame.onerror = null;

  let settled = false;
  function onSettled() {
    if (settled) return;
    settled = true;
    stopFb();
    load.classList.add('gone');
  }

  function onError() {
    if (settled) return;
    settled = true;
    stopFb();
    load.classList.add('gone');
    if (manual) {
      toast(`Server ${idx+1} failed to load. Try another server.`, 5000);
    } else if (idx < PROVIDERS.length - 1) {
      toast(`Server ${idx+1} failed — trying next…`);
      loadSrc(idx + 1, false);
    } else {
      toast('All servers failed. Try a different title or check your network/VPN.', 6000);
    }
  }

  frame.onload = onSettled;
  frame.onerror = onError;
  frame.src = buildSrcUrl(idx);

  if (state.mediaType === 'tv') document.getElementById('pSub').textContent = `Season ${state.curS} · Episode ${state.curE}`;

  state.fbTimer = setTimeout(() => {
    if (settled) return;
    settled = true;
    stopFb();
    load.classList.add('gone');
    if (idx < PROVIDERS.length - 1) {
      toast(`Server ${idx+1} timed out — trying next…`);
      loadSrc(idx + 1, false);
    } else {
      toast('All servers timed out. Try a different title or check your network/VPN.', 6000);
    }
  }, 15000);
}