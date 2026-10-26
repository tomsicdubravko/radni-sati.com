var region = document.documentElement.dataset.region;
function mkText(s){if(region==="xk")return XKConfig.text(s);if(region==="si")return SIConfig.text(s);if(region!=="mk")return s;const d={"Datum":"Датум","Početak rada":"Почеток на работа","Završetak rada":"Крај на работа","Pauza u minutima":"Пауза во минути","Ukloni smenu":"Отстрани смена","Obrisati sve smene?":"Да се избришат сите смени?","Izaberite najmanje jedan dan u nedelji.":"Изберете најмалку еден ден во неделата.","Popunjavanje je otkazano. Unosi su sačuvani.":"Пополнувањето е откажано. Внесовите се зачувани.","Popunjeno dana: ":"Пополнети денови: ","Pauza mora biti kraća od smene.":"Паузата мора да биде пократка од смената.","Pauza mora biti kraća od smene i izražena u celim minutima.":"Паузата мора да биде пократка од смената и во цели минути.","Izaberite mesec od 1900. do 2099. godine.":"Изберете месец од 1900 до 2099 година.",". Svaki unos možete ručno izmeniti.":". Секој внес може рачно да се уреди.","Na izabranim datumima postoje unosi (":"На избраните датуми постојат внесови (","). Zameniti ih predloškom? Ostali datumi ostaju sačuvani.":"). Да се заменат со образецот? Другите датуми остануваат зачувани."};for(const k of Object.keys(d))s=s.split(k).join(d[k]);return s}
function p2(n){return String(n).padStart(2,"0")}
function kljuc(d){return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())}
function praznici(y){return region === "xk" ? XKData.holidays(y) : region === "si" ? SIData.holidays(y) : region === "mk" ? MKData.holidays(y) : region === "ba" ? BAData.holidays(y,BA.area) : region === "me" ? prazniciZemlje(y) : prazniciRS(y)}

