/* Homepage-only BA presentation adapter. Reuses ba-podrucje, BAData areas,
   notes and sources. Does not touch evidence or planner records. */
(function(){
'use strict';
var H=window.BAData,host=document.getElementById('ba-area');
if(!H){if(host)host.hidden=true;return;}
var area=new URLSearchParams(location.search).get('podrucje');
try{if(!H.areas[area])area=localStorage.getItem('ba-podrucje');}catch(e){}
if(!H.areas[area])area='fbih';
try{localStorage.setItem('ba-podrucje',area);}catch(e){}
window.BA={area:area,key:'ba-'+area,name:H.areas[area]};
if(host){
 var label=document.createElement('label');label.htmlFor='ba-area-select';label.textContent='Područje: '+H.areas[area];host.appendChild(label);
 var select=document.createElement('select');select.id='ba-area-select';select.setAttribute('aria-describedby','ba-area-note');
 Object.keys(H.areas).forEach(function(k){var option=document.createElement('option');option.value=k;option.textContent=H.areas[k];select.appendChild(option);});select.value=area;host.appendChild(select);
 var note=document.createElement('small');note.id='ba-area-note';note.textContent='Izbor se pamti na ovom uređaju. Podaci svakog područja spremaju se odvojeno.';host.appendChild(note);
 select.onchange=function(){var url=new URL(location.href);url.searchParams.set('podrucje',this.value);try{localStorage.setItem('ba-podrucje',this.value);}catch(e){}location.assign(url.href);};
}
document.querySelectorAll('a[href^="/ba/"]').forEach(function(a){var url=new URL(a.href);url.searchParams.set('podrucje',area);a.href=url.pathname+url.search+url.hash;});
document.querySelectorAll('[data-area-name]').forEach(function(e){e.textContent=H.areas[area];});
document.querySelectorAll('[data-area-note]').forEach(function(e){e.textContent=H.notes[area];});
var ids={fbih:['fbNew','fbMay','fbTransfer','fbMarch','fbDecision','fbState','fbWork','islam','europe'],rs:['rsLaw','court','rsPractice','rsJan','rsFeb','islam','europe'],bd:['bdLaw','bdAmend','bdDecision','bdOld','bdWork','islam','europe']}[area],sources=document.getElementById('ba-sources');
if(sources){
 var details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Izvori i obuhvat podataka · '+H.areas[area];details.appendChild(summary);
 var p=document.createElement('p');p.textContent='Provjera: 23. 10. 2026. Službeni propisi i objave, uz zaseban status svakog datuma. Nije primijenjen jedinstveni kalendar za cijelu BiH.';details.appendChild(p);
 var ul=document.createElement('ul');ids.forEach(function(id){var li=document.createElement('li'),a=document.createElement('a');a.href=H.sources[id].url;a.textContent=H.sources[id].title;a.target='_blank';a.rel='noopener noreferrer';li.appendChild(a);ul.appendChild(li);});details.appendChild(ul);sources.appendChild(details);
}
})();
