/* Radni sati Srbija · praznici koji su neradni dani za sve zaposlene
   (Zakon o državnim i drugim praznicima u Republici Srbiji).
   Ako državni praznik padne u nedelju, ne radi se prvog narednog radnog dana. */
(function (g) {
  function pravoslavniVaskrs(y) {
    var a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7,
        mj = Math.floor((d + e + 114) / 31), dan = ((d + e + 114) % 31) + 1;
    var j = new Date(y, mj - 1, dan); j.setDate(j.getDate() + 13); return j; // julijanski -> gregorijanski (1900-2099)
  }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function plus(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  var cache = {};
  /* vraća { 'YYYY-MM-DD': 'naziv' } */
  function prazniciRS(y) {
    if (cache[y]) return cache[y];
    var H = {}, drz = [];
    function dodaj(d, ime) { var k = iso(d); H[k] = H[k] ? (H[k].indexOf(ime) < 0 ? H[k] + ' i ' + ime : H[k]) : ime; }
    [[0, 1, 'Nova godina'], [0, 2, 'Nova godina'], [1, 15, 'Sretenje – Dan državnosti'], [1, 16, 'Sretenje – Dan državnosti'],
     [4, 1, 'Praznik rada'], [4, 2, 'Praznik rada'], [10, 11, 'Dan primirja u Prvom svetskom ratu']].forEach(function (p) {
      var d = new Date(y, p[0], p[1]); dodaj(d, p[2]); drz.push([d, p[2]]);
    });
    dodaj(new Date(y, 0, 7), 'Božić');
    var v = pravoslavniVaskrs(y);
    dodaj(plus(v, -2), 'Veliki petak'); dodaj(plus(v, -1), 'Velika subota'); dodaj(v, 'Vaskrs'); dodaj(plus(v, 1), 'Vaskršnji ponedeljak');
    drz.forEach(function (p) {
      if (p[0].getDay() !== 0) return;
      var x = plus(p[0], 1);
      while (x.getDay() === 0 || x.getDay() === 6 || H[iso(x)]) x = plus(x, 1);
      H[iso(x)] = p[1] + ' (prenos sa nedelje)';
    });
    return (cache[y] = H);
  }
  g.prazniciRS = prazniciRS;
  g.pravoslavniVaskrs = pravoslavniVaskrs;
})(window);
