export function escapeHtml(s) {
  if (!s) return '';
  const el = document.createElement('div');
  el.textContent = s;
  return el.innerHTML;
}

export function gname(ids, map) {
  return (ids || []).slice(0,2).map(id => map[id]).filter(Boolean).join(', ');
}

export function toast(msg, ms = 3000) {
  const el = document.getElementById('toast');
  if (el._tt) clearTimeout(el._tt);
  el.textContent = msg; el.classList.add('show');
  el._tt = setTimeout(() => { el.classList.remove('show'); el._tt = null; }, ms);
}

export function skels(n, wide = false) {
  return Array(n).fill(`<div class="skel${wide?' skel-wide':''}">
    <div class="skel-thumb"></div>
    <div class="skel-info"><div class="skel-line"></div><div class="skel-line s"></div></div>
  </div>`).join('');
}