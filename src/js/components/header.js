export function initHeader(onSearch, onTypeChange, onHome) {
  const header = document.getElementById('header');
  const searchInput = document.getElementById('searchInput');
  const moviesTab = document.getElementById('moviesTab');
  const tvTab = document.getElementById('tvTab');
  const logo = document.querySelector('.logo');

  logo.onclick = onHome;
  moviesTab.onclick = () => onTypeChange('movie');
  tvTab.onclick = () => onTypeChange('tv');

  let debT;
  searchInput.addEventListener('input', e => {
    clearTimeout(debT);
    debT = setTimeout(() => onSearch(e.target.value), 380);
  });
}

export function setActiveType(type) {
  document.getElementById('moviesTab').classList.toggle('active', type === 'movie');
  document.getElementById('tvTab').classList.toggle('active', type === 'tv');
}

export function showHeader(hidden = false) {
  document.getElementById('header').classList.toggle('hidden', hidden);
}

export function clearSearch() {
  const input = document.getElementById('searchInput');
  input.value = '';
  document.getElementById('searchSection').style.display = 'none';
  document.getElementById('sectionsWrap').style.display = '';
}