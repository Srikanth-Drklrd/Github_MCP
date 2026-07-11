import { PROXIES } from '../config/providers.js';

const BASE = 'https://api.themoviedb.org/3';
const KEY = typeof TMDB_API_KEY !== 'undefined' ? TMDB_API_KEY : '6b2dec73b6697866a50cdaef60ccffcb';

let probeIdx = -2;
let probeP = null;

async function fetchJSON(url) {
  const r = await fetch(url, { cache: 'default' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const txt = await r.text();
  try {
    const j = JSON.parse(txt);
    if (typeof j.contents === 'string') return JSON.parse(j.contents);
    return j;
  } catch(e) { throw new Error('Bad JSON'); }
}

async function probe(tmdbUrl) {
  try { const j = await fetchJSON(tmdbUrl); probeIdx = -1; return j; } catch(e) {}
  for (let i = 0; i < PROXIES.length; i++) {
    try { const j = await fetchJSON(PROXIES[i](tmdbUrl)); probeIdx = i; return j; } catch(e) {}
  }
  probeIdx = -1; return {};
}

export async function api(path, page = 1) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${BASE}${path}${sep}api_key=${KEY}&page=${page}`;

  if (probeIdx === -2) {
    if (!probeP) probeP = probe(url);
    return await probeP;
  }
  try {
    if (probeIdx === -1) return await fetchJSON(url);
    return await fetchJSON(PROXIES[probeIdx](url));
  } catch(e) {
    probeIdx = -2; probeP = null;
    return {};
  }
}