(function(){
var storagePrefix=region==="ba"?BA.key:region;
var storageKey=storagePrefix+"-kalk", templateKey=storagePrefix+"-kalk-predlozak";
// Only FBiH excludes the statutory break; all other supported regions include it.
var unpaidBreak=region==="ba"&&BA.area==="fbih";
var breakRules={
  me:{text:"Pauza se uračunava u radno vrijeme prema članu 73 stav 7 Zakona o radu Crne Gore. Smjena 08:00–16:00 sa pauzom od 30 minuta ima 8 plaćenih sati; 22:00–06:00 ima 8 plaćenih i 8 noćnih sati. Pauza ne umanjuje dodatke za odrađene sate.",source:"https://tuzilastvo.me/wp-content/uploads/2026/06/Zakon-o-raduu.pdf"},
  fbih:{text:"Federacija BiH: pauza se prema članu 44 stav 3 Zakona o radu ne uračunava u radno vrijeme. Smjena 08:00–16:00 sa pauzom od 30 minuta daje 7,5 sati. Pošto početak pauze nije unesen, odbija se s kraja smjene i pri obračunu dodataka. Kolektivni ugovor ili pravilnik mogu predvidjeti povoljnije pravilo za zaposlenika; za plaćenu pauzu po takvom pravilu u ovom obračunu unesite 0 minuta odbitka.",source:"https://fbihvlada.gov.ba/bosanski/zakoni/2016/zakoni/5.html"},
  rs:{text:"Republika Srpska: pauza se prema članu 75 stav 4 Zakona o radu uračunava u radno vrijeme. Smjena 08:00–16:00 sa pauzom od 30 minuta daje 8 plaćenih sati; 22:00–06:00 daje 8 plaćenih i 8 noćnih sati. Pauza se ne oduzima pri obračunu dodataka.",source:"https://vladars.rs/sr-SP-Cyrl/Vlada/Ministarstva/mpb/PAO/Documents/Zakon-o-radu.pdf"},
  bd:{text:"Brčko distrikt: pauza se prema članu 58 stav 5 Zakona o radu uračunava u radno vrijeme. Smjena 08:00–16:00 sa pauzom od 30 minuta daje 8 plaćenih sati; 22:00–06:00 daje 8 plaćenih i 8 noćnih sati. Pauza se ne oduzima pri obračunu dodataka.",source:"https://skupstinabd.ba/3-zakon/hr/Zakon%20o%20radu%20Brc--ko%20Distrikta%20BiH/03H12-25%20Zakon%20o%20radu%20Brc--ko%20distrikta%20Bosne%20i%20Hercegovine%20-%20proc--is--c-eni%20tekst.pdf"}
};
var breakRule=region==="me"?breakRules.me:region==="ba"?breakRules[BA.area]:null;
if(breakRule){document.querySelectorAll('[data-break-help]').forEach(function(e){e.textContent=breakRule.text;});document.querySelectorAll('[data-break-source]').forEach(function(e){e.href=breakRule.source;});}
var limitedHolidays=["ba","mk","si","xk"].indexOf(region)>=0;
var coverageText={
  ba:{note:"Podaci o praznicima obuhvataju samo 2026. i 2027.; za 2027. vrijede postojeća preliminarna ograničenja. Za ostale godine praznični sati i ukupna zarada nisu dostupni. Ostali sati se računaju; ? označava nepoznate praznične sate. Ograničenje važi i za dio smjene koji prelazi u drugu godinu.",unknown:"Nedostaju podaci o praznicima za dio unesenih smjena. Praznični sati označeni su sa ?, a ukupna zarada nije prikazana. Unosi ostaju sačuvani.",range:"Popunjavanje mjeseca podržava samo 2026. i 2027. Za ostale godine nema podataka o praznicima."},
  mk:{note:"Податоците за празници ги опфаќаат само 2026 и 2027; за 2027 важат постојните прелиминарни ограничувања. За други години празничните часови и вкупната заработка не се достапни. Другите часови се пресметуваат; ? означува непознати празнични часови. Ограничувањето важи и за делот од смената што преминува во друга година.",unknown:"Недостигаат податоци за празници за дел од внесените смени. Празничните часови се означени со ?, а вкупната заработка не е прикажана. Внесовите се зачувани.",range:"Пополнувањето месец поддржува само 2026 и 2027. За други години нема податоци за празници."},
  si:{note:"Podatki o praznikih zajemajo samo leti 2026 in 2027; za 2027 upoštevajte obstoječe oznake preliminarnih oziroma izračunanih datumov. Za druga leta praznične ure in skupni zaslužek niso na voljo. Druge ure se izračunajo; ? označuje neznane praznične ure. Omejitev velja tudi za del izmene, ki preide v drugo leto.",unknown:"Za del vnesenih izmen ni podatkov o praznikih. Praznične ure so označene z ?, skupni zaslužek pa ni prikazan. Vnosi ostanejo shranjeni.",range:"Izpolnjevanje meseca podpira samo leti 2026 in 2027. Za druga leta ni podatkov o praznikih."},
  xk:{note:"Të dhënat e festave mbulojnë vetëm vitet 2026 dhe 2027; për 2027 vlejnë kufizimet paraprake të shënuara. Për vitet e tjera orët e festave dhe fitimi i përgjithshëm nuk janë në dispozicion. Orët e tjera llogariten; ? tregon orë festash të panjohura. Kufizimi vlen edhe për pjesën e ndërrimit që kalon në vitin tjetër.",unknown:"Mungojnë të dhëna për festat për një pjesë të ndërrimeve. Orët e festave shënohen me ?, ndërsa fitimi i përgjithshëm nuk shfaqet. Regjistrimet ruhen.",range:"Plotësimi i muajit mbështet vetëm vitet 2026 dhe 2027. Për vitet e tjera nuk ka të dhëna për festat."}
}[region];
function supportedYear(y){return !limitedHolidays||y===2026||y===2027;}
// Work with calendar dates and wall-clock minutes, preserving the existing duration model.
function calendarParts(date,a,b){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||""))return [];
  var base=new Date(date+"T12:00:00"),parts=[];if(!Number.isFinite(base.getTime()))return parts;
  for(var t=a;t<b;){var offset=Math.floor(t/1440),stop=Math.min(b,(offset+1)*1440),d=new Date(base);d.setDate(d.getDate()+offset);parts.push({date:d,key:kljuc(d),hours:(stop-t)/60});t=stop;}
  return parts;
}
if(limitedHolidays){
  var notice=document.createElement("div");notice.id="holiday-coverage";notice.className="ba-notice";
  var intro=document.createElement("p");intro.textContent=coverageText.note;notice.appendChild(intro);
  var warning=document.createElement("p");warning.id="holiday-coverage-status";warning.setAttribute("role","status");warning.setAttribute("aria-live","polite");notice.appendChild(warning);
  var main=document.querySelector("main");main.insertBefore(notice,main.firstChild);
}
var R=[];try{R=JSON.parse(localStorage.getItem(storageKey)||"[]");if(!Array.isArray(R))R=[];R=R.filter(function(r){return r&&typeof r==="object"})}catch(e){}
function holiday(r){return /^\d{4}-\d{2}-\d{2}$/.test(r.d||"") ? praznici(+r.d.slice(0,4))[r.d]||"" : ""}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function sv(){try{localStorage.setItem(storageKey,JSON.stringify(R))}catch(e){}}
function mins(t){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(t||""))return null;var p=t.split(":");return +p[0]*60+ +p[1]}
function f(v){var x=Math.round(v*100)/100;return x?String(x).replace(".",","):"–"}
function eur(v){return v.toLocaleString(region==="xk"?"sq-XK":region==="si"?"sl-SI":region==="mk"?"mk-MK":region==="ba"?"bs-BA":region==="me"?"sr-Latn-ME":"sr-RS",{minimumFractionDigits:2,maximumFractionDigits:2})}
function calc(r){var o={u:0,p:0,n:0,ne:0,b:0,hn:holiday(r),holidayUnknown:limitedHolidays&&/^\d{4}-\d{2}-\d{2}$/.test(r.d||"")&&!supportedYear(+r.d.slice(0,4))},a=mins(r.od),b=mins(r.do),dn=+document.getElementById("dn").value||8;if(a===null||b===null)return o;
  if(b<=a)b+=1440;
  var pause=Number(r.pauza||0),duration=b-a;
  if(!Number.isInteger(pause)||pause<0||pause>=duration)return o;
  var paidEnd=unpaidBreak?b-pause:b,parts=calendarParts(r.d,a,paidEnd);
  if(parts.some(function(p){return !supportedYear(p.date.getFullYear())}))o.holidayUnknown=true;
  if(region==="xk"){var x=XKData.split(r.d,r.od,r.do);o.u=x.hours;o.p=Math.max(0,o.u-dn);o.n=x.night;o.ne=x.sunday;o.b=x.holiday;o.overlap=x.overlap;return o;}
  if(region==="si"){
    var mode=+document.getElementById("siNight").value;
    var split=SIData.split(r.d,r.od,r.do,mode<0?1380:mode,mode>=0);
    o.u=split.hours;o.p=Math.max(0,o.u-dn);o.n=split.night;o.ne=split.sunday;o.b=split.holiday;o.overlap=split.overlap;
    return o;
  }
  // FBiH only: no break start is entered, so deduct its unpaid break at shift end.
  if(unpaidBreak)b-=pause;o.u=(b-a)/60;var n=0;for(var t=a;t<b;t++){var m=t%1440;if(m>=1320||m<360)n++}o.n=n/60;o.p=Math.max(0,o.u-dn);
  if(region==="rs"||region==="me"||region==="ba"||region==="mk"){
    var labels=[];parts.forEach(function(part){var h=praznici(part.date.getFullYear())[part.key];if(part.date.getDay()===0)o.ne+=part.hours;if(h){o.b+=part.hours;labels.push(part.key+" — "+h);}});o.hn=labels.join("; ");
  }else if(r.d){var p=r.d.split("-").map(Number),d=new Date(p[0],p[1]-1,p[2]),h=praznici(p[0])[r.d];if(d.getDay()===0)o.ne=o.u;if(h){o.b=o.u;o.hn=h}}return o}
