// The break is explicit. Missing legacy break data never implies a 30-minute deduction.
(function(){
'use strict';
function hours(p){
  if(!p.dolazak||!p.odlazak)return p.redovni||'';
  if(BA.area==='fbih'&&(p.pauza===undefined||p.pauza===''))return p.redovni||'';
  const mins=t=>Number(t.slice(0,2))*60+Number(t.slice(3)),a=mins(p.dolazak),b=mins(p.odlazak);
  let duration=b-a;if(duration<0)duration+=1440;
  const pause=Number(p.pauza||0);
  if(!Number.isInteger(pause)||pause<0||(duration>0&&pause>=duration))return '';
  return String(Math.round(Math.max(0,duration-(BA.area==='fbih'?pause:0))/60*100)/100);
}
function normalize(data){const copy={};Object.entries(data).forEach(([d,p])=>{copy[d]={...p,redovni:hours(p)};});return copy;}
function note(){return BA.area==='fbih'?'FBiH: prema članu 44. stav 3. Zakona o radu stvarna neplaćena pauza ne ulazi u radno vrijeme. Unesite minute pauze za svaki radni dan (0 samo ako nema odbitka). Pauza nije unaprijed zadana. Stari zapisi bez podatka o pauzi ostaju sačuvani; njihovi sati i zbrojevi su nepotvrđeni dok ne provjerite pauzu. Novi unos bez pauze nema izračunate sate. Kolektivni ugovor ili pravilnik mogu predvidjeti povoljnije pravilo; tada unesite samo neplaćeni dio pauze.':'Pauza u Republici Srpskoj i Brčko distriktu uračunava se u radno vrijeme. Unesene minute ne umanjuju sate.';}
window.BAEvidenceBreak={hours,normalize,note};
})();
