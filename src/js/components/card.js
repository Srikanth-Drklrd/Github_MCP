import { W500 } from '../config/constants.js';
import { escapeHtml, gname } from '../utils/helpers.js';
import { state } from '../state/store.js';

export function cardHTML(item, t, gmap) {
  const title  = escapeHtml(item.title || item.name || 'Untitled');
  const year   = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const poster = item.poster_path ? W500 + item.poster_path : null;
  const genre  = gname(item.genre_ids, gmap);
  const mt     = (item.media_type === 'movie' || item.media_type === 'tv') ? item.media_type : (t || state.mediaType || 'movie');
  const badge  = (item.media_type && item.media_type !== t)
    ? `<div class="card-type-badge">${item.media_type === 'movie' ? 'Film' : 'TV'}</div>` : '';

  return `<div class="card" onclick="openModal(${Number(item.id)},'${escapeHtml(mt)}')">
    <div class="card-thumb">
      ${poster ? `<img src="${poster}" alt="${title}" loading="lazy">` : `<div class="no-poster">🎬</div>`}
      <div class="card-play-bg">
        <div class="play-ring">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      ${rating ? `<div class="card-rating">★ ${rating}</div>` : ''}
      ${badge}
    </div>
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div class="card-foot">
        <span class="card-year">${year}</span>
        ${genre ? `<span class="card-genre">${escapeHtml(genre)}</span>` : ''}
      </div>
    </div>
  </div>`;
}