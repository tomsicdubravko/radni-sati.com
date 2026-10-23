(function(){
  'use strict';
  var q=new URLSearchParams(location.search),area=q.get('podrucje');
  try{if(!BAData.areas[area])area=localStorage.getItem('ba-podrucje');}catch(e){}
  if(!BAData.areas[area])area='fbih';
  try{localStorage.setItem('ba-podrucje',area);}catch(e){}
  window.BA={area:area,key:'ba-'+area,name:BAData.areas[area]};
  window.prazniciZemlje=function(y){return BAData.holidays(y,area);};
  window.praznici=function(y){return BAData.holidays(y,area);};
  window.RS_Y=+q.get('g')===2027?2027:2026;
  document.addEventListener('DOMContentLoaded',function(){
    var host=document.getElementById('ba-area');
    if(host){
      host.innerHTML='<label for="ba-area-select">Područje: <strong>'+BA.name+'</strong></label><select id="ba-area-select" aria-describedby="ba-area-note">'+Object.keys(BAData.areas).map(function(k){return '<option value="'+k+'"'+(k===area?' selected':'')+'>'+BAData.areas[k]+'</option>';}).join('')+'</select><small id="ba-area-note">Izbor se pamti na ovom uređaju. Podaci svakog područja spremaju se odvojeno.</small>';
      host.querySelector('select').onchange=function(){var url=new URL(location.href);url.searchParams.set('podrucje',this.value);try{localStorage.setItem('ba-podrucje',this.value);}catch(e){}location.assign(url.href);};
    }
    document.querySelectorAll('a[href^="/ba/"]').forEach(function(a){var url=new URL(a.href);url.searchParams.set('podrucje',area);a.href=url.pathname+url.search+url.hash;});
    document.querySelectorAll('[data-area-name]').forEach(function(e){e.textContent=BA.name;});
    document.querySelectorAll('[data-area-note]').forEach(function(e){e.textContent=BAData.notes[area];});
    var menu=document.getElementById('rs-menu'),burger=document.querySelector('.rs-burger');
    if(menu&&burger){burger.onclick=function(){var open=menu.classList.toggle('open');burger.setAttribute('aria-expanded',String(open));burger.setAttribute('aria-label',open?'Zatvori meni':'Otvori meni');burger.textContent=open?'✕':'☰';};menu.querySelectorAll('a[data-sek]').forEach(function(a){var p=a.dataset.sek;if(p==='/ba/'?location.pathname==='/ba/':location.pathname.indexOf(p)===0)a.setAttribute('aria-current','page');});}
  });
})();
