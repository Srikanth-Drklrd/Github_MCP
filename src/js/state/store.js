export const state = {
  mediaType: 'movie',
  curId: null,
  curItem: null,
  trailer: null,
  gMovies: {},
  gTv: {},
  debT: null,
  srcIdx: 0,
  fbTimer: null,
  ddOpen: false,
  curS: 1,
  curE: 1,
};

export function stopFb() {
  if (state.fbTimer) { clearTimeout(state.fbTimer); state.fbTimer = null; }
}