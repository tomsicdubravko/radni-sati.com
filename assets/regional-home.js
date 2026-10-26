/* Shared D1 homepage presentation. No application storage writes or calendar rule changes. */
(function(root,factory){
'use strict';
var locales=typeof module==='object'&&module.exports?require('./regional-home-locales.js'):root.RegionalHomeLocales,api=factory(locales);
if(typeof module==='object'&&module.exports)module.exports=api;
if(root.document){
 var r=root.document.body.dataset.homeRegion||'me',config=locales[r];
 api.mount(root.document,function(year){var h=root[config.provider];if(!h)return null;if(typeof h==='function')return h(year);return h.holidays(year,r==='ba'&&root.BA?root.BA.area:undefined);},config,root.BA);
}
})(typeof window!=='undefined'?window:globalThis,function(locales){
'use strict';
function dateKey(y,m,d){return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
function parts(now,config){config=config||locales.me;return Object.fromEntries(new Intl.DateTimeFormat(config.locale,{timeZone:config.zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now).filter(function(p){return p.type!=='literal';}).map(function(p){return [p.type,p.value];}));}
function monthSummary(y,m,h){var weekdays=0,holidays=0;for(var d=1;d<=new Date(Date.UTC(y,m,0)).getUTCDate();d++){var w=new Date(Date.UTC(y,m-1,d)).getUTCDay();if(w!==0&&w!==6){weekdays++;if(h[dateKey(y,m,d)])holidays++;}}return {hours:weekdays*8,weekdays:weekdays,workdays:weekdays-holidays,holidays:holidays};}
function selectEdition(y,editions){var sorted=editions.slice().sort(function(a,b){return a.year-b.year;}),current=sorted.find(function(e){return e.year===y;}),past=sorted.filter(function(e){return e.year<=y;});return {current:current||null,selected:current||past[past.length-1]||sorted[0]||null};}
function mount(document,provider,config,area){
 config=config||locales.me;var r=config.region,t=config.text,$=function(id){return document.getElementById(id);};if(!$('today-clock'))return;
 function text(s,y,selected){return s.replaceAll('%y%',y).replaceAll('%s%',selected);}
 function href(path){if(r!=='ba'||!area)return path;var u=new URL(path,document.baseURI);u.searchParams.set('podrucje',area.area);return u.pathname+u.search+u.hash;}
 var editions=Array.from(document.querySelectorAll('[data-edition-year]')).map(function(a){return {year:+a.dataset.editionYear,status:a.dataset.editionStatus,href:href(a.getAttribute('href'))};});
 function formatter(options){return new Intl.DateTimeFormat(config.locale,Object.assign({timeZone:config.zone},options));}
 var full=formatter({weekday:'long',day:'numeric',month:'long',year:'numeric'}),short=formatter({day:'numeric',month:'long'}),monthName=formatter({month:'long'}),lastDay='';
 function update(){
  var now=new Date(),p=parts(now,config),y=+p.year,m=+p.month,key=dateKey(y,m,+p.day);
  $('today-hm').textContent=p.hour+':'+p.minute;$('today-seconds').textContent=':'+p.second;$('today-clock').dateTime=now.toISOString();$('today-clock').setAttribute('aria-label',t.clock+' · '+config.country+': '+p.hour+':'+p.minute+':'+p.second);
  if(lastDay===key)return;lastDay=key;var date=config.months?config.days[new Date(key+'T12:00:00Z').getUTCDay()]+', '+Number(p.day)+' '+config.months[m-1]+' '+y:full.format(now);$('today-date').textContent=date.charAt(0).toUpperCase()+date.slice(1);$('today-date').dateTime=key;
  var selection=selectEdition(y,editions),selected=selection.selected,available=selection.current;
  if(selected){
   document.querySelectorAll('[data-fund-link]').forEach(function(a){a.href=selected.href;});$(r+'-fond').href=selected.href;
   $('hero-fund-label').textContent=text(t.viewFund,selected.year);$('tool-fund-title').textContent=text(t.fund,selected.year);$('featured-title').textContent=text(t.fund,selected.year);
   $('featured-kicker').textContent=available?t.current+(available.status==='preliminary'?' · '+t.preliminary.toLocaleUpperCase(config.locale):''):t.latest;
   $('hero-title').textContent=available?text(t.hero,y):config.home;$('year-note').hidden=!!available&&available.status!=='preliminary';$('year-note').textContent=!available?text(t.unavailableYear,y,selected.year):available.status==='preliminary'?text(t.preliminaryYear,y):'';
   $('tool-holidays-link').href=href('/'+r+'/neradni-dani-'+selected.year+'/');document.querySelector('.rs-menu a[data-sek="/'+r+'/neradni-dani"]').href=$('tool-holidays-link').href;
  }
  document.querySelectorAll('[data-edition-year]').forEach(function(a){var current=+a.dataset.editionYear===y;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','date');else a.removeAttribute('aria-current');});
  var data=null;if(available&&typeof provider==='function'){try{data=provider(y);}catch(e){}}
  var status=$('today-status'),coverage=$('today-coverage');$('month-label').textContent=t.month+(config.months?config.months[m-1]:monthName.format(now));$('today-calendar-link').href=href('/'+r+'/kalendar/?g='+(available?y:selected?selected.year:y));
  if(!data){
   status.textContent=t.unavailable;status.classList.add('off');['month-hours','month-workdays','month-holidays','next-date'].forEach(function(id){$(id).textContent='—';});$('next-holiday').textContent=t.calendarMissing;$('today-current').hidden=true;coverage.hidden=false;coverage.textContent=text(t.coverageMissing,y);$('next-holiday-link').href=$('today-calendar-link').href;$('next-holiday-name-link').href=$('today-calendar-link').href;return;
  }
  var holiday=data[key],w=new Date(key+'T12:00:00Z').getUTCDay(),off=!!holiday||w===0||w===6;status.textContent=holiday?t.holiday:off?t.off:t.work;status.classList.toggle('off',off);$('today-current').hidden=!holiday;$('today-current').textContent=holiday||'';
  var s=monthSummary(y,m,data);$('month-hours').textContent=s.hours+t.hours;$('month-workdays').textContent=s.workdays;$('month-holidays').textContent=s.holidays;coverage.hidden=available.status!=='preliminary';coverage.textContent=available.status==='preliminary'?text(t.preliminaryCoverage,y):'';
  var future=[];editions.filter(function(e){return e.year>=y;}).forEach(function(edition){try{var h=edition.year===y?data:provider(edition.year);Object.keys(h).forEach(function(d){if(d>key)future.push({date:d,name:h[d],status:edition.status});});}catch(e){}});future.sort(function(a,b){return a.date.localeCompare(b.date);});
  var next=future[0],destination='/'+r+'/kalendar/?g='+y;
  if(next){$('next-date').textContent=(config.months?Number(next.date.slice(8))+' '+config.months[Number(next.date.slice(5,7))-1]:short.format(new Date(next.date+'T12:00:00Z')))+(+next.date.slice(0,4)!==y?' '+next.date.slice(0,4)+(r==='me'||r==='rs'||r==='ba'?'.':''):'');$('next-holiday').textContent=next.name+(next.status==='preliminary'?' · '+t.preliminary:'');destination='/'+r+'/kalendar/?g='+next.date.slice(0,4)+(r==='me'||r==='rs'?'&datum='+encodeURIComponent(next.date):'');}
  else{$('next-date').textContent='—';$('next-holiday').textContent=t.noNext;}
  $('next-holiday-link').href=href(destination);$('next-holiday-name-link').href=href(destination);
 }
 var burger=document.querySelector('.rs-burger'),menu=$('rs-menu');
 burger.onclick=function(){var open=menu.classList.toggle('open');burger.setAttribute('aria-expanded',String(open));burger.textContent=open?'✕':'☰';burger.setAttribute('aria-label',open?t.closeMenu:t.openMenu);};
 menu.querySelector('a[data-sek="/'+r+'/"]').setAttribute('aria-current','page');update();setInterval(update,1000);document.addEventListener('visibilitychange',update);
}
return {monthSummary:monthSummary,selectEdition:selectEdition,parts:parts,mount:mount};
});
