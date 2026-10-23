(function(g){
'use strict';
const sources={holidays:'https://gzk.rks-gov.net/ActDocumentDetail.aspx?ActID=2539',work:'https://gzk.rks-gov.net/ActDocumentDetail.aspx?ActID=2735',calendar:'https://bqk-kos.org/wp-content/uploads/2025/12/kalendari-i-festave-2026.pdf',ministry:'https://mpb.rks-gov.net/f/86/Festat-Zyrtare',islam:'https://bislame.net/takvimi/'};
const key=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function events(y){y=+y;if(![2026,2027].includes(y))return [];let a=[];
function add(md,name,free=true,source='holidays',extra={}){a.push({date:y+'-'+md,name,free,preliminary:y===2027,source,...extra});}
[['01-01','Viti i Ri'],['01-02','Viti i Ri'],['01-07','Krishtlindjet ortodokse'],['02-17','Dita e Pavarësisë'],['04-09','Dita e Kushtetutës'],['05-01','Dita Ndërkombëtare e Punës'],['05-09','Dita e Evropës'],['12-25','Krishtlindjet katolike']].forEach(p=>add(...p));
if(y===2026){[['03-20','Fitër Bajrami — dita e parë'],['04-06','E hëna e Pashkëve katolike'],['04-13','E hëna e Pashkëve ortodokse'],['05-27','Kurban Bajrami — dita e parë']].forEach(p=>add(...p,true,'calendar'));add('05-11','Dita e Evropës — pushimi i bartur',true,'calendar',{original:y+'-05-09'});}
else{add('03-29','E hëna e Pashkëve katolike');add('05-03','E hëna e Pashkëve ortodokse');
// Reserve statutory weekdays before allocating weekend substitutions. The May collision awaits the official calendar.
let reserved=new Set(a.filter(e=>![0,6].includes(new Date(e.date+'T12:00').getDay())).map(e=>e.date));
for(const e of [...a]){let d=new Date(e.date+'T12:00');if(![0,6].includes(d.getDay()))continue;do{d.setDate(d.getDate()+1)}while([0,6].includes(d.getDay())||reserved.has(key(d)));reserved.add(key(d));add(key(d).slice(5),e.name+' — pushimi i bartur',true,'holidays',{original:e.date,collision:e.date==='2027-05-01'});}}
[['02-15','Dita e ashkalinjve'],['03-06','Dita e veteranëve'],['04-08','Dita e romëve'],['04-23','Dita e turqve'],['05-06','Dita e goranëve'],['06-12','Dita e paqes'],['09-28','Dita e boshnjakëve'],['11-28','Dita e shqiptarëve']].forEach(p=>add(...p,false));
return a.sort((a,b)=>a.date.localeCompare(b.date));}
function holidays(y){let h={};events(y).filter(e=>e.free).forEach(e=>h[e.date]=e.name);return h;}
function month(y,m){let s={days:0,weekdays:0,weekends:0,holidayWeekdays:0,before:0,after:0},h=holidays(y);for(let d=1;d<=new Date(y,m+1,0).getDate();d++){let dt=new Date(y,m,d),w=![0,6].includes(dt.getDay());s.days++;w?s.weekdays++:s.weekends++;if(w&&h[key(dt)])s.holidayWeekdays++;}s.before=s.weekdays*8;s.after=(s.weekdays-s.holidayWeekdays)*8;return s;}
function split(date,start,end){let a=+start.slice(0,2)*60+ +start.slice(3),b=+end.slice(0,2)*60+ +end.slice(3);if(b<=a)b+=1440;let s={hours:(b-a)/60,night:0,sunday:0,holiday:0,overlap:0},cache={};for(let t=a;t<b;t++){let dt=new Date(date+'T12:00');dt.setDate(dt.getDate()+Math.floor(t/1440));let y=dt.getFullYear(),h=(cache[y]||(cache[y]=holidays(y)))[key(dt)],weekend=[0,6].includes(dt.getDay()),m=t%1440;if(m>=1320||m<360)s.night++;if(weekend)s.sunday++;if(h)s.holiday++;if(h&&weekend)s.overlap++;}['night','sunday','holiday','overlap'].forEach(k=>s[k]/=60);return s;}
let api={events,holidays,month,sources,split};if(typeof module!=='undefined')module.exports=api;else g.XKData=api;
})(typeof window!=='undefined'?window:globalThis);
