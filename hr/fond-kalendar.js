/* Radni sati · Fond sati: kalendar za odabir razdoblja
   Klik na mjesec u tablici otvori kalendar. Klik na početni i završni dan
   pokaže broj dana po danima u tjednu, radne dane, blagdane, subote i nedjelje. */
(function () {
  var m = location.pathname.match(/(20\d\d)/) ||
          (document.querySelector('tr.total-row td') || { textContent: '' }).textContent.match(/(20\d\d)/);
  if (!m) return;
  var GODINA = +m[1];
  var rows = document.querySelectorAll('tbody tr:not(.total-row)');
  if (rows.length !== 12) return;

  var MJESECI = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];
  var MJ_GEN = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja','srpnja','kolovoza','rujna','listopada','studenoga','prosinca'];
  var DANI = ['Pon','Uto','Sri','Čet','Pet','Sub','Ned'];

  /* ---------- hrvatski blagdani ---------- */
  function uskrs(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, mm = Math.floor((a + 11 * h + 22 * l) / 451),
        mj = Math.floor((h + l - 7 * mm + 114) / 31), dan = ((h + l - 7 * mm + 114) % 31) + 1;
    return new Date(y, mj - 1, dan);
  }
  function kljuc(d) { return d.getMonth() + '-' + d.getDate(); }
  var BLAGDANI = {};
  (function () {
    var y = GODINA, u = uskrs(y);
    function dodaj(d, ime) { BLAGDANI[kljuc(d)] = ime; }
    function plus(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
    dodaj(new Date(y, 0, 1), 'Nova godina');
    dodaj(new Date(y, 0, 6), 'Sveta tri kralja');
    dodaj(u, 'Uskrs');
    dodaj(plus(u, 1), 'Uskrsni ponedjeljak');
    dodaj(new Date(y, 4, 1), 'Praznik rada');
    dodaj(new Date(y, 4, 30), 'Dan državnosti');
    dodaj(plus(u, 60), 'Tijelovo');
    dodaj(new Date(y, 5, 22), 'Dan antifašističke borbe');
    dodaj(new Date(y, 7, 5), 'Dan pobjede i domovinske zahvalnosti');
    dodaj(new Date(y, 7, 15), 'Velika Gospa');
    dodaj(new Date(y, 10, 1), 'Svi sveti');
    dodaj(new Date(y, 10, 18), 'Dan sjećanja na žrtve Domovinskog rata i Dan sjećanja na žrtvu Vukovara i Škabrnje');
    dodaj(new Date(y, 11, 25), 'Božić');
    dodaj(new Date(y, 11, 26), 'Sveti Stjepan');
  })();
  function danUTjednu(d) { return (d.getDay() + 6) % 7; } // 0 = ponedjeljak

  /* ---------- stil ---------- */
  var css = `
  tbody tr.fk-klik{cursor:pointer}
  tbody tr.fk-klik td:first-child::after{content:" 📅";font-size:.8em;opacity:.55}
  tbody tr.fk-klik:hover td{background:rgba(255,255,255,.04)}
  .fk-pozadina{position:fixed;inset:0;background:rgba(3,3,10,.72);z-index:999;display:flex;align-items:center;justify-content:center;padding:14px}
  .fk-panel{background:#100e22;border:1px solid rgba(0,242,254,.35);border-radius:14px;box-shadow:0 0 30px rgba(0,242,254,.15);
    width:100%;max-width:430px;max-height:94vh;overflow:auto;padding:16px 16px 18px;color:#f8fafc;font-family:inherit}
  .fk-vrh{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
  .fk-vrh h3{margin:0;font-size:1.15rem;color:#00f2fe}
  .fk-x{background:none;border:0;color:#94a3b8;font-size:1.5rem;cursor:pointer;line-height:1}
  .fk-uputa{color:#94a3b8;font-size:.85rem;margin:0 0 10px}
  .fk-mreza{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
  .fk-dn{text-align:center;font-size:.72rem;color:#94a3b8;padding:2px 0;font-weight:700}
  .fk-d{aspect-ratio:1;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#f8fafc;border-radius:8px;
    font:600 .95rem inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;padding:0}
  .fk-d.vikend{color:#94a3b8}
  .fk-d.blagdan{color:#f59e0b;border-color:rgba(245,158,11,.5)}
  .fk-d.blagdan::after{content:"";position:absolute;bottom:4px;width:5px;height:5px;border-radius:50%;background:#f59e0b}
  .fk-d.u{background:rgba(0,242,254,.16);border-color:rgba(0,242,254,.4)}
  .fk-d.rub{background:#00f2fe;color:#04131a;border-color:#00f2fe}
  .fk-d:focus-visible{outline:2px solid #ff007f;outline-offset:1px}
  .fk-gumbi{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 4px}
  .fk-gumbi button{flex:1;min-width:110px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#f8fafc;
    border-radius:8px;padding:7px 6px;font:600 .8rem inherit;cursor:pointer}
  .fk-gumbi button:hover{border-color:#00f2fe}
  .fk-rez{margin-top:12px;border-top:1px solid rgba(255,255,255,.1);padding-top:12px}
  .fk-razdoblje{font-weight:700;margin-bottom:8px}
  .fk-tjedan{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;background:rgba(255,255,255,.04);border-radius:8px;padding:6px 0;margin-bottom:10px}
  .fk-tjedan span{display:block;font-size:.72rem;color:#94a3b8;font-weight:700}
  .fk-tjedan b{font-size:1.15rem}
  .fk-tjedan .vk b{color:#ff007f}
  .fk-red{display:flex;justify-content:space-between;padding:4px 0;font-size:.95rem}
  .fk-red b{font-variant-numeric:tabular-nums}
  .fk-red.glavni{font-size:1.05rem;color:#00f2fe}
  .fk-bl{font-size:.82rem;color:#f59e0b;margin:2px 0 0 0}
  .fk-sati{margin-top:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,.12)}
  .fk-sati label{display:flex;justify-content:space-between;align-items:center;font-size:.85rem;color:#94a3b8;margin-bottom:4px}
  .fk-sati select{background:#1a1733;color:#f8fafc;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:3px 6px;font:600 .85rem inherit}
  .fk-napomena{font-size:.72rem;color:#94a3b8;margin:0 0 6px;line-height:1.35}
  .fk-akcije{display:flex;gap:6px;margin-top:12px}.fk-akcije button{flex:1;margin-top:0!important}
  .fk-akcije .fk-sec{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.18);color:#f8fafc;border-radius:8px;padding:9px;font:700 .85rem inherit;cursor:pointer}
  .fk-akcije .fk-sec:hover{border-color:#00f2fe}
  .fk-alati{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin:10px 0}
  .fk-alati button{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18);color:#f8fafc;border-radius:8px;padding:8px 14px;font:600 .85rem inherit;cursor:pointer}
  .fk-alati button:hover{border-color:#00f2fe}
  .fk-kopiraj{margin-top:12px;width:100%;background:#ff007f;border:0;color:#fff;border-radius:8px;padding:9px;font:700 .9rem inherit;cursor:pointer}
  `;
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- kalendar ---------- */
  var mjesec = 0, odabran = [], pozadina = null, ZADNJI = null;
  var DN = 8; try { DN = +(localStorage.getItem('rs-dnevno') || 8) || 8; } catch (e) {}

  function datum(dan) { return new Date(GODINA, mjesec, dan); }
  function brojDana() { return new Date(GODINA, mjesec + 1, 0).getDate(); }
  function fmt(dan) { return dan + '. ' + MJ_GEN[mjesec]; }

  function otvori(i) {
    mjesec = i; odabran = [];
    pozadina = document.createElement('div');
    pozadina.className = 'fk-pozadina';
    pozadina.addEventListener('click', function (e) { if (e.target === pozadina) zatvori(); });
    document.body.appendChild(pozadina);
    crtaj();
    document.addEventListener('keydown', esc);
  }
  function zatvori() {
    if (pozadina) pozadina.remove(); pozadina = null;
    document.removeEventListener('keydown', esc);
  }
  function esc(e) { if (e.key === 'Escape') zatvori(); }

  function klikDan(d) {
    if (odabran.length !== 1) odabran = [d];
    else odabran = [Math.min(odabran[0], d), Math.max(odabran[0], d)];
    crtaj();
  }
  function postavi(a, b) { odabran = [a, b]; crtaj(); }

  function crtaj() {
    var n = brojDana(), prvi = danUTjednu(datum(1));
    var od = odabran[0], doo = odabran.length === 2 ? odabran[1] : odabran[0];
    var h = '<div class="fk-panel" role="dialog" aria-label="Kalendar ' + MJESECI[mjesec] + ' ' + GODINA + '">';
    h += '<div class="fk-vrh"><h3>' + MJESECI[mjesec] + ' ' + GODINA + '.</h3><button class="fk-x" aria-label="Zatvori">×</button></div>';
    h += '<p class="fk-uputa">' + (odabran.length === 0 ? 'Klikni početni dan razdoblja.' :
         odabran.length === 1 ? 'Klikni završni dan, ili odaberi brzi gumb ispod.' : 'Klikni bilo koji dan za novo razdoblje.') + '</p>';
    h += '<div class="fk-mreza">';
    DANI.forEach(function (x) { h += '<div class="fk-dn">' + x + '</div>'; });
    for (var p = 0; p < prvi; p++) h += '<div></div>';
    for (var d = 1; d <= n; d++) {
      var dt = datum(d), w = danUTjednu(dt), bl = BLAGDANI[kljuc(dt)];
      var kl = 'fk-d' + (w >= 5 ? ' vikend' : '') + (bl ? ' blagdan' : '');
      if (od && d >= od && d <= doo) kl += (d === od || d === doo) ? ' rub' : ' u';
      h += '<button class="' + kl + '" data-d="' + d + '"' + (bl ? ' title="' + bl + '"' : '') + '>' + d + '</button>';
    }
    h += '</div>';
    if (odabran.length === 1) {
      h += '<div class="fk-gumbi"><button data-brzo="kraj">' + od + '. → kraj mjeseca</button>' +
           '<button data-brzo="pocetak">1. → ' + od + '.</button></div>';
    } else if (odabran.length === 0) {
      h += '<div class="fk-gumbi"><button data-brzo="cijeli">Cijeli mjesec</button></div>';
    }
    if (od) h += rezultat(od, doo);
    h += '</div>';
    pozadina.innerHTML = h;

    pozadina.querySelector('.fk-x').onclick = zatvori;
    pozadina.querySelectorAll('.fk-d').forEach(function (b) { b.onclick = function () { klikDan(+b.dataset.d); }; });
    pozadina.querySelectorAll('[data-brzo]').forEach(function (b) {
      b.onclick = function () {
        var t = b.dataset.brzo;
        if (t === 'kraj') postavi(od, n); else if (t === 'pocetak') postavi(1, od); else postavi(1, n);
      };
    });
    var kop = pozadina.querySelector('.fk-kopiraj');
    if (kop) kop.onclick = function () {
      var txt = kop.dataset.tekst;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
        function () { kop.textContent = '✓ Kopirano'; },
        function () { window.prompt('Kopiraj tekst:', txt); });
    };
    var sel = pozadina.querySelector('.fk-dn-sel');
    if (sel) sel.onchange = function () { DN = +sel.value; try { localStorage.setItem('rs-dnevno', String(DN)); } catch (e) {} crtaj(); };
    var pr = pozadina.querySelector('.fk-print'); if (pr) pr.onclick = ispisRazdoblja;
    var xl = pozadina.querySelector('.fk-xls'); if (xl) xl.onclick = excelRazdoblja;
  }

  function hs(n) { return String(Math.round(n * 100) / 100).replace('.', ','); }
  function satRijec(n) { if (n !== Math.floor(n)) return 'sati'; return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'sata' : (n % 10 === 1 && n % 100 !== 11 ? 'sat' : 'sati'); }
  function nazivRazdoblja(z) { return fmt(z.od) + (z.od !== z.doo ? ' – ' + fmt(z.doo) : '') + ' ' + GODINA + '.'; }
  function ispisRazdoblja() {
    var z = ZADNJI; if (!z) return;
    var t = '<h1>Radni sati: ' + nazivRazdoblja(z) + '</h1><p>Razdoblje od ' + z.ukupno + (z.ukupno === 1 ? ' dana' : ' dana') + ' · dnevno radno vrijeme ' + hs(DN) + ' ' + satRijec(DN) + ' (jednako svaki radni dan)</p>';
    t += '<table><thead><tr>' + DANI.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody><tr>' + z.poDanu.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '</tr></tbody></table>';
    t += '<h2>Sažetak</h2><table><tbody>' +
      '<tr><td>Radni dani (pon–pet, bez blagdana)</td><td>' + z.radni + '</td></tr>' +
      '<tr><td>Blagdani na radni dan</td><td>' + z.blRadni.length + '</td></tr>' +
      '<tr><td>Subote</td><td>' + z.poDanu[5] + '</td></tr><tr><td>Nedjelje</td><td>' + z.poDanu[6] + '</td></tr>' +
      '<tr><td>Redovni sati bez blagdana (' + z.radni + ' × ' + hs(DN) + ' h)</td><td>' + hs(z.sRad) + '</td></tr><tr><td>Sati blagdana (' + z.blRadni.length + ' × ' + hs(DN) + ' h)</td><td>' + hs(z.sBl) + '</td></tr>' +
      '<tr class="uk"><td>Fond sati</td><td>' + hs(z.sFond) + '</td></tr></tbody></table>';
    if (z.blRadni.length) t += '<h2>Blagdani na radni dan</h2><table><tbody>' + z.blRadni.map(function (x) { return '<tr><td>' + x + '</td><td>' + hs(DN) + ' ' + satRijec(DN) + '</td></tr>'; }).join('') + '</tbody></table>';
    if (z.blVikend.length) t += '<h2>Blagdani na vikend</h2><p>' + z.blVikend.join('<br>') + '</p>';
    t += '<p class="izvor">Izrađeno na radni-sati.com</p>';
    rsIspis('Radni sati ' + nazivRazdoblja(z), t);
  }
  function excelRazdoblja() {
    var z = ZADNJI; if (!z) return;
    var R = [['Radni sati: ' + nazivRazdoblja(z)], ['Dnevno radno vrijeme (h)', hs(DN)], [], DANI, z.poDanu, [],
      ['Radni dani (pon–pet, bez blagdana)', z.radni], ['Blagdani na radni dan', z.blRadni.length], ['Subote', z.poDanu[5]], ['Nedjelje', z.poDanu[6]],
      ['Redovni sati bez blagdana (' + z.radni + ' × ' + hs(DN) + ' h)', hs(z.sRad)], ['Sati blagdana (' + z.blRadni.length + ' × ' + hs(DN) + ' h)', hs(z.sBl)], ['Fond sati', hs(z.sFond)]];
    if (z.blRadni.length) { R.push([], ['Blagdani na radni dan', 'Sati']); z.blRadni.forEach(function (x) { R.push([x, hs(DN)]); }); }
    if (z.blVikend.length) { R.push([], ['Blagdani na vikend']); z.blVikend.forEach(function (x) { R.push([x]); }); }
    rsCsv('radni-sati-' + GODINA + '-' + (mjesec + 1) + '-' + z.od + '-' + z.doo + '.csv', R);
  }

  function rezultat(od, doo) {
    var poDanu = [0, 0, 0, 0, 0, 0, 0], radni = 0, blRadni = [], blVikend = [];
    for (var d = od; d <= doo; d++) {
      var dt = datum(d), w = danUTjednu(dt), bl = BLAGDANI[kljuc(dt)];
      poDanu[w]++;
      if (bl) (w < 5 ? blRadni : blVikend).push(d + '. ' + DANI[w].toLowerCase() + ' – ' + bl);
      else if (w < 5) radni++;
    }
    var ukupno = doo - od + 1;
    var h = '<div class="fk-rez"><div class="fk-razdoblje">' + fmt(od) + (od !== doo ? ' – ' + fmt(doo) : '') +
            ' ' + GODINA + '. <span style="color:#94a3b8;font-weight:400">(' + ukupno + (ukupno === 1 ? ' dan' : ' dana') + ')</span></div>';
    h += '<div class="fk-tjedan">';
    DANI.forEach(function (x, i) { h += '<div' + (i >= 5 ? ' class="vk"' : '') + '><span>' + x + '</span><b>' + poDanu[i] + '</b></div>'; });
    h += '</div>';
    h += '<div class="fk-red glavni"><span>Radni dani (pon–pet, bez blagdana)</span><b>' + radni + '</b></div>';
    h += '<div class="fk-red"><span>Blagdani na radni dan</span><b>' + blRadni.length + '</b></div>';
    blRadni.forEach(function (x) { h += '<div class="fk-bl">• ' + x + ' <b style="float:right">' + hs(DN) + ' ' + satRijec(DN) + '</b></div>'; });
    h += '<div class="fk-red"><span>Subote</span><b>' + poDanu[5] + '</b></div>';
    h += '<div class="fk-red"><span>Nedjelje</span><b>' + poDanu[6] + '</b></div>';
    if (blVikend.length) {
      h += '<div class="fk-red"><span>Blagdani na vikend</span><b>' + blVikend.length + '</b></div>';
      blVikend.forEach(function (x) { h += '<div class="fk-bl">• ' + x + '</div>'; });
    }
    var tekst = 'Razdoblje: ' + od + '.' + (mjesec + 1) + '.–' + doo + '.' + (mjesec + 1) + '.' + GODINA + '. (' + ukupno + ' dana)\n' +
      DANI.map(function (x, i) { return x + ' ' + poDanu[i]; }).join(', ') + '\n' +
      'Radni dani (pon–pet): ' + radni + '\nBlagdani na radni dan: ' + blRadni.length +
      '\nSubote: ' + poDanu[5] + '\nNedjelje: ' + poDanu[6];
    var sRad = radni * DN, sBl = blRadni.length * DN, sFond = sRad + sBl;
    h += '<div class="fk-sati"><label>Dnevno radno vrijeme <select class="fk-dn-sel">' + [8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map(function (v) { return '<option value="' + v + '"' + (v === DN ? ' selected' : '') + '>' + hs(v) + ' ' + satRijec(v) + '</option>'; }).join('') + '</select></label>';
    h += '<div class="fk-napomena">Pretpostavlja se jednak broj sati svakog radnog dana. Za drukčiji raspored računajte prema stvarnom rasporedu rada.</div>';
    h += '<div class="fk-red"><span>Redovni sati bez blagdana <small style="color:#94a3b8">(' + radni + ' × ' + hs(DN) + ' h)</small></span><b>' + hs(sRad) + '</b></div>';
    h += '<div class="fk-red"><span>Sati blagdana <small style="color:#94a3b8">(' + blRadni.length + ' × ' + hs(DN) + ' h)</small></span><b>' + hs(sBl) + '</b></div>';
    h += '<div class="fk-red glavni"><span>Fond sati</span><b>' + hs(sFond) + '</b></div></div>';
    tekst += '\nDnevno radno vrijeme: ' + hs(DN) + ' h\nRedovni sati bez blagdana: ' + radni + ' × ' + hs(DN) + ' = ' + hs(sRad) + '\nSati blagdana: ' + blRadni.length + ' × ' + hs(DN) + ' = ' + hs(sBl) + (blRadni.length ? ' (' + blRadni.join('; ') + ')' : '') + '\nFond sati: ' + hs(sFond);
    ZADNJI = { od: od, doo: doo, ukupno: ukupno, poDanu: poDanu, radni: radni, blRadni: blRadni, blVikend: blVikend, sRad: sRad, sBl: sBl, sFond: sFond };
    h += '<div class="fk-akcije"><button class="fk-kopiraj" data-tekst="' + tekst.replace(/"/g, '&quot;') + '">Kopiraj</button><button class="fk-sec fk-print">Ispiši / PDF</button><button class="fk-sec fk-xls">Excel (CSV)</button></div></div>';
    return h;
  }

  /* ---------- klik na mjesec u tablici ---------- */
  rows.forEach(function (r, i) {
    r.classList.add('fk-klik');
    r.setAttribute('tabindex', '0');
    r.setAttribute('title', 'Otvori kalendar za ' + MJESECI[i].toLowerCase());
    r.addEventListener('click', function () { otvori(i); });
    r.addEventListener('keydown', function (e) { if (e.key === 'Enter') otvori(i); });
  });

  /* ---------- ispis i Excel cijele godišnje tablice ---------- */
  function escH(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  window.rsIspis = window.rsIspis || function (naslov, tijelo) {
    var f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    var d = f.contentWindow.document;
    d.open();
    d.write('<!DOCTYPE html><html lang="hr"><head><meta charset="utf-8"><title>' + escH(naslov) + '</title><style>' +
      'body{font:11pt/1.45 Arial,sans-serif;color:#000;margin:18mm}h1{font-size:17pt;margin:0 0 10px}h2{font-size:12pt;margin:18px 0 6px}' +
      'table{border-collapse:collapse;width:100%;font-size:10pt}th,td{border:1px solid #444;padding:4px 6px;text-align:left}th{background:#eee}' +
      'tr.uk td,tr.uk th{font-weight:bold;background:#f3f3f3}.izvor{margin-top:24px;font-size:8pt;color:#666}@page{size:A4;margin:0}</style></head><body>' + tijelo + '</body></html>');
    d.close();
    setTimeout(function () { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(function () { f.remove(); }, 1500); }, 250);
  };
  window.rsCsv = window.rsCsv || function (ime, redovi) {
    var txt = '\ufeff' + redovi.map(function (r) {
      return r.map(function (c) { var s = String(c === undefined ? '' : c); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';');
    }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = ime; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  };
  var tablica = rows[0].closest('table');
  if (tablica && !document.querySelector('.fk-alati')) {
    var alati = document.createElement('div');
    alati.className = 'fk-alati';
    alati.innerHTML = '<button type="button" class="fk-t-print">🖨️ Ispiši / PDF</button><button type="button" class="fk-t-xls">📊 Excel (CSV)</button>';
    tablica.parentNode.insertBefore(alati, tablica);
    function redoviTablice() {
      return Array.prototype.map.call(tablica.querySelectorAll('tr'), function (tr) {
        return Array.prototype.map.call(tr.children, function (c) { return c.textContent.replace(/📅/g, '').trim(); });
      });
    }
    alati.querySelector('.fk-t-print').onclick = function () {
      var R = redoviTablice(), t = '<h1>Fond sati ' + GODINA + '.</h1><table>';
      R.forEach(function (r, i) {
        var tag = i === 0 ? 'th' : 'td', uk = /^UKUPNO/i.test(r[0] || '');
        t += '<tr' + (uk ? ' class="uk"' : '') + '>' + r.map(function (c) { return '<' + tag + '>' + escH(c) + '</' + tag + '>'; }).join('') + '</tr>';
      });
      t += '</table><p>Fond sati = dani od ponedjeljka do petka × 8 sati, uključujući blagdane. Radni sati = redovni sati prema kalendaru, bez blagdana.</p><p class="izvor">Izrađeno na radni-sati.com</p>';
      rsIspis('Fond sati ' + GODINA, t);
    };
    alati.querySelector('.fk-t-xls').onclick = function () { rsCsv('fond-sati-' + GODINA + '.csv', [['Fond sati ' + GODINA + '.'], []].concat(redoviTablice())); };
  }
})();