function draw(){
  var tb=document.getElementById("rows");tb.innerHTML="";
  R.forEach(function(r,i){var tr=document.createElement("tr");
    tr.innerHTML='<td><input type="date" value="'+esc(r.d||"")+'" data-k="d" aria-label="Datum"><small class="holiday-label"></small></td><td><input type="time" value="'+esc(r.od||"")+'" data-k="od" aria-label="Početak rada"></td><td><input type="time" value="'+esc(r.do||"")+'" data-k="do" aria-label="Završetak rada"></td><td><input type="number" min="0" max="1439" step="1" aria-label="Pauza u minutima" value="'+esc(r.pauza||0)+'" data-k="pauza"></td><td class="num" data-c="u"></td><td class="num" data-c="p"></td><td class="num" data-c="n"></td><td class="num" data-c="ne"></td><td class="num" data-c="b"></td><td><button class="btn ghost" aria-label="Ukloni smenu" style="padding:4px 10px">✕</button></td>';
    if(region==="mk"||region==="si"||region==="xk")tr.innerHTML=mkText(tr.innerHTML);
    if(limitedHolidays)tr.querySelector('[data-k="d"]').setAttribute("aria-describedby","holiday-coverage");
    tr.querySelectorAll("input").forEach(function(inp){inp.addEventListener("input",function(){r[inp.dataset.k]=inp.value;delete r.auto;sv();upd()})});
    tr.querySelector("button").onclick=function(){R.splice(i,1);sv();draw()};
    tb.appendChild(tr)});
  upd();
}
function upd(){
  salaryRate();
  var T={u:0,p:0,n:0,ne:0,b:0},overlap=0,unknown=false,rows=document.querySelectorAll("#rows tr");
  R.forEach(function(r,i){var c=calc(r),tr=rows[i];["u","p","n","ne","b"].forEach(function(k){T[k]+=c[k];tr.querySelector('[data-c="'+k+'"]').textContent=f(c[k])});
    unknown=unknown||c.holidayUnknown;
    if(c.holidayUnknown)tr.querySelector('[data-c="b"]').textContent="?";
    overlap+=c.overlap||0;tr.querySelector('[data-c="b"]').title=c.holidayUnknown?coverageText.unknown:c.hn;
    tr.classList.toggle("holiday",!!c.hn);tr.querySelector(".holiday-label").textContent=c.hn;
    var pi=tr.querySelector('[data-k="pauza"]'),a=mins(r.od),b=mins(r.do),v=Number(r.pauza||0);
    var duration=a===null||b===null?1440:(b<=a?b+1440:b)-a;
    pi.setCustomValidity(!Number.isInteger(v)||v<0||v>=duration?mkText("Pauza mora biti kraća od smene i izražena u celim minutima."):"")});
  ["u","p","n","ne","b"].forEach(function(k,j){document.getElementById(["tU","tP","tN","tNe","tB"][j]).textContent=f(T[k])});
  if(unknown)document.getElementById("tB").textContent="?";
  totalIds.forEach(function(id){mobile.querySelector('[data-total="'+id+'"]').textContent=document.getElementById(id).textContent});
  if(limitedHolidays)document.getElementById("holiday-coverage-status").textContent=unknown?coverageText.unknown:"";
  var s=parseFloat(String(document.getElementById("sat").value).replace(",","."))||0,box=document.getElementById("novac");
  box.style.display=unknown?"none":"";
  rateHint.hidden=unknown||s>0||sat.disabled;
  if(!unknown&&s>0&&T.u>0){var pc=function(id){return (+document.getElementById(id).value||0)/100},osn=T.u*s,dod=s*(T.p*pc("pPr")+T.n*pc("pNo")+T.ne*pc("pNe")+T.b*pc("pBl"));
    if(region==="si"||region==="xk")dod-=s*overlap*Math.min(pc("pNe"),pc("pBl"));
    box.hidden=false;document.getElementById("eUk").textContent=eur(osn+dod);document.getElementById("eOsn").textContent=eur(osn);document.getElementById("eDod").textContent=eur(dod);document.getElementById("eSat").textContent=eur(s)}else box.hidden=true;
}
function today(){return kljuc(new Date())}
document.getElementById("add").onclick=function(){var l=R[R.length-1];R.push({d:today(),od:l?l.od:"08:00",do:l?l.do:"16:00",pauza:l?l.pauza||0:0});sv();draw()};
document.getElementById("clr").onclick=function(){if(confirm(mkText("Obrisati sve smene?"))){R=[];sv();draw()}};
["dn","sat","pPr","pNo","pNe","pBl"].forEach(function(id){document.getElementById(id).addEventListener("input",upd)});
if(region==="ba"||region==="mk"||region==="si"||region==="xk"){
  var settingsKey=storagePrefix+"-kalk-postavke",settingIds=["dn","sat","pPr","pNo","pNe","pBl"];
  if(region==="si"){settingIds.push("siNight");document.getElementById("siNight").addEventListener("input",upd);}
  try{var savedSettings=JSON.parse(localStorage.getItem(settingsKey)||"{}");settingIds.forEach(function(id){if(savedSettings[id]!==undefined&&Number.isFinite(+savedSettings[id])&&+savedSettings[id]>=0)document.getElementById(id).value=savedSettings[id]});}catch(e){}
  settingIds.forEach(function(id){document.getElementById(id).addEventListener("input",function(){var settings={};settingIds.forEach(function(k){settings[k]=k==="sat"&&salaryWasActive?manualRate:document.getElementById(k).value});try{localStorage.setItem(settingsKey,JSON.stringify(settings))}catch(e){}})});
}

