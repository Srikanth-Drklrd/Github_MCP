import { PROVIDERS, QC, PROXIES, PROBLEMATIC_PROVIDERS, PROVIDER_STATUS } from '../config/providers.js';
import { state, stopFb } from '../state/store.js';
import { toast } from '../utils/helpers.js';

export function buildDD() {
  document.getElementById('srcDD').innerHTML = PROVIDERS.map((p, i) => {
    const c = QC[p.q] || '#aaa';
    const status = PROVIDER_STATUS[i];
    let statusIcon = '';
    if (status === 1) statusIcon = '<span class="status-ok" title="Working">✓</span>';
    else if (status === -1) statusIcon = '<span class="status-bad" title="Failed">✗</span>';
    return `<div class="src-opt" id="so${i}" onclick="selSrc(${i})">
      <span class="opt-n">${i+1}</span>
      <span>Server ${i+1}</span>
      <span class="opt-q" style="color:${c};border:1px solid ${c}33;background:${c}11">${p.q}</span>
      ${statusIcon}
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

export function selSrc(i) { closeDD(); loadSrc(i); }

export function changeSource(d) { const n = state.srcIdx + d; if (n >= 0 && n < PROVIDERS.length) loadSrc(n); }

export function reloadSrc() { loadSrc(state.srcIdx); }

function getProviderDomain(idx) {
  const p = PROVIDERS[idx];
  const url = state.mediaType === 'movie' ? p.movie(state.curId) : p.tv(state.curId, state.curS, state.curE);
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function buildSrcUrl(idx) {
  const p = PROVIDERS[idx];
  return state.mediaType === 'movie' ? p.movie(state.curId) : p.tv(state.curId, state.curS, state.curE);
}

export async function loadSrc(idx) {
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

  // Get the direct URL first
  let srcUrl = buildSrcUrl(idx);
  const domain = getProviderDomain(idx);
  const isProblematic = PROBLEMATIC_PROVIDERS.has(domain);
  
  // For problematic providers, we'll try direct first, then proxy if it fails
  let useProxy = false;
  let proxyIndex = 0;

  function tryLoad(url) {
    frame.src = url;
  }

  let settled = false;
  function onSettled() {
    if (settled) return;
    settled = true;
    stopFb();
    load.classList.add('gone');
    // Mark provider as working
    PROVIDER_STATUS[idx] = 1;
    buildDD(); // Refresh dropdown to show status
  }

  frame.onload = onSettled;
  
  frame.onerror = async () => {
    if (settled) return;
    // Try proxy fallback for problematic providers
    if (isProblematic && !useProxy && proxyIndex < PROXIES.length) {
      useProxy = true;
      tryLoad(PROXIES[proxyIndex](srcUrl));
      proxyIndex++;
      return;
    }
    if (settled) return;
    settled = true;
    stopFb();
    PROVIDER_STATUS[idx] = -1;
    buildDD();
    if (idx < PROVIDERS.length - 1) {
      toast(`Server ${idx+1} failed — trying next…`);
      loadSrc(idx + 1);
    } else {
      load.classList.add('gone');
      toast('All servers failed. Try a different title or check your network/VPN.', 6000);
    }
  };

  // Try direct load first
  tryLoad(srcUrl);

  state.fbTimer = setTimeout(() => {
    if (settled) return;
    // On timeout, try proxy if problematic provider
    if (isProblematic && !useProxy && proxyIndex < PROXIES.length) {
      useProxy = true;
      tryLoad(PROXIES[proxyIndex](srcUrl));
      proxyIndex++;
      // Reset timeout for proxy attempt
      state.fbTimer = setTimeout(() => {
        if (settled) return;
        settled = true;
        stopFb();
        PROVIDER_STATUS[idx] = -1;
        buildDD();
        if (idx < PROVIDERS.length - 1) {
          toast(`Server ${idx+1} timed out — trying next…`);
          loadSrc(idx + 1);
        } else {
          load.classList.add('gone');
          toast('All servers timed out. Try a different title or check your network/VPN.', 6000);
        }
      }, 15000);
      return;
    }
    
    settled = true;
    stopFb();
    PROVIDER_STATUS[idx] = -1;
    buildDD();
    if (idx < PROVIDERS.length - 1) {
      toast(`Server ${idx+1} timed out — trying next…`);
      loadSrc(idx + 1);
    } else {
      load.classList.add('gone');
      toast('All servers timed out. Try a different title or check your network/VPN.', 6000);
    }
  }, 15000);
}