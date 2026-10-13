/* Gustavsfors VVO 2.0.0. No external services or tracking. */
(() => {
  'use strict';
  const VERSION = '2.0.0';
  const $ = s => document.querySelector(s);
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    rules:'<path d="M5 3h14v18H5zM9 7h6M9 11h6M9 15h4"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/>',
    book:'<path d="M12 5v16M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 2-3-3-6-3-9-2Z"/>',
    people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5"/>',
    forest:'<path d="m8 3-5 8h3l-4 7h12l-4-7h3ZM8 18v4M16 5l5 8h-3l4 7h-6M17 20v2"/>',
    bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    back:'<path d="M20 12H4m6-6-6 6 6 6"/>',
    chevron:'<path d="m6 9 6 6 6-6"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    moon:'<path d="M20.8 13.2A9 9 0 0 1 10.8 3.2a9 9 0 1 0 10 10Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  const icon = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  const docs = {
    pm:{title:'Älgjakt PM 2026',short:'Älgjakt 2026',icon:'forest',desc:'Samling, tilldelning och praktisk information inför 23–25 oktober.',eyebrow:'INFÖR ÄLGJAKTEN'},
    jaktregler:{title:'Jaktregler',short:'Jaktregler',icon:'rules',desc:'Föreningens 14 regler, samlade och lätta att hitta.',eyebrow:'GUSTAVSFORS VVO'},
    jakttider:{title:'Jakttider',short:'Jakttider',icon:'calendar',desc:'Sammanställda tider för Västra Götalands län. Kontrollera aktuella myndighetsbeslut och lokala villkor före jakt.',eyebrow:'VÄSTRA GÖTALAND'},
    stadgar:{title:'Stadgar',short:'Stadgar',icon:'book',desc:'Föreningens uppdrag, medlemskap och hur beslut fattas.',eyebrow:'FÖRENINGEN'},
    protokoll:{title:'Årsmöte GVVO 2026',short:'Årsmöte GVVO',icon:'people',desc:'Beslut från föreningens årsmöte den 9 juli 2026.',eyebrow:'ÅRSMÖTESBESLUT'},
    aso:{title:'Krokfors ÄSO 2026',short:'Krokfors ÄSO',icon:'forest',desc:'Beslut från älgskötselområdets årsmöte den 12 april 2026.',eyebrow:'ÄLGSKÖTSELOMRÅDET'}
  };
  const source = window.GVVO_DATA;
  const textOf = html => { const el = document.createElement('div'); el.innerHTML = html; return el.textContent || ''; };
  const MON = ['','jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
  const perLabel = p => `${p[0]} ${MON[p[1]]} – ${p[2]} ${MON[p[3]]}`;
  const todayKey = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const withinPeriod = (p, key = todayKey()) => {
    const n = Number(key.slice(5,7))*100 + Number(key.slice(8,10));
    const a = p[1]*100 + p[0], b = p[3]*100 + p[2];
    return a <= b ? n >= a && n <= b : n >= a || n <= b;
  };
  const items = source.map((item,i) => ({...item,id:`${item.doc.slice(0,2)}-${i}`,search:textOf([docs[item.doc].title,item.tag,item.title,...item.blocks.map(b => b.html || (b.items || []).join(' ') || (b.rows || []).map(r => [r.a,r.k,r.n || '',...r.p.map(perLabel)].join(' ')).join(' '))].join(' ')).toLocaleLowerCase('sv')}));
  const activeItems = () => items.filter(item => !item.until || todayKey() <= item.until);
  const hasPM = () => activeItems().some(i => i.doc === 'pm');
  const storage = {
    get(key,fallback){try {return localStorage.getItem(key) ?? fallback;} catch {return fallback;}},
    set(key,value){try {localStorage.setItem(key,value);return true;} catch {return false;}}
  };
  let saved;
  try { const value=JSON.parse(storage.get('gvvo-saved','[]'));saved=new Set(Array.isArray(value)?value.filter(id => items.some(i=>i.id===id)):[]); } catch {saved=new Set();}
  let state = {page:'home',q:'',open:new Set()};
  let currentItems = [];
  let toastTimer;
  const main = $('#main');
  const toast = msg => {$('#toast').textContent=msg;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3200);};
  const activeSaved = () => activeItems().filter(i=>saved.has(i.id));

  function renderNav(){
    const entries = [['home','Hem','home'],...(hasPM()?[['pm','Älgjakt 2026','forest']]:[]),['jaktregler','Jaktregler','rules'],['jakttider','Jakttider','calendar'],['stadgar','Stadgar','book'],['protokoll','Årsmöte GVVO','people'],['aso','Krokfors ÄSO','forest'],['saved','Sparat','bookmark'],['more','Mer & inställningar','more']];
    $('#desktopNav').innerHTML=entries.map(([id,label,ic])=>`${id==='saved'?'<div class="nav-divider"></div>':''}<a class="side-link ${state.page===id&&!state.q?'active':''}" href="#${id}" ${state.page===id&&!state.q?'aria-current="page"':''}>${icon(ic)}<span>${label}</span>${id==='saved'?`<span class="nav-count">${activeSaved().length}</span>`:''}</a>`).join('');
    const bottom=[['home','Hem','home'],['jaktregler','Regler','rules'],['jakttider','Jakttider','calendar'],['saved','Sparat','bookmark'],['more','Mer','more']];
    const active=['home','jaktregler','jakttider','saved'].includes(state.page)?state.page:'more';
    $('#bottomNav').innerHTML=bottom.map(([id,label,ic])=>`<a href="#${id}" class="bottom-link ${active===id&&!state.q?'active':''}" ${active===id&&!state.q?'aria-current="page"':''}>${icon(ic)}<span>${label}</span></a>`).join('');
  }
  function forestArt(){
    return `<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 440 330" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#b2baa0" stop-opacity="0"/><stop offset="1" stop-color="#c4c4a7" stop-opacity=".35"/></linearGradient><path id="fir" d="M0 0-10 18h5l-11 18h8l-13 23h17v12h8V59h17L8 36h8L5 18h5Z"/></defs><rect width="440" height="330" fill="url(#sky)"/><circle cx="290" cy="78" r="32" fill="#d9c696" opacity=".65"/><path d="M0 185Q80 100 170 147T440 111V330H0Z" fill="#6e8973" opacity=".4"/><path d="M0 245Q106 135 224 191T440 161V330H0Z" fill="#456951"/><path d="M0 290Q125 192 230 242T440 211V330H0Z" fill="#294c3c"/><g fill="#335b44"><use href="#fir" transform="translate(136 120) scale(.65)"/><use href="#fir" transform="translate(184 137) scale(.8)"/><use href="#fir" transform="translate(373 92) scale(1.6)"/><use href="#fir" transform="translate(319 144) scale(.8)"/><use href="#fir" transform="translate(229 163) scale(.65)"/></g><path d="M0 335Q111 226 258 283T440 247V340H0Z" fill="#103b30"/><g fill="#123f32"><use href="#fir" transform="translate(406 88) scale(2.4)"/><use href="#fir" transform="translate(294 192) scale(1.45)"/><use href="#fir" transform="translate(337 165) scale(1.7)"/><use href="#fir" transform="translate(200 216) scale(1.1)"/></g><path d="M133 330q40-40 93-48t23-29" fill="none" stroke="#b9b590" stroke-opacity=".2" stroke-width="3"/></svg></div>`;
  }
  const quick = (id,sub) => `<a class="quick-link" href="#${id}"><span class="quick-icon">${icon(docs[id].icon)}</span>${icon('arrow','arrow')}<h3>${docs[id].short}</h3><p>${sub}</p></a>`;
  function renderHome(){
    const pm=hasPM();
    const events = [
      {date:'2026-10-16',day:'16',title:'Anmälan till älgjakten',sub:'Sista anmälningsdag enligt PM',hash:'pm/pm-67'},
      {date:'2026-10-17',day:'17',title:'Samjakt på småvilt',sub:'Enligt årsmötets beslut',hash:'protokoll'},
      {date:'2026-10-22',day:'22',title:'Betala startavgiften',sub:'300 kr · senast dagen före jaktstart',hash:'pm/pm-67'}
    ].filter(e=>e.date>=todayKey());
    main.innerHTML=`<section class="hero"><div class="hero-copy"><div class="eyebrow">GUSTAVSFORS VILTVÅRDSOMRÅDE</div><h1>Allt inför<br>nästa jakt.</h1><p>Regler, jakttider och gemensamma beslut.<br>Enkelt att hitta. Nära till hands.</p><span class="hero-small">${icon('pin')}Bengtsfors · Västra Götaland</span></div>${forestArt()}</section>
      ${pm?`<section class="season-card" aria-labelledby="seasonTitle"><div class="date-tile"><b>23</b><span>OKT</span></div><div><span class="season-label">${todayKey()<'2026-10-23'?'Snart dags':todayKey()<='2026-10-25'?'Planerade jaktdagar':'Jaktens PM'}</span><h2 id="seasonTitle">Älgjakt 23–25 oktober</h2><p>Samling 07:00 · Koperud-slingan</p></div><a href="#pm" class="primary-button">Läs jaktens PM ${icon('arrow')}</a></section>`:''}
      <section aria-labelledby="quickTitle"><div class="section-heading"><h2 id="quickTitle">Hitta rätt direkt</h2><span>FÖR DIG I OMRÅDET</span></div><div class="quick-grid">${quick('jaktregler','Det här gäller i vårt område')}${quick('jakttider','Tider för vilt och fågel')}${quick('stadgar','Medlemskap, ansvar & beslut')}${quick('protokoll','Föreningens beslut 2026')}${quick('aso','Älgskötselområdets beslut')}${`<a class="quick-link" href="#saved"><span class="quick-icon">${icon('bookmark')}</span>${icon('arrow','arrow')}<h3>Dina sparade</h3><p>${activeSaved().length?activeSaved().length+' avsnitt nära till hands':'Spara det du vill hitta igen'}</p></a>`}</div></section>
      <div class="home-lower"><section><div class="section-heading"><h2>${events.length?'Att ha koll på':'Bra att ha nära'}</h2>${events.length?'<span>OKTOBER 2026</span>':''}</div>${events.length?`<div class="reminders">${events.map(e=>`<a class="reminder" href="#${e.hash}"><span class="reminder-date"><b>${e.day}</b>OKT</span><span><strong>${e.title}</strong><small>${e.sub}</small></span>${icon('arrow')}</a>`).join('')}</div>`:`<div class="reminders"><a class="reminder" href="#jaktregler">${icon('rules')}<span><strong>Föreningens jaktregler</strong><small>Inför nästa tillfälle i skogen</small></span>${icon('arrow')}</a><a class="reminder" href="#protokoll">${icon('people')}<span><strong>Årsmötets beslut</strong><small>Lokala villkor och gemensamhetsjakter</small></span>${icon('arrow')}</a></div>`}</section><section class="field-note">${icon('download')}<h2>Med dig ut i skogen.</h2><p>Lägg guiden på hemskärmen. Efter att sidan har sparats offline kan du läsa även utan mobiltäckning.</p><a href="#install" class="text-link">Så lägger du till guiden</a></section></div>
      <p class="source-note">${icon('info')}<span>Sammanställt ur föreningens handlingar. Aktuella beslut och originalhandlingar gäller alltid. <a href="#about">Läs om underlagen</a>.</span></p>`;
  }
  const heading = (title,desc,eyebrow='DIN JAKTGUIDE') => `<a class="page-back" href="#home">${icon('back')}Till startsidan</a><div class="page-heading"><p class="eyebrow">${eyebrow}</p><h1>${escapeHTML(title)}</h1>${desc?`<p>${escapeHTML(desc)}</p>`:''}</div>`;
  function renderBlock(b){
    if(['p','note'].includes(b.t))return `<p${b.t==='note'?' class="note"':''}>${b.html}</p>`;
    if(b.t==='sub')return `<h3>${b.html}</h3>`;
    if(b.t==='beslut')return `<div class="beslut">${b.html}</div>`;
    if(b.t==='raw')return b.html;
    if(b.t==='ul'||b.t==='ol')return `<${b.t}>${b.items.map(x=>`<li>${x}</li>`).join('')}</${b.t}>`;
    if(b.t==='now'){
      const count=items.filter(i=>i.doc==='jakttider').flatMap(i=>i.blocks.filter(b=>b.t==='jt').flatMap(b=>b.rows)).filter(r=>r.p.some(p=>withinPeriod(p))).length;
      return `<div class="nowbox"><strong>Datumhjälp · ${new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',day:'numeric',month:'long'}).format(new Date())}</strong><p>${count} rader i tabellen omfattar dagens datum.</p><small>En datummarkering betyder inte att jakt är tillåten. Art, område, tilldelning och lokala beslut avgör. Tiderna är hämtade ur sidans befintliga underlag.</small></div>`;
    }
    if(b.t==='jt')return `<div class="jt">${b.rows.map(r=>`<div class="jt-row"><div class="jt-a">${escapeHTML(r.a)}</div><div class="jt-k">${escapeHTML(r.k)}</div><div class="jt-p">${r.p.map(perLabel).join('<br>')}${r.p.some(p=>withinPeriod(p))?'<span class="period-label">Dagens datum ingår</span>':''}</div>${r.n?`<div class="jt-n">${escapeHTML(r.n)}</div>`:''}</div>`).join('')}</div>`;
    return '';
  }
  function cardHTML(it){
    const open=Boolean(state.q)||state.open.has(it.id), isSaved=saved.has(it.id);
    return `<article class="card ${open?'open':''}" id="${it.id}" data-id="${it.id}"><div class="card-top"><button class="card-head" aria-expanded="${open}" aria-controls="body-${it.id}" id="head-${it.id}"><span class="tag tag-${it.doc}">${escapeHTML(it.tag)}</span><span class="card-title">${state.q||state.page==='saved'?`<span class="src">${docs[it.doc].title}</span>`:''}<span class="card-heading" role="heading" aria-level="2">${escapeHTML(it.title)}</span></span>${icon('chevron','chev')}</button><button class="bookmark" data-save="${it.id}" aria-pressed="${isSaved}" aria-label="${isSaved?'Ta bort sparat avsnitt':'Spara avsnitt'}: ${escapeHTML(it.title)}" title="${isSaved?'Ta bort från sparat':'Spara avsnitt'}">${icon('bookmark')}</button></div><div class="card-body" id="body-${it.id}" role="region" aria-labelledby="head-${it.id}" ${open?'':'hidden'}>${it.blocks.map(renderBlock).join('')}</div></article>`;
  }
  function renderCollection(){
    const query=state.q.trim().toLocaleLowerCase('sv'), terms=query.split(/\s+/).filter(Boolean);
    let title,desc,eyebrow;
    if(query){currentItems=activeItems().filter(i=>terms.every(t=>i.search.includes(t)));title='Sökresultat';desc=`${currentItems.length} ${currentItems.length===1?'träff':'träffar'} för ”${state.q.trim()}” i alla dokument.`;eyebrow='SÖK I HELA GUIDEN';}
    else if(state.page==='saved'){currentItems=activeSaved();title='Dina sparade';desc='Avsnitten du vill hitta snabbt. Sparas på den här enheten.';eyebrow='NÄRA TILL HANDS';}
    else {currentItems=activeItems().filter(i=>i.doc===state.page);({title,desc,eyebrow}=docs[state.page]);}
    main.innerHTML=heading(title,desc,eyebrow);
    if(!currentItems.length){
      main.insertAdjacentHTML('beforeend',`<div class="empty">${icon(query?'search':'bookmark')}<h2>${query?'Inga träffar den här gången':'Här samlar du det viktiga'}</h2><p>${query?'Prova ett kortare sökord, till exempel jaktledare, avgift eller rådjur.':'Tryck på bokmärket bredvid ett avsnitt för att spara det här.'}</p><a href="#jaktregler" class="primary-button">Öppna jaktregler ${icon('arrow')}</a></div>`);
    }else{
      const sections=!query&&state.page!=='saved'?currentItems.filter(i=>i.tag.startsWith('§')):[];
      main.insertAdjacentHTML('beforeend',`${sections.length>1?`<nav class="chips" aria-label="Gå till paragraf">${sections.map(i=>`<a class="chip" href="#${i.doc}/${i.id}">${escapeHTML(i.tag)}</a>`).join('')}</nav>`:''}<div class="doc-toolbar"><span>${currentItems.length} ${query?'träffar':'avsnitt'}</span><button id="toggleAll" class="subtle-button">${currentItems.every(i=>state.open.has(i.id))||query?'Fäll ihop alla':'Visa alla avsnitt'}</button></div><div id="articles">${currentItems.map(cardHTML).join('')}</div>`);
      if(query)highlight($('#articles'),terms);
    }
    if(query)$('#announcer').textContent=desc;
  }
  function highlight(root,terms){
    const pattern=terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|');
    const re=new RegExp(pattern,'giu');
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('svg,button.bookmark')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{const str=n.textContent;re.lastIndex=0;if(!re.test(str))return;re.lastIndex=0;const frag=document.createDocumentFragment();let last=0;for(const m of str.matchAll(re)){frag.append(str.slice(last,m.index));const mark=document.createElement('mark');mark.textContent=m[0];frag.append(mark);last=m.index+m[0].length;}frag.append(str.slice(last));n.replaceWith(frag);});
  }
  function renderMore(){
    const ids=[...(hasPM()?['pm']:[]),'stadgar','protokoll','aso'];
    main.innerHTML=heading('Mer i guiden','Dokument, inställningar och hjälp.')+`<div class="menu-grid">${ids.map(id=>`<a class="menu-row" href="#${id}"><span class="quick-icon">${icon(docs[id].icon)}</span><span><strong>${docs[id].title}</strong><small>${id==='pm'?'Allt inför 23–25 oktober':'Föreningens underlag'}</small></span>${icon('arrow','arrow')}</a>`).join('')}<a class="menu-row" href="#install"><span class="quick-icon">${icon('download')}</span><span><strong>Lägg till på hemskärmen</strong><small>iPhone, Samsung & andra mobiler</small></span>${icon('arrow','arrow')}</a><a class="menu-row" href="#about"><span class="quick-icon">${icon('info')}</span><span><strong>Om guiden & källor</strong><small>Underlag och version</small></span>${icon('arrow','arrow')}</a></div><div class="section-heading"><h2>Gör guiden till din</h2></div><div class="setting-row"><span><strong>Mörkt läge</strong><small>En lugnare skärm i svagt ljus</small></span><button class="switch" id="darkSwitch" role="switch" aria-label="Mörkt läge" aria-checked="${document.documentElement.dataset.theme==='dark'}"></button></div><div class="setting-row"><span><strong>Större text</strong><small>Ökar textstorleken i dokumenten</small></span><button class="switch" id="textSwitch" role="switch" aria-label="Större text" aria-checked="${document.documentElement.dataset.large==='true'}"></button></div><div class="setting-row"><span><strong>Hämta senaste versionen</strong><small id="versionHint">Version ${VERSION}</small></span><button class="subtle-button" id="refreshBtn">Uppdatera</button></div>`;
  }
  function renderInstall(){
    main.innerHTML=heading('Ta med guiden','En genväg på hemskärmen – precis där du behöver den.')+`<div class="prose"><h2>På iPhone · Safari</h2><ol><li>Öppna guiden i Safari.</li><li>Öppna <b>Dela</b> i webbläsarens meny.</li><li>Välj <b>Lägg till på hemskärmen</b> och sedan <b>Lägg till</b>. Menyns placering kan variera mellan versioner.</li></ol><h2>På Samsung · Chrome eller Samsung Internet</h2><ol><li>Öppna webbläsarens meny.</li><li>Välj <b>Lägg till på startskärmen</b> eller <b>Installera app</b>. Namnet kan skilja sig mellan webbläsare.</li><li>Bekräfta för att lägga till guiden.</li></ol><button class="primary-button" id="installBtn" hidden>Installera guiden ${icon('download')}</button><h2>Läsa utan täckning</h2><p id="offlineHelp">Öppna sidan med internetanslutning och vänta tills guiden har sparats. Då kan dokumenten läsas även utan täckning.</p><p>Offline visas den senast hämtade versionen. Öppna guiden med anslutning före jakten så att uppdateringar kan hämtas. Externa källor kräver internet.</p><h2>Dina sparade avsnitt</h2><p>Bokmärken och inställningar sparas bara i den här webbläsaren. De följer inte automatiskt med till andra enheter och kan försvinna om webbläsarens data rensas.</p></div>`;
    if(installPrompt)$('#installBtn').hidden=false;
    updateConnection();
  }
  function renderAbout(){
    main.innerHTML=heading('Om guiden & källor','En samlad ingång till Gustavsfors viltvårdsområdes handlingar.')+`<div class="prose"><h2>Föreningens underlag</h2><ul><li>Föreningens jaktregler.</li><li>Normalstadgar från Svenska Jägareförbundet, dnr 27-45408-2001.</li><li>Gustavsfors VVO:s årsmötesprotokoll, 9 juli 2026.</li><li>Krokfors älgskötselområdes årsmötesprotokoll, 12 april 2026.</li><li>PM för älgjakten 23–25 oktober 2026. Avsnittet döljs efter 26 oktober.</li></ul><p>Texter och uppgifter är bevarade från den tidigare sidan. Den här uppdateringen gäller utformning och funktion. Den innebär ingen ny sakgranskning av regler, avgifter eller jakttider.</p><h2>Originalen gäller</h2><p>Vid tveksamhet gäller originalhandlingarna och aktuella beslut. Handskrivna ifyllnader är <span class="fill">markerade</span> och bör verifieras mot originalet. Föreningen omfattas av lag (2000:592) om viltvårdsområden.</p><h2>Kontrollera aktuella jakttider</h2><p>Tabellerna återger den tidigare sidans sammanställning av jaktförordningens bilaga 1. Datumhjälpen jämför enbart dagens datum med dessa tabeller och är inget besked om tillåten jakt.</p><p><a href="https://www.naturvardsverket.se/amnesomraden/jakt-och-vilt/jakttider/" target="_blank" rel="noopener noreferrer">Naturvårdsverket – jakttider ↗</a><br><a href="https://www.lansstyrelsen.se/vastra-gotaland/djur/jakt-och-vilt.html" target="_blank" rel="noopener noreferrer">Länsstyrelsen Västra Götaland – jakt och vilt ↗</a></p><h2>Om den här versionen</h2><p>Version ${VERSION} · 13 oktober 2026. Anpassad för mobil, surfplatta och dator. Sidan har ingen inloggning eller egen spårning. Dina bokmärken och inställningar lagras lokalt i webbläsaren.</p></div>`;
  }
  function render(){
    main.dataset.page=state.page;
    renderNav();$('#clearSearch').hidden=!state.q;$('.search-hint').hidden=Boolean(state.q);
    document.title=(state.q?'Sök':docs[state.page]?.title||({home:'Din guide till jakten',saved:'Dina sparade',more:'Mer i guiden',install:'Ta med guiden',about:'Om guiden'})[state.page])+' · Gustavsfors VVO';
    if(state.q.trim()||docs[state.page]||state.page==='saved')renderCollection();
    else ({home:renderHome,more:renderMore,install:renderInstall,about:renderAbout}[state.page]||renderHome)();
  }
  function route(focus=false){
    const [requested,id] = location.hash.slice(1).split('/');
    const allowed=['home','saved','more','install','about',...Object.keys(docs).filter(x=>x!=='pm'||hasPM())];
    state.page=allowed.includes(requested)?requested:'home';state.q='';$('#q').value='';state.open.clear();
    const target=activeItems().find(i=>i.id===id&&i.doc===state.page);
    if(target)state.open.add(target.id);
    else if(['pm','protokoll','aso','jakttider'].includes(state.page)){const first=activeItems().find(i=>i.doc===state.page);if(first)state.open.add(first.id);}
    render();
    if(focus)main.focus({preventScroll:true});
    if(target)requestAnimationFrame(()=>document.getElementById(target.id)?.scrollIntoView({block:'start'}));
    else window.scrollTo({top:0,behavior:'instant'});
  }
  function applyTheme(theme,persist=true){
    document.documentElement.dataset.theme=theme;
    $('#metaTheme').content=theme==='dark'?'#121e19':'#183f35';
    $('#themeBtn').setAttribute('aria-label',theme==='dark'?'Byt till ljust läge':'Byt till mörkt läge');
    $('#themeBtn').innerHTML=icon(theme==='dark'?'sun':'moon');
    if(persist)storage.set('gvvo-theme',theme);
    $('#darkSwitch')?.setAttribute('aria-checked',String(theme==='dark'));
  }
  const toggleTheme=()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  $('#themeBtn').addEventListener('click',toggleTheme);
  applyTheme(document.documentElement.dataset.theme||'light',false);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',e=>{if(!storage.get('gvvo-theme',null))applyTheme(e.matches?'dark':'light',false);});
  $('#q').addEventListener('input',e=>{state.q=e.target.value;render();});
  $('#q').addEventListener('keydown',e=>{if(e.key==='Enter')e.target.blur();if(e.key==='Escape'){$('#clearSearch').click();}});
  $('#clearSearch').addEventListener('click',()=>{state.q='';$('#q').value='';render();$('#q').focus();});
  document.addEventListener('click',e=>{
    const link=e.target.closest('a[href^="#"]');
    if(link&&link.getAttribute('href')===location.hash){e.preventDefault();route(true);}
  });
  main.addEventListener('click',async e=>{
    const save=e.target.closest('[data-save]');
    if(save){const id=save.dataset.save;const wasSaved=saved.has(id);wasSaved?saved.delete(id):saved.add(id);const persisted=storage.set('gvvo-saved',JSON.stringify([...saved]));save.setAttribute('aria-pressed',String(!wasSaved));const it=items.find(i=>i.id===id);save.setAttribute('aria-label',`${wasSaved?'Spara avsnitt':'Ta bort sparat avsnitt'}: ${it.title}`);save.title=wasSaved?'Spara avsnitt':'Ta bort från sparat';renderNav();toast(persisted?(wasSaved?'Avsnittet har tagits bort från Sparat.':'Sparat på den här enheten.'):'Sparat för besöket. Webbläsaren tillåter inte lagring.');if(state.page==='saved'&&!state.q){const next=save.closest('.card').nextElementSibling?.dataset.id;renderCollection();(next?document.querySelector(`[data-save="${next}"]`):$('#main')).focus({preventScroll:true});}return;}
    const head=e.target.closest('.card-head');
    if(head){const card=head.closest('.card'),open=head.getAttribute('aria-expanded')!=='true';head.setAttribute('aria-expanded',String(open));card.classList.toggle('open',open);card.querySelector('.card-body').hidden=!open;open?state.open.add(card.dataset.id):state.open.delete(card.dataset.id);syncToggle();return;}
    if(e.target.closest('#toggleAll')){const open=[...main.querySelectorAll('.card-head')].some(h=>h.getAttribute('aria-expanded')!=='true');main.querySelectorAll('.card').forEach(card=>{card.classList.toggle('open',open);card.querySelector('.card-head').setAttribute('aria-expanded',String(open));card.querySelector('.card-body').hidden=!open;open?state.open.add(card.dataset.id):state.open.delete(card.dataset.id);});syncToggle();}
    if(e.target.closest('#darkSwitch'))toggleTheme();
    if(e.target.closest('#textSwitch')){const large=document.documentElement.dataset.large!=='true';document.documentElement.dataset.large=String(large);storage.set('gvvo-large',String(large));$('#textSwitch').setAttribute('aria-checked',String(large));}
    if(e.target.closest('#refreshBtn'))await checkUpdate();
    if(e.target.closest('#installBtn')&&installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installBtn').hidden=true;}
  });
  function syncToggle(){const button=$('#toggleAll');if(button)button.textContent=[...main.querySelectorAll('.card-head')].every(h=>h.getAttribute('aria-expanded')==='true')?'Fäll ihop alla':'Visa alla avsnitt';}
  window.addEventListener('hashchange',()=>route(true));
  let installPrompt=null,registration=null,offlineReady=false;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if($('#installBtn'))$('#installBtn').hidden=false;});
  window.addEventListener('appinstalled',()=>{installPrompt=null;if($('#installBtn'))$('#installBtn').hidden=true;toast('Guiden har lagts till.');});
  function updateConnection(){
    const online=navigator.onLine;
    $('#offlineNotice').hidden=online;
    $('#connection').innerHTML='<span></span>'+(!online?'Offline · sparad version':offlineReady?'Tillgänglig offline':'Din jaktguide');
    $('#connection').title=!online?'Du läser den senast hämtade versionen.':offlineReady?'Guidens filer har sparats på den här enheten.':'Anslut till internet för att spara guiden.';
    if($('#offlineHelp'))$('#offlineHelp').textContent=offlineReady?'Guiden är sparad på den här enheten och kan läsas utan täckning.':'Öppna sidan med internetanslutning och vänta tills guiden har sparats. Webbläsaren behöver tillåta lokal lagring.';
  }
  async function checkOffline(){try {if((await caches.keys()).includes('gvvo-v'+VERSION)){const cache=await caches.open('gvvo-v'+VERSION);offlineReady=(await Promise.all(['./index.html',`./styles.css?v=${VERSION}`,`./data.js?v=${VERSION}`,`./app.js?v=${VERSION}`].map(url=>cache.match(url)))).every(Boolean);}}catch{}updateConnection();}
  ['online','offline'].forEach(ev=>window.addEventListener(ev,()=>{updateConnection();toast(navigator.onLine?'Du är ansluten igen.':'Du är offline. Senast hämtade innehåll visas.');}));
  function watchWorker(reg){
    if(reg.waiting)$('#updateBanner').hidden=false;
    reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'){checkOffline();if(navigator.serviceWorker.controller)$('#updateBanner').hidden=false;}});});
  }
  async function checkUpdate(){
    const button=$('#refreshBtn');if(!navigator.onLine){toast('Anslut till internet för att hämta uppdateringar.');return;}
    if(button){button.disabled=true;button.textContent='Kontrollerar…';}
    try{if(registration){await registration.update();if(registration.waiting){$('#updateBanner').hidden=false;toast('En ny version är redo.');}else if(registration.installing){toast('En ny version hämtas.');}else toast('Du har den senaste versionen.');}else location.reload();}catch{toast('Kunde inte kontrollera uppdateringar. Försök igen.');}
    finally{if(button){button.disabled=false;button.textContent='Uppdatera';}}
  }
  $('#updateBtn').addEventListener('click',()=>registration?.waiting?.postMessage({type:'SKIP_WAITING'}));
  let reloading=false;
  if('serviceWorker' in navigator){
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload();});
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{registration=reg;watchWorker(reg);checkOffline();}).catch(()=>updateConnection());
  }
  route();updateConnection();
  // Return to current content when a tab kept open overnight is used again.
  let lastDate=todayKey();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&todayKey()!==lastDate){lastDate=todayKey();route();}});
})();