// Calculator-only controls; all totals continue to come from upd().
var moneyText={
 rs:['ili mesečna bruto plata','din','Upišite satnicu iznad za izračun bruto iznosa.','Izračun je informativan; naknada za praznike i bolovanje može se u obračunu zarade računati drukčije.'],
 me:['ili mjesečna bruto plata','EUR','Upišite satnicu iznad za izračun bruto iznosa.','Izračun je informativan; naknada za praznike i bolovanje može se u obračunu zarade računati drukčije.'],
 ba:['ili mjesečna bruto plaća','KM','Upišite satnicu iznad za izračun bruto iznosa.','Izračun je informativan; naknada za praznike i bolovanje može se u obračunu zarade računati drukčije.'],
 mk:['или месечна бруто плата','MKD','Внесете саатница погоре за пресметка на бруто износот.','Пресметката е информативна; надоместокот за празници и боледување може да се пресметува поинаку при пресметката на плата.'],
 si:['ali mesečna bruto plača','EUR','Za izračun bruto zneska zgoraj vnesite urno postavko.','Izračun je informativen; nadomestilo za praznike in bolniško odsotnost se lahko pri obračunu plače izračuna drugače.'],
 xk:['ose paga mujore bruto','EUR','Shkruani pagën për orë më sipër për llogaritjen e shumës bruto.','Llogaritja është informuese; kompensimi për festa dhe pushim mjekësor mund të llogaritet ndryshe në përllogaritjen e pagës.']
}[region];
var sat=document.getElementById('sat'),salaryLabel=document.createElement('label');
salaryLabel.className='f';salaryLabel.textContent=moneyText[0]+' ('+moneyText[1]+')';
var salary=document.createElement('input');salary.type='number';salary.id='salary';salary.min='0';salary.step='0.01';salary.setAttribute('aria-describedby','salary-help salary-note');salaryLabel.appendChild(salary);
sat.parentElement.insertAdjacentElement('afterend',salaryLabel);
var salaryHelp=document.createElement('p');salaryHelp.id='salary-help';salaryHelp.className='salary-help';salaryHelp.setAttribute('role','status');
var salaryNote=document.createElement('p');salaryNote.id='salary-note';salaryNote.className='salary-help';salaryNote.textContent=moneyText[3];
sat.closest('.panel').insertAdjacentElement('afterend',salaryNote);salaryNote.insertAdjacentElement('beforebegin',salaryHelp);
var rateHint=document.createElement('button');rateHint.type='button';rateHint.id='rate-hint';rateHint.className='btn rate-hint';rateHint.textContent=moneyText[2];rateHint.onclick=function(){sat.focus()};document.getElementById('novac').insertAdjacentElement('beforebegin',rateHint);
var mobile=document.createElement('dl');mobile.id='mobile-totals';mobile.className='mobile-totals';
var totalIds=['tU','tP','tN','tNe','tB'];
totalIds.forEach(function(id,j){var dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=document.getElementById('rows').closest('table').querySelectorAll('thead th')[j+4].textContent;dd.dataset.total=id;mobile.appendChild(dt);mobile.appendChild(dd)});
document.getElementById('rows').closest('.scroll').insertAdjacentElement('afterend',mobile);
var manualRate=sat.value,salaryWasActive=false;
function salaryRate(){
 var raw=salary.value,amount=Number(raw),dn=Number(document.getElementById('dn').value),month=document.getElementById('month').value;
 var active=raw!==''||salary.validity.badInput;
 if(!salaryWasActive&&active)manualRate=sat.value;
 salaryHelp.textContent='';salary.setCustomValidity('');sat.disabled=active;
 if(!active){if(salaryWasActive)sat.value=manualRate;salaryWasActive=false;return;}
 salaryWasActive=true;sat.value='';
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return;
 var y=+month.slice(0,4),m=+month.slice(5);
 if(y<1900||y>2099)return;
 if(!supportedYear(y)){salaryHelp.textContent=coverageText.range;return;}
 if(!Number.isFinite(amount)||amount<=0||!Number.isFinite(dn)||dn<=0)return;
 var weekdays=0;for(var d=1;d<=new Date(y,m,0).getDate();d++){var day=new Date(y,m-1,d).getDay();if(day>0&&day<6)weekdays++;}
 var fund=weekdays*dn,rate=amount/fund;if(!Number.isFinite(fund)||fund<=0||!Number.isFinite(rate))return;
 sat.value=String(rate);
 salaryHelp.textContent=eur(amount)+' '+moneyText[1]+' / '+f(fund)+' h ('+month+') = '+eur(rate)+' '+moneyText[1]+'/h';
}
salary.addEventListener('input',upd);
document.getElementById('month').addEventListener('input',upd);
document.getElementById('month').addEventListener('change',upd);

