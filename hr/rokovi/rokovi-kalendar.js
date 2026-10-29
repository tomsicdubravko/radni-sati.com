/* Radni sati · kvačice Blagdani / Računovodstveni rokovi na kalendaru blagdana.
   Podaci: /rokovi/rokovi-2026.js (window.RS_ROKOVI). Izbor kvačica pamti se u pregledniku. */
(function () {
  var grid = document.getElementById('mjeseci');
  if (!grid) return;
  var MJG = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja','srpnja','kolovoza','rujna','listopada','studenoga','prosinca'];
  var KLJUC = 'hr-kal-filteri';
  /* Jednokratno preuzimanje: stari ključ koristio je samo hrvatski kalendar; izvorni zapis se ne briše. */
  try { if (localStorage.getItem(KLJUC) === null) { var stari = localStorage.getItem('rs-kal-filteri'); if (stari !== null) localStorage.setItem(KLJUC, stari); } } catch (e) {}
  var S = { bl: true, rk: false };
  try { var sp = JSON.parse(localStorage.getItem(KLJUC) || 'null'); if (sp) { S.bl = sp.bl !== false; S.rk = !!sp.rk; } } catch (e) {}
  function spremi() { try { localStorage.setItem(KLJUC, JSON.stringify(S)); } catch (e) {} }
  try { var qp = new URLSearchParams(location.search).get('rokovi'); if (qp === '1') { S.rk = true; spremi(); } } catch (e) {}
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function godina() { var g = document.getElementById('god'); var n = g ? parseInt(g.textContent, 10) : NaN; return isNaN(n) ? new Date().getFullYear() : n; }
  function fmt(iso) { var p = iso.split('-').map(Number); return p[2] + '. ' + MJG[p[1] - 1] + ' ' + p[0] + '.'; }

  /* ---------- stil ---------- */
  var css = '' +
    '.rk-filteri{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin:0 0 14px;padding:12px 14px;border:1px solid var(--border-dim,rgba(255,255,255,.12));border-radius:12px;background:var(--bg-card,rgba(255,255,255,.03))}' +
    '.rk-filteri label{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:.95rem;cursor:pointer;color:var(--text-light,#e2e8f0)}' +
    '.rk-filteri input{width:20px;height:20px;accent-color:#f59e0b;cursor:pointer}' +
    '.rk-filteri .rk-sw{display:inline-block;width:12px;height:12px;border-radius:3px}' +
    '.rk-filteri small{color:var(--text-muted,#94a3b8);font-size:.78rem;flex-basis:100%}' +
    '#mjeseci.rk-bez-bl .c.hol{background:transparent!important;color:inherit!important;border-color:transparent!important;box-shadow:none!important;font-weight:inherit}' +
    '#mjeseci .c{position:relative}' +
    '#mjeseci .c.rk-ima{box-shadow:inset 0 0 0 2px #f59e0b}' +
    '#mjeseci .c.rk-ima::after{content:"";position:absolute;right:3px;top:3px;width:6px;height:6px;border-radius:50%;background:#f59e0b}' +
    '.rk-panel{scroll-margin-top:72px;margin:12px 0 26px;border:1px solid rgba(245,158,11,.45);border-radius:12px;padding:14px 16px;background:rgba(245,158,11,.06);display:none}' +
    '.rk-panel.on{display:block}' +
    '.rk-panel h3{margin:0 0 10px;font-size:1.05rem;color:#fff}' +
    '.rk-st{border-top:1px solid rgba(255,255,255,.1);padding:10px 0}' +
    '.rk-st:first-of-type{border-top:0;padding-top:0}' +
    '.rk-st b{display:block;color:#fbbf24;font-size:.98rem;margin-bottom:3px}' +
    '.rk-st .bl{color:#ff5fa2}' +
    '.rk-st div{font-size:.86rem;color:var(--text-light,#e2e8f0);line-height:1.5}' +
    '.rk-st span.m{color:var(--text-muted,#94a3b8)}' +
    '.rk-st a{color:var(--neon-cyan,#00f2fe)}' +
    '.rk-st .izv{font-size:.76rem;color:var(--text-muted,#94a3b8);margin-top:4px}' +
    '.rk-natrag{display:inline-block;margin-top:10px;background:none;border:1px solid rgba(255,255,255,.2);color:var(--text-light,#e2e8f0);border-radius:8px;padding:7px 12px;font:600 .82rem inherit;cursor:pointer}.rk-natrag:hover{border-color:#f59e0b}#mjeseci .c{scroll-margin-top:90px}' +
    '#mostovi.rk-sklopivo h2{cursor:pointer;user-select:none}' +
    '#mostovi.rk-sklopivo h2::after{content:" ▾";color:var(--text-muted,#94a3b8);font-size:.85em}' +
    '#mostovi.rk-zatvoreno h2::after{content:" ▸ prikaži";color:#f59e0b;font-size:.75em;font-weight:600}' +
    '#mostovi.rk-zatvoreno > :not(h2){display:none!important}' +
    '#mostovi.rk-zatvoreno{margin-bottom:18px}' +
    '.rk-napomena{font-size:.78rem;color:var(--text-muted,#94a3b8);margin-top:8px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- kvačice ---------- */
  var bar = document.createElement('div');
  bar.className = 'rk-filteri';
  bar.innerHTML =
    '<label><input type="checkbox" id="rk-bl"> <span class="rk-sw" style="background:#ff007f"></span>Blagdani</label>' +
    '<label><input type="checkbox" id="rk-rk"> <span class="rk-sw" style="background:#f59e0b"></span>Računovodstveni rokovi</label>' +
    '<small id="rk-opis">Kliknite na datum u kalendaru za popis obveza toga dana.</small>';
  grid.parentNode.insertBefore(bar, grid);
  var panel = document.createElement('div');
  panel.className = 'rk-panel'; panel.id = 'rk-panel'; panel.setAttribute('aria-live', 'polite');
  var info = document.getElementById('holidayInfo');
  (info || grid).parentNode.insertBefore(panel, (info || grid).nextSibling);
  var cbB = document.getElementById('rk-bl'), cbR = document.getElementById('rk-rk');
  cbB.checked = S.bl; cbR.checked = S.rk;
  cbB.onchange = function () { S.bl = cbB.checked; mostRucno = null; spremi(); primijeni(); };
  cbR.onchange = function () { S.rk = cbR.checked; spremi(); primijeni(); };

  function rokoviGodine(y) { return (window.RS_ROKOVI && window.RS_ROKOVI[y]) || null; }
  function poDatumu(y) {
    var o = {}, R = rokoviGodine(y) || [];
    R.forEach(function (r) { (o[r.d] = o[r.d] || []).push(r); });
    return o;
  }

  /* ---------- oznake u kalendaru ---------- */
  var zadnjiKlik = null, mostRucno = null;
  function mostovi() {
    var m = document.getElementById('mostovi'); if (!m || !m.querySelector('h2')) return;
    m.classList.add('rk-sklopivo');
    var otvoreno = mostRucno !== null ? mostRucno : S.bl;
    m.classList.toggle('rk-zatvoreno', !otvoreno);
    var h = m.querySelector('h2'); h.setAttribute('role', 'button'); h.setAttribute('tabindex', '0'); h.setAttribute('aria-expanded', otvoreno ? 'true' : 'false');
  }
  var mEl = document.getElementById('mostovi');
  if (mEl) {
    var prekidac = function (e) {
      if (!e.target.closest('h2')) return;
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      mostRucno = mEl.classList.contains('rk-zatvoreno');
      mostovi();
    };
    mEl.addEventListener('click', prekidac); mEl.addEventListener('keydown', prekidac);
  }
  function primijeni() {
    var y = godina(), M = poDatumu(y), R = rokoviGodine(y);
    grid.classList.toggle('rk-bez-bl', !S.bl);
    mostovi();
    if (info) info.style.display = S.bl ? '' : 'none';
    var lg = document.querySelector('.calendar-legend .dot.holiday'); if (lg && lg.parentNode) lg.parentNode.style.display = S.bl ? '' : 'none';
    if (!S.bl) { document.querySelectorAll('.mg .c.is-selected,.holiday-row.is-selected').forEach(function (el) { el.classList.remove('is-selected'); }); }
    grid.querySelectorAll('.c[data-date]').forEach(function (b) {
      var k = b.getAttribute('data-date'), ima = S.rk && M[k];
      b.classList.toggle('rk-ima', !!ima);
      if (ima) b.setAttribute('title', M[k].length + (M[k].length === 1 ? ' rok' : ' roka'));
      else b.removeAttribute('title');
    });
    var opis = document.getElementById('rk-opis');
    if (S.rk && !R) { opis.innerHTML = '<b style="color:#fbbf24">Računovodstveni rokovi za ' + y + '. nisu učitani na ovoj stranici.</b> To ne znači da u toj godini nema obveza. Trenutačno su dostupni rokovi za 2026.'; }
    else opis.textContent = 'Kliknite na datum u kalendaru za popis obveza toga dana.';
    if (zadnjiKlik) prikazi(zadnjiKlik); else panel.classList.remove('on');
  }

  /* ---------- popis događaja za odabrani dan ---------- */
  function prikazi(k) {
    var y = godina();
    if (!S.bl && !S.rk) { panel.classList.remove('on'); panel.innerHTML = ''; return; }
    if (k.slice(0, 4) !== String(y)) { panel.classList.remove('on'); return; }
    var dog = '', h = (typeof blagdani === 'function') ? blagdani(y)[k] : '';
    if (S.bl && h) dog += '<div class="rk-st"><b class="bl">Blagdan: ' + esc(h) + '</b></div>';
    var L = S.rk ? (poDatumu(y)[k] || []) : [];
    L.forEach(function (r) {
      dog += '<div class="rk-st"><b>' + esc(r.n) + '</b>' +
        '<div>' + (r.f && r.f !== '—' ? '<span class="m">Obrazac:</span> ' + esc(r.f) + ' · ' : '') + '<span class="m">Razdoblje:</span> ' + esc(r.r) + '</div>' +
        '<div><span class="m">Odnosi se na:</span> ' + esc(r.t) + '</div>' +
        (r.o !== r.d ? '<div><span class="m">Izvorni rok:</span> ' + fmt(r.o) + ' – pomaknuto na prvi radni dan</div>' : '') +
        (r.z ? '<div><span class="m">Napomena:</span> ' + esc(r.z) + '</div>' : '') +
        '<div class="izv">' + esc(r.p) + (r.pu ? ' <a href="' + esc(r.pu) + '" target="_blank" rel="noopener">Propis</a>' : '') + '</div>' +
        '<div class="izv">Izvor roka: <a href="' + esc(r.iu) + '" target="_blank" rel="noopener">' + esc(r.iz) + '</a> · podaci ažurirani ' + esc(window.RS_ROKOVI_PROVJERA || '') + '</div>' +
        '</div>';
    });
    if (S.rk && !rokoviGodine(y)) {
      dog += '<div class="rk-st"><div><b style="color:#fbbf24">Računovodstveni rokovi za ' + y + '. nisu učitani.</b> To ne znači da toga dana nema obveza – provjerite službene izvore.</div></div>';
    }
    if (!dog) {
      if (!S.rk) { panel.classList.remove('on'); return; }
      dog = '<div class="rk-st"><div>Za ovaj dan nema računovodstvenih rokova u kalendaru.</div></div>';
    }
    panel.innerHTML = '<h3>' + fmt(k) + '</h3>' + dog +
      (L.length ? '<div class="rk-napomena">Kalendar je informativan i nije službeni izvor. Prije predaje provjerite propis ili se obratite knjigovođi.</div>' : '') +
      '<button type="button" class="rk-natrag">↑ Natrag na kalendar</button>';
    var nb = panel.querySelector('.rk-natrag');
    if (nb) nb.onclick = function () { var c = grid.querySelector('.c[data-date="' + k + '"]'); if (c) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.focus({ preventScroll: true }); } };
    panel.classList.add('on');
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-date]'); if (!b) return;
    e.stopPropagation();
    document.querySelectorAll('.holiday-row.is-selected,.mg .c.is-selected').forEach(function (el) { el.classList.remove('is-selected'); });
    if (S.bl) {
      var y = godina(), k = b.getAttribute('data-date'), h = (typeof blagdani === 'function') ? blagdani(y)[k] : '', p = k.split('-');
      if (info) info.textContent = h ? (+p[2]) + '. ' + MJG[+p[1] - 1] + ' ' + y + '. — ' + h : 'Za ' + (+p[2]) + '. ' + MJG[+p[1] - 1] + ' nema državnog blagdana.';
      if (h) { b.classList.add('is-selected'); var row = document.getElementById('blagdan-' + k); if (row) row.classList.add('is-selected'); var det = document.querySelector('.holiday-details'); if (det) det.open = true; }
    }
    obradiKlik(b);
  }, true);
  function obradiKlik(b) {
    zadnjiKlik = b.getAttribute('data-date');
    setTimeout(function () {
      prikazi(zadnjiKlik);
      if (panel.classList.contains('on')) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  /* ponovno označi nakon promjene godine (kalendar se iscrtava iznova) */
  new MutationObserver(function () { zadnjiKlik = null; primijeni(); }).observe(grid, { childList: true });
  primijeni();
})();
