/* BiH: separate legal calendars, checked 2026-10-23. Only general closures
   enter the standard fund. Religious rights and limited decisions stay separate. */
(function (g) {
  'use strict';
  var areas={fbih:'Federacija BiH',rs:'Republika Srpska',bd:'Brčko distrikt'};
  var sources={
    fbNew:{title:'FMRSP: Nova godina 2026.',url:'https://fbihvlada.gov.ba/hr/fmrsp-neradni-dani-u-federaciji-bih-povodom-nove-godine-su-1-i-2-januarsijecanj-2026-godine'},
    fbMay:{title:'FMRSP: Praznik rada 2026.',url:'https://fbihvlada.gov.ba/hr/fmrsp-neradni-dani-povodom-prvog-maja-medunarodnog-praznika-rada'},
    fbTransfer:{title:'FMRSP: prijenos drugog dana Praznika rada (primjena zakona)',url:'https://fbihvlada.gov.ba/bs/ponedjeljak-3majsvibanj-neradni-dan'},
    fbMarch:{title:'FMRSP: 1. mart nema automatskog prijenosa',url:'https://fbihvlada.gov.ba/bs/fmrsp-1-mart-dan-nezavisnosti-bih-ove-godine-je-u-nedjelju-i-ne-prenosi-se-ponedjeljak'},
    fbDecision:{title:'Vlada FBiH: odluka 180/2026, neradni 2. mart',url:'https://fbihvlada.gov.ba/bs/88-odluka-o-proglasenju-2-marta-2026-godine-neradnim-danom-u-federaciji-bosne-i-hercegovine'},
    fbState:{title:'Zakon o 25. novembru, Sl. list RBiH 9/95 (pravosuđe BiH)',url:'https://portalfo2.pravosudje.ba/vstvfo-api/vijest/download/157936'},
    fbWork:{title:'Zakon o radu FBiH, čl. 54, 76 (osnovni tekst 26/16; uz kasnije izmjene)',url:'https://fbihvlada.gov.ba/bosanski/zakoni/2016/zakoni/5.html'},
    rsLaw:{title:'Službeni glasnik RS 43/07, Zakon o praznicima, čl. 3–9',url:'https://www.vladars.net/sr-SP-Cyrl/Vlada/Ministarstva/mpb/PPP/Documents/broj%20043.pdf'},
    court:{title:'Ustavni sud BiH: U-2/18, odluka od 28. 3. 2019.',url:'https://www.ustavnisud.ba/uploads/odluke/_bs/U-2-18-1133275.pdf'},
    rsPractice:{title:'Fond PIO RS: objavljena praksa za januar 2026.',url:'https://www.fondpiors.org/?p=22877'},
    rsJan:{title:'Fond PIO RS: 14. januar 2026., ograničen obuhvat i nadoknada',url:'https://www.fondpiors.org/?p=22932'},
    rsFeb:{title:'Fond PIO RS: 16. februar 2026. po zaključku Vlade',url:'https://www.fondpiors.org/?p=23220'},
    bdLaw:{title:'Skupština BD: Zakon o praznicima 19/02, čl. 2–5',url:'https://skupstinabd.ba/3-zakon/hr/Zakon%20o%20praznicima%20Brc--ko%20Distrikta%20BiH/001%2019-02%20Zakon%20o%20praznicima%20Brc--ko%20Distrikta%20BiH.pdf'},
    bdAmend:{title:'Skupština BD: zakon i izmjene 19/22',url:'https://skupstinabd.ba/index.php/hr/zakon.html?id=%2FZakon+o+praznicima+Brc--ko+Distrikta+BiH&lang=hr'},
    bdDecision:{title:'Skupština BD: odluka 01-02-163/26, mart 2026. – januar 2027.',url:'https://skupstinabd.ba/2-registar/ba/Odluke/2026/163.25.%20Odluka%20o%20utvrdjivanju%20neradnih%20dana%202026-2027%20BOS.pdf'},
    bdOld:{title:'Skupština BD: odluka 01-02-283/25 (obuhvata 7. 1. 2026.)',url:'https://skupstinabd.ba/2-registar/ba/Odluke/2025/283.%205.%20%20Odluka%20o%20utvrdjivanju%20neradnih%20dana%202025-2026%20BOS.pdf'},
    bdWork:{title:'Skupština BD: pročišćeni Zakon o radu, čl. 68(4)',url:'https://skupstinabd.ba/3-zakon/hr/Zakon%20o%20radu%20Brc--ko%20Distrikta%20BiH/Nesluz--bena%20proc--is--c-ena%20verzija%20Zakona%20o%20radu%20Brc--ko%20distrikta%20BiH%20%20H.pdf'},
    islam:{title:'Islamska zajednica BiH: službeni datumi za 2026.',url:'https://islamskazajednica.ba/index.php/islamska-zajednica/281-vaktija-kalendar-takvim/32427-znacajni-datumi-u-2026-godini'},
    europe:{title:'Evropska unija: Dan Evrope, 9. maj',url:'https://european-union.europa.eu/principles-countries-history/europe-day_en'}
  };
  var notes={
    fbih:'Opći fond: Nova godina, Praznik rada, 1. mart i 25. novembar. Za 2026. uključen je 2. mart po posebnoj odluci 180/2026. Prijenos Nove godine/Praznika rada kad dan pada u nedjelju razlikuje se od 1. marta i 25. novembra, koji nemaju automatski prijenos. Vjerske i tradicijske potrebe: do četiri radna dana odsustva godišnje, od toga dva plaćena (čl. 54(3) Zakona o radu). Kantonalne i lokalne odluke nisu opći praznici cijele FBiH.',
    rs:'Opći fond isključuje individualne vjerske praznike i 9. januar. Zakon 43/07, čl. 4, prenosi samo drugi dan dvodnevnog republičkog praznika s nedjelje na ponedjeljak; 9. maj i 21. novembar se ne prenose. Vjerski izostanci pripadaju odgovarajućim vjernicima prema čl. 7–8. Posebne odluke s ograničenim obuhvatom nisu uključene u opći fond.',
    bd:'Opći fond obuhvata Novu godinu, Dan uspostave Distrikta 8. marta i Praznik rada. Praznik koji pada u nedjelju prenosi se na prvi radni dan nakon praznika (čl. 5). Odluke o vjerskim blagdanima za institucije, javna preduzeća i ustanove Distrikta nisu opći neradni dani privatnog sektora. Individualno pravo: dva plaćena radna dana godišnje za vjerske blagdane ili običaje (čl. 68(4) Zakona o radu).'
  };
  function iso(y,m,d){return y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
  function events(y,area){
    if([2026,2027].indexOf(+y)<0||!areas[area])return [];
    y=+y;var out=[],law=area==='rs'?'rsLaw':area==='bd'?'bdLaw':'fbNew';
    function add(m,d,name,type,source,note,confirmed){out.push({date:iso(y,m,d),name:name,type:type,source:source,note:note||'',preliminary:y===2027&&!confirmed});}
    [[1,1,'Nova godina'],[1,2,'Nova godina – drugi dan'],[5,1,'Praznik rada'],[5,2,'Praznik rada – drugi dan']].forEach(function(p){add(p[0],p[1],p[2],'general',area==='fbih'?(p[0]===1?'fbNew':'fbMay'):law);});
    if(area==='fbih'){
      add(3,1,'Dan nezavisnosti BiH','general','fbMarch');add(11,25,'Dan državnosti BiH','general','fbState');
      if(y===2026)add(3,2,'Dan nezavisnosti – posebna odluka','general','fbDecision','Posebna odluka za 2026.; nije automatski prijenos.');
      if(y===2027)add(5,3,'Praznik rada – prijenos','general','fbTransfer','Projekcija po zakonskom pravilu; godišnja objava za 2027. nije potvrđena.');
    }
    if(area==='rs'){
      add(5,9,'Dan pobjede nad fašizmom','general',law);add(11,21,'Dan uspostave Općeg okvirnog sporazuma za mir u BiH','general',law);
      if(y===2027)add(5,3,'Praznik rada – prijenos drugog dana','general',law,'Član 4; 9. maj i 21. novembar se ne prenose.');
      add(1,9,'9. januar – obilježavanje Dana Republike (neustavna odredba)','disputed','court','U-2/18 ukida odredbu koja određuje ovaj datum; prethodno U-3/13. Fond PIO najavljuje neradni dan u praksi 2026. Opći fond ga ne odbija. Provjerite raspored i pojedinačni akt poslodavca.');
      if(y===2026){add(1,14,'Nova godina po julijanskom kalendaru','limited','rsJan','Odluka za republičke/lokalne organe, javna preduzeća i ustanove; uz nadoknadu tokom godine. Ne odbija se iz općeg fonda.');add(2,16,'Sretenje – obavijest Fonda PIO','limited','rsFeb','Potvrđena obavijest o neradu Fonda PIO po zaključku Vlade; bez pretpostavke obuhvata svih poslodavaca.');}
    }
    if(area==='bd'){
      add(3,8,'Dan uspostave Brčko distrikta','general',law);
      if(y===2026)add(3,9,'Dan uspostave Brčko distrikta – prijenos','general',law,'8. mart je nedjelja.');
      if(y===2027)add(5,3,'Praznik rada – prijenos','general',law,'2. maj je nedjelja.');
      var bd=y===2026?[[1,7,'Božić (pravoslavni)','bdOld'],[3,20,'Ramazanski bajram'],[4,6,'Uskrsni ponedjeljak'],[4,13,'Vaskršnji ponedjeljak'],[5,27,'Kurban-bajram'],[12,25,'Božić (katolički)']]:[[1,7,'Božić (pravoslavni)']];
      bd.forEach(function(p){add(p[0],p[1],p[2]+' – odluka za javne institucije','limited',p[3]||'bdDecision','Institucije i pravna lica Distrikta, FZO, javna preduzeća i ustanove; nije opći neradni dan privatnog sektora.',true);});
    }
    // Calendar dates are distinct from any individual's entitlement to absence.
    [[1,6,'Badnji dan (pravoslavni)'],[1,7,'Božić (pravoslavni)'],[12,24,'Badnji dan (katolički)'],[12,25,'Božić (katolički)']].forEach(function(p){add(p[0],p[1],p[2],'religious',area==='rs'?'rsLaw':area==='fbih'?'fbWork':'bdWork','Individualno vjersko/tradicijsko pravo; ne odbija se automatski iz općeg fonda.');});
    var easters=y===2026?[[4,5,'Uskrs'],[4,12,'Vaskrs']]:[[3,28,'Uskrs'],[5,2,'Vaskrs']];
    easters.forEach(function(p){[-2,0,1].forEach(function(offset){var d=new Date(y,p[0]-1,p[1]+offset);add(d.getMonth()+1,d.getDate(),offset===-2?'Veliki petak ('+p[2]+')':offset===1?p[2]+' – ponedjeljak':p[2],'religious',area==='rs'?'rsLaw':area==='fbih'?'fbWork':'bdWork','Datum izračunat prema crkvenom kalendaru; individualno pravo, nije opći neradni dan.');});});
    // No unverified 2027 Islamic dates are invented; they are listed as pending in the UI.
    if(y===2026)[[3,20,'Ramazanski bajram'],[5,27,'Kurban-bajram']].forEach(function(p){[0,1].forEach(function(i){add(p[0],p[1]+i,p[2]+(i?' – drugi dan':''),'religious','islam',area==='rs'?'Pravo pripadnika islamske vjeroispovijesti, čl. 8 Zakona o praznicima.':'Datum prema Islamskoj zajednici; odsustvo prema individualnom pravu.');});});
    add(5,9,'Dan Evrope','commemorative','europe','Sam naziv spomendana ne stvara dodatni opći neradni dan. U RS-u 9. maj zasebno ima status općeg praznika po Zakonu o praznicima.');
    return out.sort(function(a,b){return a.date.localeCompare(b.date);});
  }
  function holidays(y,area){var h={};events(y,area).filter(function(e){return e.type==='general';}).forEach(function(e){h[e.date]=e.name;});return h;}
  function month(y,m,area){var h=holidays(y,area),s={days:0,weekdays:0,weekends:0,holidays:0,holidayWeekdays:0,before:0,after:0,workdays:0};for(var d=1;d<=new Date(y,m+1,0).getDate();d++){var dt=new Date(y,m,d),weekend=dt.getDay()===0||dt.getDay()===6;s.days++;if(weekend)s.weekends++;else s.weekdays++;if(h[iso(y,m+1,d)]){s.holidays++;if(!weekend)s.holidayWeekdays++;}}s.workdays=s.weekdays-s.holidayWeekdays;s.before=s.weekdays*8;s.after=s.workdays*8;return s;}
  var api={areas:areas,sources:sources,notes:notes,events:events,holidays:holidays,month:month,iso:iso};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else g.BAData=api;
})(typeof window!=='undefined'?window:globalThis);