if(!R.length){R.push({auto:true,d:today(),od:"08:00",do:"16:00",pauza:region==="mk"||region==="si"||region==="xk"?30:0});sv();}
initTemplate();
draw();
function initTemplate(){
  var form=document.getElementById("template"),month=document.getElementById("month"),start=document.getElementById("start"),end=document.getElementById("end"),pause=document.getElementById("pause"),status=document.getElementById("fill-status");
  month.value=today().slice(0,7);
  var checks=Array.from(form.querySelectorAll('[name="weekday"]'));
  try{var saved=JSON.parse(localStorage.getItem(templateKey)||"null");
    if(saved){if(Array.isArray(saved.days))checks.forEach(function(c){c.checked=saved.days.indexOf(+c.value)>=0});
      if(mins(saved.od)!==null)start.value=saved.od;if(mins(saved.do)!==null)end.value=saved.do;
      if(Number.isInteger(saved.pauza)&&saved.pauza>=0&&saved.pauza<1440)pause.value=saved.pauza;}}
  catch(e){}
  function template(){return {days:checks.filter(function(c){return c.checked}).map(function(c){return +c.value}),od:start.value,do:end.value,pauza:Number(pause.value)}}
  form.addEventListener("input",function(){pause.setCustomValidity("");status.textContent="";try{localStorage.setItem(templateKey,JSON.stringify(template()))}catch(e){}});
  form.addEventListener("submit",function(e){
    e.preventDefault();var t=template(),a=mins(t.od),b=mins(t.do);
    if(!t.days.length){status.textContent=mkText("Izaberite najmanje jedan dan u nedelji.");return}
    if(!/^\d{4}-\d{2}$/.test(month.value)||+month.value.slice(0,4)<1900||+month.value.slice(0,4)>2099){status.textContent=mkText("Izaberite mesec od 1900. do 2099. godine.");return}
    if(!supportedYear(+month.value.slice(0,4))){status.textContent=coverageText.range;return}
    if(a===null||b===null)return;
    var duration=(b<=a?b+1440:b)-a;
    if(!Number.isInteger(t.pauza)||t.pauza<0||t.pauza>=duration){pause.setCustomValidity(mkText("Pauza mora biti kraća od smene."));pause.reportValidity();return}
    var parts=month.value.split("-").map(Number),days=new Date(parts[0],parts[1],0).getDate(),dates=[];
    for(var d=1;d<=days;d++){var date=new Date(parts[0],parts[1]-1,d);if(t.days.indexOf(date.getDay())>=0)dates.push(kljuc(date))}
    var conflicts=R.filter(function(r){return r.auto!==true&&dates.indexOf(r.d)>=0&&(r.od||r.do||Number(r.pauza))});
    if(conflicts.length&&!confirm(mkText("Na izabranim datumima postoje unosi (")+conflicts.length+mkText("). Zameniti ih predloškom? Ostali datumi ostaju sačuvani."))){status.textContent=mkText("Popunjavanje je otkazano. Unosi su sačuvani.");return}
    R=R.filter(function(r){return r.auto!==true&&dates.indexOf(r.d)<0&&(r.d||r.od||r.do||Number(r.pauza))});
    dates.forEach(function(d){R.push({d:d,od:t.od,do:t.do,pauza:t.pauza})});
    R.sort(function(a,b){return (a.d||"").localeCompare(b.d||"")});
    sv();draw();try{localStorage.setItem(templateKey,JSON.stringify(t))}catch(e){}
    status.textContent=mkText("Popunjeno dana: ")+dates.length+mkText(". Svaki unos možete ručno izmeniti.");
  });
}
})();
