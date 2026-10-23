/* Radni sati · Planer godišnjeg odmora
   Klik na radni dan u kalendaru označi godišnji. Neradni dani prema rasporedu i praznici se ne troše.
   Plan se pamti u pretraživaču (localStorage), štampa i izvoz u Excel (CSV). */
(function () {
  var MJN = ['Januar','Februar','Mart','April','Maj','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'];
  var MJ_G = ['januara','februara','marta','aprila','maja','juna','jula','avgusta','septembra','oktobra','novembra','decembra'];
  var DK = ['ned','pon','uto','sre','čet','pet','sub'];
  var DANI_H = ['Po','Ut','Sr','Če','Pe','Su','Ne'];

  function p2(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function add(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function odIso(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function hol(d) { return praznici(d.getFullYear())[iso(d)] || ''; }
  function vik(d) { var w = d.getDay(); return w === 0 || (w === 6 && S.nedelja !== 6); }
  function dan(d, y) { return d.getDate() + '. ' + MJ_G[d.getMonth()] + (d.getFullYear() !== y ? ' ' + d.getFullYear() + '.' : ''); }
  function raspon(a, b, y) {
    if (iso(a) === iso(b)) return dan(a, y);
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return a.getDate() + '.–' + dan(b, y);
    return dan(a, y) + ' – ' + dan(b, y);
  }
  function rijecDana(n) { return n % 10 === 1 && n % 100 !== 11 ? 'dan' : 'dana'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- stil ---------- */
  var css = `
  .planer{margin:10px 0 44px}
  .planer h2{font-size:1.3rem;color:#fff;margin-bottom:8px}
  .pl-lead{color:var(--text-muted);font-size:.92rem;margin-bottom:16px}
  .pl-kontrole{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin-bottom:14px}
  .pl-kontrole label{display:flex;flex-direction:column;gap:4px;font-size:.75rem;color:var(--text-muted)}
  .pl-kontrole input{width:90px;font:600 1rem inherit;color:var(--text-light);background:rgba(255,255,255,.05);border:1px solid var(--border-dim);border-radius:8px;padding:8px 10px;color-scheme:dark}
  .pl-btn{background:rgba(255,255,255,.06);border:1px solid var(--border-dim);color:var(--text-light);border-radius:8px;padding:9px 14px;font:600 .85rem inherit;cursor:pointer}
  .pl-btn:hover{border-color:var(--neon-cyan)}
  .pl-btn.glavni{background:rgba(16,185,129,.16);border-color:var(--neon-green);color:#fff}
  .pl-stat{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
  .pl-stat div{background:var(--bg-card);border:1px solid var(--border-dim);border-radius:10px;padding:12px}
  .pl-stat b{display:block;font-size:1.5rem;color:var(--neon-cyan);line-height:1.1}
  .pl-stat b.minus{color:var(--neon-pink)}
  .pl-stat span{font-size:.75rem;color:var(--text-muted)}
  .pl-pojasnjenje{font-size:.8rem;color:var(--text-muted);margin:-4px 0 14px;max-width:780px}
  .pl-kontrole select{font:600 .9rem inherit;color:var(--text-light);background:rgba(255,255,255,.05);border:1px solid var(--border-dim);border-radius:8px;padding:8px 10px;color-scheme:dark}
  .pl-legenda{display:flex;flex-wrap:wrap;gap:14px;font-size:.78rem;color:var(--text-muted);margin-bottom:12px}
  .pl-legenda i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:5px;vertical-align:-1px}
  .pl-meseci{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
  .pl-mj{background:var(--bg-card);border:1px solid var(--border-dim);border-radius:10px;padding:12px}
  .pl-mj h3{font-size:.85rem;color:var(--neon-cyan);margin:0 0 8px;display:flex;justify-content:space-between}
  .pl-mj h3 small{color:var(--neon-gold);font-weight:600}
  .pl-mreza{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center}
  .pl-mreza .h{font-size:.66rem;color:var(--text-muted);padding-bottom:2px}
  .pl-d{border:1px solid transparent;background:rgba(255,255,255,.04);color:var(--text-light);border-radius:5px;padding:5px 0;font:600 .8rem inherit;cursor:pointer;min-width:0}
  .pl-d:hover{border-color:var(--neon-cyan)}
  .pl-d.vik{color:var(--text-muted);background:rgba(255,255,255,.015);cursor:default}
  .pl-d.hol{color:#fff;background:rgba(255,0,127,.55);cursor:help}
  .pl-d.blk{box-shadow:inset 0 -3px 0 var(--neon-gold)}
  .pl-d.go{background:var(--neon-gold);color:#1a1205;border-color:var(--neon-gold)}
  .pl-d:disabled{opacity:1}
  .pl-blokovi{margin-top:18px}
  .pl-blokovi h3{font-size:1rem;color:#fff;margin-bottom:8px}
  .pl-blok{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-dim);font-size:.9rem}
  .pl-blok b{color:var(--neon-gold)}
  .pl-prazno{color:var(--text-muted);font-size:.88rem}
  @media(max-width:640px){.pl-stat{grid-template-columns:repeat(2,1fr)}.pl-blok{flex-direction:column;gap:2px}}
  .pl-stat{position:sticky;top:56px;z-index:30;background:var(--bg-main,#070611);padding:8px 0;box-shadow:0 10px 14px -12px rgba(0,0,0,.9)}
  @media(max-width:640px){.pl-stat{grid-template-columns:repeat(4,1fr);gap:6px;padding:6px 0}.pl-stat div{padding:6px 7px;border-radius:8px}.pl-stat b{font-size:1.15rem}.pl-stat span{display:block;font-size:.6rem;line-height:1.15}}
  `;
  var st0 = document.createElement('style'); st0.textContent = css; document.head.appendChild(st0);

  /* ---------- stanje ---------- */
  var Y = null, S = { dani: 20, go: [], nedelja: 5 };
  function ucitaj(y) {
    try { var s = JSON.parse(localStorage.getItem(BA.key + '-planer-' + y) || 'null'); if (s && Array.isArray(s.go)) { s.nedelja = s.nedelja === 6 ? 6 : 5; return s; } } catch (e) {}
    var dani = 20; try { dani = +(localStorage.getItem(BA.key + '-planer-dani') || 20) || 20; } catch (e) {}
    return { dani: dani, go: [], nedelja: 5 };
  }
  function sačuvaj() {
    try { localStorage.setItem(BA.key + '-planer-' + Y, JSON.stringify(S)); localStorage.setItem(BA.key + '-planer-dani', String(S.dani)); } catch (e) {}
  }
  function goSkup() { var o = {}; S.go.forEach(function (k) { o[k] = 1; }); return o; }
  function slobodan(d, G) { return vik(d) || !!hol(d) || !!G[iso(d)]; }

  function blokovi() {
    var G = goSkup(), res = [], viđeno = {};
    S.go.slice().sort().forEach(function (k) {
      var d = odIso(k), a = d, b = d;
      while (slobodan(add(a, -1), G)) a = add(a, -1);
      while (slobodan(add(b, 1), G)) b = add(b, 1);
      if (viđeno[iso(a)]) return; viđeno[iso(a)] = 1;
      var n = 0; for (var x = a; x <= b; x = add(x, 1)) if (G[iso(x)]) n++;
      res.push({ a: a, b: b, len: Math.round((b - a) / 864e5) + 1, go: n });
    });
    return res;
  }

  /* ---------- predlog rasporeda ---------- */
  function predlozi() {
    var budzet = S.dani, G = {}, H = praznici(Y), kandidati = [], vid = {};
    Object.keys(H).sort().forEach(function (k) {
      var d = odIso(k); if (vik(d)) return;
      var a = d, b = d;
      while (slobodan(add(a, -1), {})) a = add(a, -1);
      while (slobodan(add(b, 1), {})) b = add(b, 1);
      [-1, 1].forEach(function (smer) {
        var g = 0, uzmi = [], z = add(smer < 0 ? a : b, smer);
        while (!slobodan(z, {}) && g < 5) { g++; uzmi.push(iso(z)); z = add(z, smer); }
        if (g === 0 || g > 4 || uzmi.some(function (k2) { return k2.slice(0, 4) !== String(Y); })) return;
        var e = z; while (slobodan(add(e, smer), {})) e = add(e, smer);
        var ukupno = Math.round(((smer < 0 ? b : e) - (smer < 0 ? e : a)) / 864e5) + 1;
        var kljucK = uzmi.slice().sort().join(',');
        if (vid[kljucK]) return; vid[kljucK] = 1;
        kandidati.push({ g: g, uzmi: uzmi, odnos: ukupno / g });
      });
    });
    kandidati.sort(function (p, q) { return q.odnos - p.odnos || p.g - q.g; });
    kandidati.forEach(function (c) {
      if (c.odnos < 2.5 || c.g > budzet) return;
      if (c.uzmi.some(function (k) { return G[k]; })) return;
      c.uzmi.forEach(function (k) { G[k] = 1; }); budzet -= c.g;
    });
    // letnji odmor: nedelja u julu/avgustu s najmanje potrebnih dana
    var najbolji = null;
    for (var d = new Date(Y, 6, 1); d <= new Date(Y, 7, 24); d = add(d, 1)) {
      if (d.getDay() !== 1) continue;
      var dani = []; for (var i = 0; i < (S.nedelja === 6 ? 6 : 5); i++) { var x = add(d, i); if (!vik(x) && !hol(x) && !G[iso(x)]) dani.push(iso(x)); }
      if (dani.length >= 3 && dani.length <= budzet && (!najbolji || dani.length < najbolji.length)) najbolji = dani;
    }
    var zadnji = null;
    if (najbolji) { najbolji.forEach(function (k) { G[k] = 1; }); budzet -= najbolji.length; zadnji = odIso(najbolji[najbolji.length - 1]); }
    // ostatak: nastavi letnji odmor (ili dodaj na kraj zadnjeg bloka)
    if (!zadnji) { var sv = Object.keys(G).sort(); zadnji = sv.length ? odIso(sv[sv.length - 1]) : new Date(Y, 6, 1); }
    var z2 = add(zadnji, 1), sigurnost = 0;
    while (budzet > 0 && sigurnost++ < 400 && z2.getFullYear() === Y) {
      if (!vik(z2) && !hol(z2) && !G[iso(z2)]) { G[iso(z2)] = 1; budzet--; }
      z2 = add(z2, 1);
    }
    S.go = Object.keys(G).sort(); sačuvaj(); crtaj();
  }

  /* ---------- crtanje ---------- */
  var host = null;
  function crtaj() {
    if (!host) return;
    var G = goSkup(), B = blokovi(), uBloku = {};
    B.forEach(function (bl) { for (var x = bl.a; x <= bl.b; x = add(x, 1)) uBloku[iso(x)] = 1; });
    var iskor = S.go.length, ostalo = S.dani - iskor;
    var ukSlob = B.reduce(function (s, b) { return s + b.len; }, 0);
    var najdulji = B.reduce(function (m, b) { return Math.max(m, b.len); }, 0);
    var h = '<h2>Planer godišnjeg odmora · ' + BA.name + ' · ' + Y + '.</h2>' +
      '<p class="pl-lead">Upišite koliko imate dana godišnjeg i klikom na radne dane u kalendaru označite kada ga koristite. Neradni dani prema izabranom nedelji i praznici ne troše godišnji, pa planer odmah pokazuje koliko ukupno slobodnih dana dobijate. Plan se čuva u vašem pretraživaču.</p>' +
      '<div class="pl-kontrole"><label>Radna nedelja<select id="pl-nedelja" aria-label="Radna nedelja"><option value="5"' + (S.nedelja === 5 ? ' selected' : '') + '>Pon–pet (5 dana)</option><option value="6"' + (S.nedelja === 6 ? ' selected' : '') + '>Pon–sub (6 dana)</option></select></label><label>Dana godišnjeg<input type="number" min="0" max="60" id="pl-dani" value="' + S.dani + '"></label>' +
      '<button class="pl-btn glavni" id="pl-predlozi">✨ Predloži najbolji raspored</button>' +
      '<button class="pl-btn" id="pl-print">Štampaj / PDF</button>' +
      '<button class="pl-btn" id="pl-xls">Excel (CSV)</button>' +
      '<button class="pl-btn" id="pl-ocisti">Očisti</button></div>' +
      '<div class="pl-stat"><div><b>' + iskor + '</b><span>iskorišćeno dana</span></div>' +
      '<div><b class="' + (ostalo < 0 ? 'minus' : '') + '">' + ostalo + '</b><span>' + (ostalo < 0 ? 'previše označeno' : 'preostalo dana') + '</span></div>' +
      '<div><b>' + ukSlob + '</b><span>slobodnih dana u planiranim odmorima</span></div>' +
      '<div><b>' + najdulji + '</b><span>najduži odmor (dana)</span></div></div>' +
      '<p class="pl-pojasnjenje">Broj slobodnih dana odnosi se samo na povezane periode označenog godišnjeg, uključujući pripadajuće neradne dane i praznike — ne na sve vikende tokom godine.</p>' +
      '<div class="pl-legenda"><span><i style="background:var(--neon-gold)"></i>godišnji</span><span><i style="background:rgba(255,0,127,.55)"></i>praznik</span><span><i style="background:rgba(255,255,255,.08);box-shadow:inset 0 -3px 0 var(--neon-gold)"></i>slobodno uz godišnji</span></div>' +
      '<div class="pl-meseci">';
    for (var m = 0; m < 12; m++) {
      var prvi = (new Date(Y, m, 1).getDay() + 6) % 7, n = new Date(Y, m + 1, 0).getDate(), goMj = 0, mr = '';
      DANI_H.forEach(function (x) { mr += '<div class="h">' + x + '</div>'; });
      for (var p = 0; p < prvi; p++) mr += '<div></div>';
      for (var dd = 1; dd <= n; dd++) {
        var dt = new Date(Y, m, dd), k = iso(dt), hh = hol(dt), v = vik(dt), kl = 'pl-d';
        if (hh) kl += ' hol'; else if (v) kl += ' vik';
        if (G[k]) { kl += ' go'; goMj++; } else if (uBloku[k]) kl += ' blk';
        var naslov = hh ? hh : (v ? 'Vikend' : (G[k] ? 'Godišnji – klik za uklanjanje' : 'Klik za godišnji'));
        mr += '<button class="' + kl + '" data-k="' + k + '" title="' + esc(naslov) + '"' + ((hh || v) ? ' disabled' : '') + '>' + dd + '</button>';
      }
      h += '<div class="pl-mj"><h3>' + MJN[m] + (goMj ? '<small>' + goMj + ' GO</small>' : '') + '</h3><div class="pl-mreza">' + mr + '</div></div>';
    }
    h += '</div><div class="pl-blokovi"><h3>Vaši odmori</h3>';
    if (!B.length) h += '<p class="pl-prazno">Još nema označenih dana. Kliknite na radni dan u kalendaru ili na „Predloži najbolji raspored“.</p>';
    B.forEach(function (bl) {
      h += '<div class="pl-blok"><span>' + raspon(bl.a, bl.b, Y) + '</span><span><b>' + bl.len + ' ' + (bl.len % 10 === 1 && bl.len !== 11 ? 'slobodan dan' : (bl.len % 10 >= 2 && bl.len % 10 <= 4 && (bl.len % 100 < 12 || bl.len % 100 > 14) ? 'slobodna dana' : 'slobodnih dana')) + '</b> za ' + bl.go + ' ' + rijecDana(bl.go) + ' godišnjeg</span></div>';
    });
    h += '</div>';
    host.innerHTML = h;

    host.querySelectorAll('.pl-d[data-k]').forEach(function (b) {
      if (b.disabled) return;
      b.onclick = function () {
        var k = b.dataset.k, i = S.go.indexOf(k);
        if (i >= 0) S.go.splice(i, 1);
        else {
          if (S.go.length >= S.dani) { alert('Iskoristili ste svih ' + S.dani + ' dana godišnjeg. Uklonite neki označeni dan ili povećajte raspoloživi broj dana.'); return; }
          S.go.push(k);
        }
        S.go.sort(); sačuvaj(); crtaj();
        var nb = host.querySelector('.pl-d[data-k="' + k + '"]'); if (nb) nb.focus();
      };
    });
    host.querySelector('#pl-nedelja').onchange = function (e) {
       var novi = Number(e.target.value);
       if (novi === 5 && S.go.some(function (k) { return odIso(k).getDay() === 6; })) {
         if (!confirm('Prelaskom na petodnevni nedelja uklonit će se označene subote iz plana. Nastaviti?')) { e.target.value = String(S.nedelja); return; }
         S.go = S.go.filter(function (k) { return odIso(k).getDay() !== 6; });
       }
       S.nedelja = novi;
       // zakonski minimum 4 nedelje: 20 dana za pon–pet, 24 za pon–sub
       if (novi === 6 && S.dani === 20) S.dani = 24;
       else if (novi === 5 && S.dani === 24 && S.go.length <= 20) S.dani = 20;
       sačuvaj(); crtaj();
     };
     var inp = host.querySelector('#pl-dani');
    inp.onchange = function () {
      var novi = Math.max(0, Math.min(60, Math.floor(Number(inp.value) || 0)));
      if (novi < S.go.length) { alert('Već je označeno ' + S.go.length + ' dana godišnjeg. Najpre uklonite višak dana pa smanjite raspoloživi broj.'); inp.value = S.dani; return; }
      S.dani = novi; sačuvaj(); crtaj();
    };
    host.querySelector('#pl-predlozi').onclick = function () {
      if (S.go.length && !confirm('Zameniti postojeći plan predlogom?')) return;
      predlozi();
    };
    host.querySelector('#pl-ocisti').onclick = function () {
      if (S.go.length && !confirm('Obrisati sve označene dane za ' + Y + '.?')) return;
      S.go = []; sačuvaj(); crtaj();
    };
    host.querySelector('#pl-print').onclick = štampa;
    host.querySelector('#pl-xls').onclick = excel;
  }

  /* ---------- štampa i Excel ---------- */
  function štampa() {
    var B = blokovi(), ukSlob = B.reduce(function (s, b) { return s + b.len; }, 0);
    var popis = {};
    S.go.forEach(function (k) { var d = odIso(k); (popis[d.getMonth()] = popis[d.getMonth()] || []).push(DK[d.getDay()] + ' ' + d.getDate() + '.'); });
    var redovi = B.map(function (b) { return '<tr><td>' + raspon(b.a, b.b, Y) + '</td><td>' + b.len + '</td><td>' + b.go + '</td></tr>'; }).join('');
    var mj = Object.keys(popis).map(function (m) { return '<tr><td>' + MJN[m] + '</td><td>' + popis[m].join(', ') + '</td><td>' + popis[m].length + '</td></tr>'; }).join('');
    var html = '<h1>Plan godišnjeg odmora ' + Y + '.</h1>' +
      '<p class="crta">Ime i prezime zaposlenog: ______________________________</p>' +
      '<p>Radna nedelja: <b>' + (S.nedelja === 6 ? 'ponedeljak–subota' : 'ponedeljak–petak') + '</b></p>' +
       '<p>Ukupno dana godišnjeg: <b>' + S.dani + '</b> · Iskorišćeno: <b>' + S.go.length + '</b> · Preostalo: <b>' + (S.dani - S.go.length) + '</b> · Slobodnih dana u planiranim odmorima: <b>' + ukSlob + '</b></p>' +
      '<h2>Perioda odmora</h2><table><thead><tr><th>Period</th><th>Slobodnih dana</th><th>Dana godišnjeg</th></tr></thead><tbody>' + (redovi || '<tr><td colspan="3">—</td></tr>') + '</tbody></table>' +
      '<h2>Dani godišnjeg po mesecima</h2><table><thead><tr><th>Mesec</th><th>Dani</th><th>Broj</th></tr></thead><tbody>' + (mj || '<tr><td colspan="3">—</td></tr>') + '</tbody></table>' +
      '<div class="potpisi"><div>Potpis zaposlenog</div><div>Odobrio (poslodavac)</div></div>' +
      '<p class="izvor">Izrađeno na radni-sati.com</p>';
    rsIspis('Plan godišnjeg odmora ' + Y, html);
  }
  function excel() {
    var B = blokovi(), R = [['Plan godišnjeg odmora ' + Y + '.'], ['Radna nedelja', S.nedelja === 6 ? 'ponedeljak–subota' : 'ponedeljak–petak'], ['Ukupno dana godišnjeg', S.dani], ['Iskorišćeno', S.go.length], ['Preostalo', S.dani - S.go.length], ['Slobodni dani u planiranim odmorima', B.reduce(function (s, b) { return s + b.len; }, 0)], [], ['Datum', 'Dan', 'Mesec']];
    S.go.forEach(function (k) { var d = odIso(k); R.push([p2(d.getDate()) + '.' + p2(d.getMonth() + 1) + '.' + Y + '.', DK[d.getDay()], MJN[d.getMonth()]]); });
    R.push([], ['Period', 'Slobodnih dana', 'Dana godišnjeg']);
    B.forEach(function (b) { R.push([raspon(b.a, b.b, Y), b.len, b.go]); });
    rsCsv('plan-godisnjeg-' + Y + '.csv', R);
  }

  /* ---------- zajednički alati (koristi ih i fond-kalendar.js) ---------- */
  window.rsIspis = window.rsIspis || function (naslov, telo) {
    var f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    var d = f.contentWindow.document;
    d.open();
    d.write('<!DOCTYPE html><html lang="hr"><head><meta charset="utf-8"><title>' + esc(naslov) + '</title><style>' +
      'body{font:11pt/1.45 Arial,sans-serif;color:#000;margin:18mm}h1{font-size:17pt;margin:0 0 10px}h2{font-size:12pt;margin:18px 0 6px}' +
      'table{border-collapse:collapse;width:100%;font-size:10pt}th,td{border:1px solid #444;padding:4px 6px;text-align:left}th{background:#eee}' +
      'tr.uk td{font-weight:bold;background:#f3f3f3}.crta{margin:14px 0}.potpisi{display:flex;justify-content:space-between;margin-top:40px}' +
      '.potpisi div{border-top:1px solid #000;width:40%;padding-top:4px;text-align:center;font-size:9pt}.izvor{margin-top:24px;font-size:8pt;color:#666}' +
      '@page{size:A4;margin:0}</style></head><body>' + telo + '</body></html>');
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

  /* ---------- javno sučelje ---------- */
  window.rsPlaner = function (y) {
    host = document.getElementById('planer');
    if (!host || !y) return;
    if (y !== Y) { Y = y; S = ucitaj(y); }
    crtaj();
  };
  if (window.RS_Y) window.rsPlaner(window.RS_Y);
})();
