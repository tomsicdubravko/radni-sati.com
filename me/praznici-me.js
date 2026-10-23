/* Radni sati Crna Gora · praznici koji su neradni dani za sve zaposlene
   (Zakon o državnim i drugim praznicima Crne Gore). Praznici se praznuju dva dana.
   Ako je praznik nedjelja, neradna su dva naredna dana; ako je drugi praznični dan nedjelja, neradan je prvi naredni dan. */
(function (g) {
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function plus(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function pravoslavniVaskrs(y) {
    var a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7,
        mj = Math.floor((d + e + 114) / 31), dan = ((d + e + 114) % 31) + 1;
    var j = new Date(y, mj - 1, dan); j.setDate(j.getDate() + 13); return j;
  }
  var cache = {};
  function prenos(H, drz, oznaka) {
    drz.forEach(function (p) {
      if (p[0].getDay() !== 0) return;
      var x = plus(p[0], 1);
      while (x.getDay() === 0 || x.getDay() === 6 || H[iso(x)]) x = plus(x, 1);
      H[iso(x)] = p[1] + ' (' + oznaka + ')';
    });
  }
  function dodajF(H) { return function (d, ime) { var k = iso(d); H[k] = H[k] ? (H[k].indexOf(ime) < 0 ? H[k] + ' i ' + ime : H[k]) : ime; }; }
  function prazniciZemlje(y) {
    if (cache[y]) return cache[y];
    var H = {}, drz = [], dodaj = dodajF(H);
    [[0, 1, 'Nova godina'], [0, 2, 'Nova godina'], [4, 1, 'Praznik rada'], [4, 2, 'Praznik rada'],
     [4, 21, 'Dan nezavisnosti'], [4, 22, 'Dan nezavisnosti'], [6, 13, 'Dan državnosti'], [6, 14, 'Dan državnosti'],
     [10, 13, 'Njegošev dan'], [10, 14, 'Njegošev dan']].forEach(function (p) {
      var d = new Date(y, p[0], p[1]); dodaj(d, p[2]); drz.push([d, p[2]]);
    });
    prenos(H, drz, 'prenos sa nedjelje');
    return (cache[y] = H);
  }
  g.prazniciZemlje = prazniciZemlje;
})(window);
