(function(){
    'use strict';
    const country=location.pathname.split('/')[1];
    if(!['rs','me','ba'].includes(country))throw new Error('Nepoznata evidencija');
    const scope=country==='ba'?BA.key:country;
    const regionName=country==='ba'?'BiH — '+BA.name:country==='rs'?'Srbija':'Crna Gora';
    const prefix=scope+':evidence:v2:';
    // JSON preserves field boundaries; URI encoding preserves all Unicode characters.
    // NFC treats canonically equivalent spellings as the same employee, without stripping accents.
    function token(name,id){return encodeURIComponent(JSON.stringify([String(name).trim().normalize('NFC'),String(id||'').trim().normalize('NFC')]));}
    function key(name,id,year,month){return prefix+'entry:'+token(name,id)+':'+Number(year)+':'+Number(month);}
    function loadProfile(){try{let t=localStorage.getItem(prefix+'active');return t?JSON.parse(localStorage.getItem(prefix+'person:'+t)||'{}'):{};}catch(e){return {};}}
    function saveProfile(profile){let t=token(profile.ime,profile.oib);localStorage.setItem(prefix+'person:'+t,JSON.stringify(profile));localStorage.setItem(prefix+'active',t);}
    window.EvidenceStorage={scope,key,loadProfile,saveProfile};

    function mountRecovery(){
        const anchor=document.getElementById('mojiPodaciBox');if(!anchor)return;
        const box=document.createElement('details');box.id='evidence-recovery';box.style.cssText='margin:15px 0;padding:14px;border:1px solid #aaa;border-radius:8px;background:#fff;color:#222;overflow-wrap:anywhere';
        box.innerHTML='<summary>Oporavak starih evidencija</summary><p>Stari podaci se ne učitavaju automatski. Za zapise bez oznake države nije moguće pouzdano utvrditi poreklo. Stari ključ može objediniti različita imena sa dijakritičkim znakovima. Pregledajte zapis i potvrdite kojoj državi, području i zaposlenom pripada. Kopiranje ne briše niti menja izvor, a postojeći ciljni zapis se ne prepisuje.</p><p id="recovery-target"></p><button type="button" id="recover-profile">Preuzmi stare lične podatke uz potvrdu</button><p><label>Stari zapis <select id="recovery-source" style="max-width:100%;width:100%"></select></label></p><pre id="recovery-preview" style="max-height:240px;overflow:auto;white-space:pre-wrap"></pre><button type="button" id="recover-entry">Kopiraj izabrani zapis uz potvrdu</button><p id="recovery-status" role="status" aria-live="polite"></p>';
        anchor.after(box);
        const $=id=>document.getElementById(id),select=$('recovery-source'),message=s=>{$('recovery-status').textContent=s;};
        const oldProfileKey=country==='ba'?scope+'-mojiPodaci':'mojiPodaci';
        const oldPrefix=country==='ba'?scope+'_ev_':'ev_';
        function candidate(k){if(!k.startsWith(oldPrefix))return null;let match=k.slice(oldPrefix.length).match(/^(.+)_(\d{4})_(\d{1,2})$/);return match&&+match[3]>=1&&+match[3]<=12?{year:+match[2],month:+match[3]}:null;}
        function profile(){return loadProfile();}
        function refresh(){
            let p=profile();$('recovery-target').textContent='Cilj: '+regionName+' · '+(p.ime||'prvo unesite zaposlenog')+(p.oib?' · ID: '+p.oib:' · bez identifikacionog broja');
            $('recover-profile').disabled=!!p.ime||localStorage.getItem(oldProfileKey)===null;
            const chosen=select.value;select.replaceChildren();let keys=[];for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i);if(candidate(k))keys.push(k);}
            keys.sort().forEach(k=>{let opt=document.createElement('option');opt.value=k;opt.textContent=k;select.append(opt);});if(keys.includes(chosen))select.value=chosen;
            preview();
        }
        function preview(){let raw=select.value?localStorage.getItem(select.value):null;$('recovery-preview').textContent=raw===null?'Nema starih zapisa za oporavak.':raw;$('recover-entry').disabled=raw===null||!profile().ime;}
        select.onchange=()=>{message('');preview();};box.addEventListener('toggle',()=>{if(box.open)refresh();});
        $('recover-profile').onclick=()=>{
            try{if(profile().ime){message('Postojeći identitet nije promenjen.');return;}let raw=localStorage.getItem(oldProfileKey),p=JSON.parse(raw||'null');if(!p||typeof p.ime!=='string'||!p.ime.trim()){message('Stari lični podaci nisu ispravni.');return;}
                if(!confirm('Potvrđujete da stari lični podaci za '+p.ime+' pripadaju području '+regionName+'? Izvor ostaje sačuvan.')){message('Oporavak je otkazan.');return;}
                let dest=prefix+'person:'+token(p.ime,p.oib);if(localStorage.getItem(dest)!==null||profile().ime){message('Ciljni identitet već postoji. Ništa nije prepisano.');return;}
                saveProfile(p);ucitajMojePodatke();ucitajEvidenciju();refresh();message('Lični podaci su kopirani. Evidencije preuzmite zasebno uz potvrdu.');
            }catch(e){message('Oporavak nije uspeo; stari podaci nisu promenjeni.');}
        };
        $('recover-entry').onclick=()=>{
            try{let source=select.value,period=candidate(source),p=profile(),raw=localStorage.getItem(source);if(!period||!p.ime||raw===null){message('Izaberite zapis i zaposlenog.');return;}
                let parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)){message('Stari zapis nije ispravan objekat evidencije.');return;}
                let dest=key(p.ime,p.oib,period.year,period.month);
                if(localStorage.getItem(dest)!==null){message('Ciljni mesečni zapis već postoji. Ništa nije prepisano; izvor je dostupan u pregledu.');return;}
                if(!confirm('Potvrđujem da zapis '+source+' pripada području '+regionName+', zaposlenom '+p.ime+(p.oib?' (ID: '+p.oib+')':' (bez ID)')+', za '+period.month+'/'+period.year+'. Imena u starim ključevima mogu biti dvosmislena. Kopirati prikazani zapis bez brisanja izvora?')){message('Oporavak je otkazan.');return;}
                // Recheck after confirmation, including changes from other tabs.
                if(localStorage.getItem(dest)!==null||localStorage.getItem(source)!==raw){message('Podaci su se promenili. Ništa nije prepisano; ponovo pregledajte zapis.');refresh();return;}
                localStorage.setItem(dest,raw);ucitajEvidenciju();message('Zapis je kopiran za '+period.month+'/'+period.year+'. Izvor je ostao nepromenjen.');
            }catch(e){message('Kopiranje nije uspelo; stari podaci nisu promenjeni.');}
        };
        refresh();
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountRecovery);else mountRecovery();
})();
