/* G1 preview: no persistence before the explicit Apply action. */
(function () {
  'use strict';
  window.GOPlanner = { preview: function (options) {
    var ijek = options.region !== 'rs', original = options.existing.slice(), replace = false;
    var storageSnapshot;
    try { storageSnapshot = localStorage.getItem(options.storageKey); } catch (e) {}
    var dialog = document.createElement('dialog');
    dialog.className = 'go-preview';dialog.setAttribute('aria-labelledby', 'go-preview-title');
    var result, trigger = document.activeElement;
    function text(s) {
      if (ijek) return s;
      var words = { 'Provjerite':'Proverite', 'prijedloga':'predloga', 'prijedlogom':'predlogom', 'prijedlog':'predlog',
        'Prijedlog':'Predlog', 'cijelog':'celog', 'cijeli':'celi', 'zamjene':'zamene', 'zamjenu':'zamenu',
        'Zamijeniti':'Zameniti', 'promijenjeni':'promenjeni', 'iskorišteno':'iskorišćeno', 'bit će':'biće' };
      Object.keys(words).forEach(function (word) { s = s.split(word).join(words[word]); });
      return s;
    }
    function close() { dialog.close(); }
    dialog.addEventListener('close', function () {
      dialog.remove();
      var focus = trigger && trigger.isConnected ? trigger : document.getElementById('pl-predlozi');
      if (focus) focus.focus();
    });
    function element(tag, value, parent, className) {
      var e = document.createElement(tag);e.textContent = text(value);
      if (className) e.className = className;
      parent.appendChild(e);return e;
    }
    function render() {
      var existing = replace ? [] : original;
      result = GOOptimizer.propose({ year: options.year, total: options.total, week: options.week,
        existing: existing, holidays: options.holidays, supported: options.supported });
      dialog.innerHTML = '';
      element('h2', ijek ? 'Pregled prijedloga odmora' : 'Pregled predloga odmora', dialog).id = 'go-preview-title';
      if (!result.available) {
        element('p', result.reason === 'coverage' ? 'Za odabranu godinu nisu dostupni podaci o praznicima. Automatski prijedlog nije dostupan.' :
          'Provjerite godinu, raspored rada i broj dana godišnjeg (0–60). Automatski prijedlog nije dostupan.', dialog, 'go-status');
      } else {
        element('p', replace ? 'Pregled zamjene cijelog plana. Postojeći dani bit će uklonjeni samo ako potvrdite primjenu.' :
          'Postojeći dani ostaju sačuvani. Prijedlog koristi samo preostale dane godišnjeg.', dialog);
        if (options.preliminary) element('p', '2027. — preliminarno: prijedlog koristi postojeće podatke i njihova ograničenja; buduće odluke nisu pretpostavljene.', dialog, 'go-status');
        if (result.fallback && result.added.length) element('p', 'Nisu pronađene povoljnije kombinacije s praznicima. Predloženi su kratki odmori uz neradne dane, raspoređeni kroz godinu.', dialog, 'go-status');
        if (!result.added.length) element('p', result.remaining <= 0 ? 'Nema preostalih raspoloživih dana za novi prijedlog.' :
          'Nema dodatnih povoljnih kombinacija. Preostale dane možete označiti ručno.', dialog, 'go-status');
        var list = element('ul', '', dialog);
        result.periods.forEach(function (block) {
          var li = element('li', '', list);
          element('strong', options.formatPeriod(block.from, block.to), li);
          element('span', block.free + ' slobodnih dana · ' + block.leave + ' dana godišnjeg (' + block.added + ' novih)', li);
        });
        var summary = element('p', 'Novi dani godišnjeg: ' + result.added.length + ' · Ukupno iskorišteno: ' + result.used +
          ' / ' + options.total + ' · Preostalo: ' + result.remaining + ' · Povezani slobodni dani: ' + result.free, dialog);
        summary.id = 'go-preview-summary';
        element('p', 'Prednost imaju praznici i vikendi uz manju potrošnju godišnjeg. Svi dani broje se jednom, unutar odabrane godine. Preostali saldo ne troši se automatski.', dialog);
      }
      var status = element('p', '', dialog, 'go-status');status.setAttribute('role', 'status');status.setAttribute('aria-live', 'polite');
      var actions = element('div', '', dialog, 'go-actions');
      var apply = element('button', ijek ? 'Primijeni prijedlog' : 'Primeni predlog', actions, 'pl-btn glavni');
      apply.type = 'button';apply.id = 'go-apply';apply.disabled = !result.available || !result.added.length;
      apply.onclick = function () {
        var changed = !options.isCurrent();
        try { changed = changed || localStorage.getItem(options.storageKey) !== storageSnapshot; } catch (e) {}
        if (changed) { apply.disabled = true;status.textContent = text('Plan ili postavke su promijenjeni. Zatvorite pregled i zatražite novi prijedlog.');return; }
        if (replace && !confirm(text('Zamijeniti cijeli postojeći plan prikazanim prijedlogom? Postojeći odabrani dani bit će uklonjeni.'))) return;
        options.apply(result.added.slice(), replace);
        close();
      };
      var cancel = element('button', 'Odustani', actions, 'pl-btn');cancel.id = 'go-cancel';cancel.type = 'button';cancel.onclick = close;
      if (original.length && !replace && result.available) {
        var replacement = element('button', 'Zasebno predloži zamjenu cijelog plana', dialog, 'pl-btn go-replace');
        replacement.type = 'button';replacement.id = 'go-replace';replacement.onclick = function () { replace = true;render();dialog.querySelector('#go-cancel').focus(); };
      }
    }
    render();document.body.appendChild(dialog);dialog.showModal();dialog.querySelector('#go-cancel').focus();
  } };
})();
