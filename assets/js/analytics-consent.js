(function () {
  'use strict';
  if (window.RSAnalyticsConsent) return;
  var ID = 'G-Z4TRZLEBV8', KEY = 'radni-sati:analytics-consent:v1', AGE = 180 * 86400000;
  var production = location.protocol === 'https:' && location.hostname === 'radni-sati.com';
  var script = document.currentScript, staticTitle = script && script.dataset.pageTitle || 'Radni-sati.com';
  var lang = location.pathname.split('/')[1], policy = lang === 'hr' ? '/hr/politika-privatnosti/#analytics' : '/politika-privatnosti/#analytics';
  var texts = {
    hr: ['Analitika posjeta', 'Google Analytics koristimo za agregiranu statistiku posjeta. Obrada može uključivati osobne podatke. Analitiku uključujemo samo uz vašu privolu; odbijanje ne ograničava alate.', 'Prihvati analitiku', 'Odbij analitiku', 'Postavke privatnosti', 'Pravila privatnosti', 'Zatvori', 'Odabir nije moguće trajno spremiti. Vrijedi samo na ovoj stranici.'],
    rs: ['Analitika poseta', 'Google Analytics koristimo za zbirnu statistiku poseta. Obrada može uključivati podatke o ličnosti. Analitiku uključujemo samo uz vašu saglasnost; odbijanje ne ograničava alate.', 'Prihvati analitiku', 'Odbij analitiku', 'Podešavanja privatnosti', 'Politika privatnosti', 'Zatvori', 'Izbor nije moguće trajno sačuvati. Važi samo na ovoj stranici.'],
    ba: ['Analitika posjeta', 'Google Analytics koristimo za zbirnu statistiku posjeta. Obrada može uključivati lične podatke. Analitiku uključujemo samo uz vašu saglasnost; odbijanje ne ograničava alate.', 'Prihvati analitiku', 'Odbij analitiku', 'Postavke privatnosti', 'Politika privatnosti', 'Zatvori', 'Izbor nije moguće trajno sačuvati. Važi samo na ovoj stranici.'],
    me: ['Analitika posjeta', 'Google Analytics koristimo za zbirnu statistiku posjeta. Obrada može uključivati lične podatke. Analitiku uključujemo samo uz vašu saglasnost; odbijanje ne ograničava alate.', 'Prihvati analitiku', 'Odbij analitiku', 'Podešavanja privatnosti', 'Politika privatnosti', 'Zatvori', 'Izbor nije moguće trajno sačuvati. Važi samo na ovoj stranici.'],
    si: ['Statistika obiskov', 'Google Analytics uporabljamo za zbirno statistiko obiskov. Obdelava lahko vključuje osebne podatke. Analitiko vključimo samo z vašo privolitvijo; zavrnitev ne omejuje orodij.', 'Dovoli analitiko', 'Zavrni analitiko', 'Nastavitve zasebnosti', 'Pravila zasebnosti', 'Zapri', 'Izbire ni mogoče trajno shraniti. Velja samo na tej strani.'],
    mk: ['Статистика на посетите', 'Google Analytics го користиме за збирна статистика на посетите. Обработката може да вклучува лични податоци. Аналитиката ја вклучуваме само со ваша согласност; одбивањето не ги ограничува алатките.', 'Прифати аналитика', 'Одбиј аналитика', 'Поставки за приватност', 'Политика за приватност', 'Затвори', 'Изборот не може трајно да се зачува. Важи само на оваа страница.'],
    xk: ['Statistikat e vizitave', 'Përdorim Google Analytics për statistika të përmbledhura të vizitave. Përpunimi mund të përfshijë të dhëna personale. Analitika aktivizohet vetëm me pëlqimin tuaj; refuzimi nuk kufizon mjetet.', 'Prano analitikën', 'Refuzo analitikën', 'Cilësimet e privatësisë', 'Politika e privatësisë', 'Mbyll', 'Zgjedhja nuk mund të ruhet përherë. Vlen vetëm në këtë faqe.']
  };
  var t = texts[lang] || texts.rs, state = null, started = false, loaded = false, configured = false, panel, spacer, opener;
  window['ga-disable-' + ID] = true;
  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      return v && v.version === 1 && ['granted', 'denied'].indexOf(v.choice) >= 0 && Number.isFinite(v.time) && v.time <= Date.now() && Date.now() - v.time < AGE ? v.choice : null;
    } catch (e) { return null; }
  }
  function cleanCookies() {
    var paths = ['/'], pieces = location.pathname.split('/').filter(Boolean), domains = ['', location.hostname, '.' + location.hostname];
    for (var i = 1; i <= pieces.length; i++) { var p = '/' + pieces.slice(0, i).join('/'); paths.push(p, p + '/'); }
    var host = location.hostname.split('.');
    while (host.length > 2) { host.shift(); domains.push(host.join('.'), '.' + host.join('.')); }
    document.cookie.split(';').map(function (s) { return s.trim().split('=')[0]; }).filter(function (n) { return /^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_gac_)/.test(n); }).forEach(function (name) {
      paths.forEach(function (path) { domains.forEach(function (domain) { document.cookie = name + '=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path + (domain ? '; domain=' + domain : '') + '; SameSite=Lax'; }); });
    });
  }
  function queue() { window.dataLayer.push(arguments); }
  function configure() {
    if (state !== 'granted' || !production || !loaded || configured) return;
    configured = true;
    var referrer = '';
    try { if (document.referrer) referrer = new URL(document.referrer).origin + '/'; } catch (e) {}
    var safePage = { page_title: staticTitle, page_location: location.origin + location.pathname, page_referrer: referrer };
    queue('set', safePage);
    queue('config', ID, Object.assign({}, safePage, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_domain: 'none', cookie_path: '/', cookie_expires: AGE / 1000, cookie_update: false, cookie_flags: 'SameSite=Lax;Secure' }));
  }
  function enable() {
    if (!production) return;
    window['ga-disable-' + ID] = false;
    if (started) { if (loaded) queue('consent', 'update', { analytics_storage: 'granted' }); configure(); return; }
    started = true;
    window.dataLayer = window.dataLayer || [];
    // Preserve a pre-existing Google command function; disable only our measurement ID.
    window.gtag = window.gtag || function () { queue.apply(null, arguments); };
    // Only the analytics consent type is managed here; advertising consent types stay with the AdSense CMP.
    queue('consent', 'default', { analytics_storage: 'denied' });
    queue('consent', 'update', { analytics_storage: 'granted' });
    queue('set', 'ads_data_redaction', true);
    queue('set', 'url_passthrough', false);
    queue('js', new Date());
    var tag = document.createElement('script'); tag.id = 'rs-ga4-tag'; tag.async = true; tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    tag.onload = function () { loaded = true; if (state === 'granted') configure(); else cleanCookies(); };
    document.head.appendChild(tag);
  }
  function disable() {
    window['ga-disable-' + ID] = true;
    // No denied-consent ping. Do not erase the shared dataLayer of other services.
    cleanCookies();
  }
  function size() { if (spacer) spacer.style.height = panel.hidden ? '0px' : (panel.getBoundingClientRect().height + 24) + 'px'; }
  function show(focus) { panel.hidden = false; panel.querySelector('[data-consent-close]').hidden = state === null; size(); if (focus) panel.querySelector('[data-consent-accept]').focus(); }
  function hide() { panel.hidden = true; size(); if (opener) { opener.focus(); opener = null; } }
  function choose(choice) {
    state = choice;
    var stored = true;
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, choice: choice, time: Date.now() })); } catch (e) { stored = false; }
    if (choice === 'granted') enable(); else disable();
    hide();
    var status = document.getElementById('rs-consent-status'); status.textContent = stored ? '' : t[7];
  }
  function reconcile() { var v = read(); if (v === state) return; state = v; if (state === 'granted') enable(); else disable(); if (state === null) show(false); else hide(); }
  function mount() {
    panel = document.createElement('section'); panel.id = 'rs-consent-panel'; panel.className = 'rs-consent'; panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', 'rs-consent-heading'); panel.hidden = true;
    panel.innerHTML = '<h2 id="rs-consent-heading"></h2><p data-consent-copy></p><div class="rs-consent-actions"><button type="button" data-consent-accept></button><button type="button" data-consent-reject></button></div><a data-consent-policy></a><button type="button" data-consent-close hidden></button>';
    panel.querySelector('h2').textContent = t[0]; panel.querySelector('[data-consent-copy]').textContent = t[1];
    panel.querySelector('[data-consent-accept]').textContent = t[2]; panel.querySelector('[data-consent-reject]').textContent = t[3];
    var p = panel.querySelector('[data-consent-policy]'); p.textContent = t[5]; p.href = policy;
    var close = panel.querySelector('[data-consent-close]'); close.textContent = t[6]; close.onclick = hide;
    panel.querySelector('[data-consent-accept]').onclick = function () { choose('granted'); };
    panel.querySelector('[data-consent-reject]').onclick = function () { choose('denied'); };
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state !== null) hide(); });
    spacer = document.createElement('div'); spacer.id = 'rs-consent-space'; spacer.setAttribute('aria-hidden', 'true');
    var status = document.createElement('p'); status.id = 'rs-consent-status'; status.setAttribute('role', 'status');
    document.body.append(spacer, panel, status);
    document.querySelectorAll('[data-analytics-settings]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); opener = a; show(true); }; });
    if (window.ResizeObserver) new ResizeObserver(size).observe(panel);
    window.addEventListener('resize', size);
    state = read(); if (state === 'granted') enable(); else disable(); if (state === null) show(false);
    window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === null) reconcile(); });
    window.addEventListener('pageshow', reconcile);
    window.addEventListener('focus', reconcile);
  }
  window.RSAnalyticsConsent = { open: function () { if (panel) show(true); }, getChoice: function () { return state; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})();
