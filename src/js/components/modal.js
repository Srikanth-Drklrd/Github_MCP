import { api } from '../api/tmdb.js';
import { state } from '../state/store.js';
import { W500, W1280 } from '../config/constants.js';
import { escapeHtml, toast } from '../utils/helpers.js';

export async function openModal(id, t) {
  toast('Loading...', 5000);

  t = t || state.mediaType;
  state.curId = id; state.mediaType = t;
  document.getElementById('moviesTab').classList.toggle('active', t === 'movie');
  document.getElementById('tvTab').classList.toggle('active', t === 'tv');

  try {
    const [d, credits, videos] = await Promise.all([
      api(`/${t}/${id}`),
      api(`/${t}/${id}/credits`),
      api(`/${t}/${id}/videos`),
    ]);
    state.curItem = d;

    const mLeft = document.getElementById('mLeft');
    const bp = d.backdrop_path ? W1280 + d.backdrop_path : null;
    const pp = d.poster_path   ? W500 + d.poster_path   : null;
    const rating = d.vote_average ? d.vote_average.toFixed(1) : null;

    if (bp || pp) {
      mLeft.innerHTML = `
        ${bp ? `<img class="ml-blur" src="${bp}" alt="">` : `<div class="ml-blur-ph"></div>`}
        ${bp ? `<img class="ml-img" id="mlImg" src="${bp}" alt="">` : `<img class="ml-img" id="mlImg" src="${pp}" alt="">`}
        <div class="ml-vignette"></div>
        <div class="ml-poster-wrap">
          ${pp ? `<img class="ml-poster" id="mlPoster" src="${pp}" alt="">` : ''}
          ${rating ? `<div class="ml-rating" id="mlRating">★ ${rating}</div>` : ''}
        </div>`;
    } else {
      mLeft.innerHTML = `<div class="ml-blur-ph"></div><div class="ml-vignette"></div><div class="ml-poster-wrap" style="font-size:64px;">🎬</div>`;
    }

    document.getElementById('mTypeBadge').innerHTML = `<div class="m-type">${t === 'movie' ? 'Movie' : 'TV Series'}</div>`;
    document.getElementById('mTitle').textContent   = d.title || d.name;
    document.getElementById('mTagline').textContent = d.tagline || '';

    const gmap   = t === 'movie' ? state.gMovies : state.gTv;
    const genres = (d.genres || []).slice(0,3).map(g => `<span class="chip dim">${escapeHtml(g.name)}</span>`).join('');
    const rt     = d.runtime ? `<span class="chip gold">⏱ ${Math.floor(d.runtime/60)}h ${d.runtime%60}m</span>` : '';
    const eps    = d.number_of_episodes ? `<span class="chip gold">📺 ${d.number_of_episodes} eps</span>` : '';
    const status = d.status ? `<span class="chip grn">${escapeHtml(d.status)}</span>` : '';
    document.getElementById('mMeta').innerHTML =
      `<span class="chip red">★ ${d.vote_average?.toFixed(1)||'—'}</span>
       <span class="chip dim">${(d.release_date||d.first_air_date||'').split('-')[0]}</span>
       ${rt}${eps}${status}${genres}`;

    document.getElementById('mOverview').textContent = d.overview || 'No description available.';

    const trk = (videos.results||[]).find(x=>x.site==='YouTube'&&x.type==='Trailer')
             || (videos.results||[]).find(x=>x.site==='YouTube');
    state.trailer = trk ? trk.key : null;
    const tb = document.getElementById('trailerBtn');
    tb.disabled = !state.trailer; tb.style.opacity = state.trailer ? '1' : '0.4';

    const castHtml = (credits.cast||[]).slice(0,20).map(p => `
      <div class="cast-row">
        ${p.profile_path ? `<img class="cast-face" src="${W500}${p.profile_path}" alt="${escapeHtml(p.name)}" loading="lazy">` : `<div class="cast-face-ph">👤</div>`}
        <div class="cast-info">
          <div class="cast-name">${escapeHtml(p.name)}</div>
          ${p.character ? `<div class="cast-char">${escapeHtml(p.character.replace(/\(.*?\)/g,'').trim())}</div>` : ''}
        </div>
      </div>`).join('');
    document.getElementById('mCast').innerHTML = castHtml || '<p style="color:#444;font-size:12px;padding:8px 0">No cast data</p>';

    const mRight  = document.getElementById('mRight');
    let rafId = null, lastSY = 0;
    if (mRight._pFn) mRight.removeEventListener('scroll', mRight._pFn);
    function onScroll() { lastSY = mRight.scrollTop; if (!rafId) rafId = requestAnimationFrame(applyP); }
    function applyP() {
      rafId = null; const t = lastSY;
      const img = document.getElementById('mlImg'), poster = document.getElementById('mlPoster'), rat = document.getElementById('mlRating');
      if (img) img.style.transform = `translateY(${t * 0.2}px) scale(1.1)`;
      if (poster) poster.style.transform = `translateY(${t * 0.06}px)`;
      if (rat) rat.style.transform = `translateY(${t * 0.04}px)`;
    }
    mRight.scrollTop = 0;
    mRight._pFn = onScroll;
    mRight.addEventListener('scroll', onScroll, { passive:true });
    applyP();

    document.getElementById('mBackdrop').style.display = 'block';
    document.getElementById('mSheet').style.display    = 'block';
    document.getElementById('closeBtn').style.display  = 'flex';
    document.getElementById('header').classList.add('hidden');
    document.body.style.overflow = 'hidden';

    document.getElementById('toast').classList.remove('show');

  } catch (error) {
    console.error(error);
    toast('Failed to load movie details. Please try again.');
  }
}

export function closeModal() {
  document.getElementById('mBackdrop').style.display = 'none';
  document.getElementById('mSheet').style.display    = 'none';
  document.getElementById('closeBtn').style.display  = 'none';
  document.getElementById('header').classList.remove('hidden');
  document.body.style.overflow = '';
}

export function openTrailer() { if (state.trailer) window.open(`https://youtube.com/watch?v=${state.trailer}`, '_blank'); }