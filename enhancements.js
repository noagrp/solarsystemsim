(()=>{
  const style=document.createElement('style');
  style.textContent=`
    :root{--sim-scale:1}
    body{height:100dvh}
    .orbit-track{transform:translate(-50%,-50%) scale(var(--sim-scale));transform-origin:center center}
    .sun{transform:scale(var(--sim-scale));transform-origin:center center}
    .sun:hover{transform:scale(calc(var(--sim-scale) * 1.1))}
    .sim-tools{position:fixed;left:max(12px,env(safe-area-inset-left));top:max(12px,env(safe-area-inset-top));z-index:40;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .sim-tools button{border:1px solid rgba(255,255,255,.12);background:rgba(7,7,22,.72);color:#e2e8f0;border-radius:999px;padding:8px 11px;font:600 12px system-ui;backdrop-filter:blur(12px);cursor:pointer}
    .scale-note{position:fixed;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:30;color:#94a3b8;background:rgba(3,3,12,.58);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 10px;font:600 10px/1.2 system-ui;white-space:nowrap;backdrop-filter:blur(10px)}
    .detail-panel{overflow:hidden;padding-top:max(60px,env(safe-area-inset-top));padding-bottom:max(24px,env(safe-area-inset-bottom))}
    .panel-content-grid{min-height:0}
    .knowledge-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
    .knowledge-tabs button{width:auto;margin:0;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#94a3b8;border-radius:999px;padding:8px 12px;font:700 11px system-ui;cursor:pointer}
    .knowledge-tabs button.active{color:#fff;border-color:rgba(56,189,248,.55);background:rgba(56,189,248,.12)}
    .knowledge-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 28px;align-content:start}
    .knowledge-card{min-width:0}.knowledge-card .info-value{font-size:1.05rem;line-height:1.35}
    .learn-copy{line-height:1.75;color:#cbd5e1;font-size:1rem;max-width:900px}
    .learn-copy strong{color:#fff}
    @media(pointer:coarse){.planet-label{opacity:.78;color:rgba(255,255,255,.75)}.planet-click-box{min-width:34px;min-height:34px;justify-content:center}.sim-tools button{padding:9px 12px}}
    @media(max-width:768px){.detail-panel{padding-left:20px;padding-right:20px;gap:22px}.panel-header h2{padding-right:48px}.panel-content-grid{overflow-y:auto;padding-bottom:20px}.stats-block{grid-template-columns:1fr 1fr;gap:16px}.knowledge-grid{grid-template-columns:1fr 1fr}.scale-note{font-size:9px}.sim-tools{max-width:calc(100vw - 24px)}}
    @media(max-width:430px){.stats-block,.knowledge-grid{grid-template-columns:1fr}.knowledge-tabs{gap:6px}.knowledge-tabs button{padding:7px 10px}.scale-note{max-width:88vw;overflow:hidden;text-overflow:ellipsis}}
  `;
  document.head.appendChild(style);

  const addLink=(rel,href,attrs={})=>{let el=document.querySelector(`link[rel="${rel}"]`);if(!el){el=document.createElement('link');el.rel=rel;document.head.appendChild(el)}el.href=href;Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el};
  addLink('manifest','./manifest.webmanifest');
  addLink('icon','./favicon-32x32.png',{type:'image/png',sizes:'32x32'});
  addLink('apple-touch-icon','./apple-touch-icon.png');
  let theme=document.querySelector('meta[name="theme-color"]');if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.appendChild(theme)}theme.content='#03030c';
  let capable=document.querySelector('meta[name="apple-mobile-web-app-capable"]');if(!capable){capable=document.createElement('meta');capable.name='apple-mobile-web-app-capable';document.head.appendChild(capable)}capable.content='yes';

  function fitSystem(){
    const pad=34, w=Math.max(280,window.innerWidth-pad), h=Math.max(280,window.innerHeight-pad);
    const scale=Math.min(1,w/710,h/710);
    document.documentElement.style.setProperty('--sim-scale',String(Math.max(.36,scale)));
  }
  fitSystem();window.addEventListener('resize',fitSystem);window.addEventListener('orientationchange',()=>setTimeout(fitSystem,120));

  const knowledge={
    sun:{diameter:'1.39 million km',mass:'1.989 × 10³⁰ kg',gravity:'274 m/s²',distance:'0 AU',orbitSpeed:'~220 km/s around Milky Way',tilt:'7.25° to ecliptic',atmosphere:'~73% hydrogen, ~25% helium by mass',surface:'Photosphere ~5,500°C; core ~15 million°C',rings:'No',missions:'SOHO, SDO, Parker Solar Probe, Solar Orbiter',why:'The Sun contains about 99.8% of the Solar System’s mass and powers almost every surface ecosystem on Earth.',explore:'Its magnetic activity drives sunspots, flares and coronal mass ejections that can affect satellites, radio, navigation and power grids.'},
    mercury:{diameter:'4,879 km',mass:'3.30 × 10²³ kg',gravity:'3.7 m/s²',distance:'0.39 AU',orbitSpeed:'47.4 km/s',tilt:'0.034°',atmosphere:'Extremely thin exosphere: oxygen, sodium, hydrogen, helium, potassium',surface:'Heavily cratered rocky surface; huge day/night temperature swings',rings:'No',missions:'Mariner 10, MESSENGER, BepiColombo',why:'Mercury is the fastest planet around the Sun and preserves clues about how rocky planets formed close to a star.',explore:'Water ice exists in permanently shadowed polar craters even though daytime equatorial temperatures can exceed 400°C.'},
    venus:{diameter:'12,104 km',mass:'4.87 × 10²⁴ kg',gravity:'8.9 m/s²',distance:'0.72 AU',orbitSpeed:'35.0 km/s',tilt:'177.4° (retrograde)',atmosphere:'~96.5% carbon dioxide, ~3.5% nitrogen; sulfuric-acid clouds',surface:'Volcanic plains and highlands beneath a dense atmosphere',rings:'No',missions:'Venera, Magellan, Akatsuki; DAVINCI and VERITAS planned',why:'Venus is Earth-sized but became radically different, making it crucial for understanding climate evolution and habitability.',explore:'Its surface pressure is about 92 times Earth’s and the greenhouse effect keeps the surface near 465°C.'},
    earth:{diameter:'12,756 km',mass:'5.97 × 10²⁴ kg',gravity:'9.8 m/s²',distance:'1.00 AU',orbitSpeed:'29.8 km/s',tilt:'23.44°',atmosphere:'~78% nitrogen, ~21% oxygen, traces of argon, CO₂ and water vapor',surface:'~71% ocean; active plate tectonics and a water cycle',rings:'No',missions:'Thousands of Earth-observing spacecraft and satellites',why:'Earth is the only world currently known to support life and liquid surface oceans.',explore:'Its magnetic field and atmosphere help shield the surface from harmful solar and cosmic radiation.'},
    mars:{diameter:'6,792 km',mass:'6.42 × 10²³ kg',gravity:'3.7 m/s²',distance:'1.52 AU',orbitSpeed:'24.1 km/s',tilt:'25.19°',atmosphere:'~95% carbon dioxide with nitrogen and argon',surface:'Basaltic deserts, giant volcanoes, canyons, polar ice caps',rings:'No',missions:'Viking, Curiosity, Perseverance, MAVEN, Mars Express, MRO',why:'Mars records evidence of ancient rivers, lakes and habitable environments, making it a major target in the search for past life.',explore:'Olympus Mons is the largest known volcano in the Solar System, and Valles Marineris is one of its largest canyon systems.'},
    jupiter:{diameter:'142,984 km',mass:'1.898 × 10²⁷ kg',gravity:'23.1 m/s²',distance:'5.20 AU',orbitSpeed:'13.1 km/s',tilt:'3.13°',atmosphere:'Mostly hydrogen and helium with ammonia, methane and water compounds',surface:'No solid surface; deep atmosphere transitions into high-pressure fluid layers',rings:'Yes, faint dusty rings',missions:'Pioneer, Voyager, Galileo, Juno; Europa Clipper exploring its system',why:'Jupiter is the largest planet and strongly shaped the architecture of the early Solar System through its gravity.',explore:'Its Great Red Spot is a long-lived giant storm, while moons such as Europa and Ganymede are prime targets for ocean-world science.'},
    saturn:{diameter:'120,536 km',mass:'5.68 × 10²⁶ kg',gravity:'9.0 m/s²',distance:'9.58 AU',orbitSpeed:'9.7 km/s',tilt:'26.73°',atmosphere:'Mostly hydrogen and helium, with traces of methane and ammonia',surface:'No solid surface; gas and fluid layers deepen toward the interior',rings:'Yes, vast icy ring system',missions:'Pioneer 11, Voyager 1/2, Cassini-Huygens',why:'Saturn’s rings are a natural laboratory for disk physics—the same processes involved in forming planets and moons.',explore:'Titan has a dense nitrogen atmosphere and methane lakes; Enceladus sprays an ocean-derived plume into space.'},
    uranus:{diameter:'51,118 km',mass:'8.68 × 10²⁵ kg',gravity:'8.7 m/s²',distance:'19.22 AU',orbitSpeed:'6.8 km/s',tilt:'97.77°',atmosphere:'Hydrogen, helium and methane',surface:'No solid surface; icy-fluid mantle above a rocky core',rings:'Yes, dark narrow rings',missions:'Voyager 2 is the only spacecraft to have visited',why:'Uranus is an ice giant with an extreme sideways tilt, offering a very different model of planetary formation and seasonal behavior.',explore:'Its unusual magnetic field is strongly tilted and offset from the planet’s center.'},
    neptune:{diameter:'49,528 km',mass:'1.02 × 10²⁶ kg',gravity:'11.0 m/s²',distance:'30.05 AU',orbitSpeed:'5.4 km/s',tilt:'28.32°',atmosphere:'Hydrogen, helium and methane',surface:'No solid surface; deep icy-fluid interior',rings:'Yes, faint rings and ring arcs',missions:'Voyager 2 is the only spacecraft to have visited',why:'Neptune is the most distant major planet and helps scientists understand ice giants, a common class of exoplanet.',explore:'Despite receiving little solar energy, Neptune has the fastest planetary winds measured in the Solar System.'},
    pluto:{diameter:'2,376 km',mass:'1.30 × 10²² kg',gravity:'0.7 m/s²',distance:'~39.5 AU average',orbitSpeed:'4.7 km/s',tilt:'122.5°',atmosphere:'Thin nitrogen atmosphere with methane and carbon monoxide',surface:'Nitrogen, methane and carbon-monoxide ices over water-ice crust',rings:'No known rings',missions:'New Horizons flyby, 2015',why:'Pluto is a complex Kuiper Belt world and helped redefine how scientists classify planets and dwarf planets.',explore:'Sputnik Planitia is a vast nitrogen-ice basin with active-looking convection cells and possible cryovolcanic terrain nearby.'}
  };
  const moonCounts={mercury:'0',venus:'0',earth:'1',mars:'2',jupiter:'115 known',saturn:'293 known',uranus:'29 known',neptune:'16 known',pluto:'5'};
  Object.entries(moonCounts).forEach(([k,v])=>{if(spaceData[k])spaceData[k].moons=v});

  const panel=document.getElementById('detailPanel');
  const content=panel.querySelector('.panel-content-grid');
  const originalStats=content.querySelector('.stats-block');
  const originalDesc=content.querySelector('.info-section:last-child');
  const tabs=document.createElement('div');tabs.className='knowledge-tabs';tabs.innerHTML='<button data-tab="overview" class="active">Overview</button><button data-tab="physical">Physical</button><button data-tab="orbit">Orbit</button><button data-tab="explore">Explore</button>';
  panel.querySelector('.panel-header').appendChild(tabs);
  const extra=document.createElement('div');extra.className='knowledge-grid';extra.style.display='none';content.appendChild(extra);
  let currentKey='earth';
  function card(label,value){return `<div class="knowledge-card"><div class="info-label">${label}</div><div class="info-value">${value||'—'}</div></div>`}
  function renderTab(tab){
    tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    if(tab==='overview'){originalStats.style.display='grid';originalDesc.style.display='block';extra.style.display='none';return}
    originalStats.style.display='none';originalDesc.style.display='none';extra.style.display='grid';const d=knowledge[currentKey]||{};
    if(tab==='physical')extra.innerHTML=card('Diameter',d.diameter)+card('Mass',d.mass)+card('Gravity',d.gravity)+card('Atmosphere / Composition',d.atmosphere)+card('Surface / Structure',d.surface)+card('Ring System',d.rings);
    else if(tab==='orbit')extra.innerHTML=card('Distance from Sun',d.distance)+card('Orbital Speed',d.orbitSpeed)+card('Axial Tilt',d.tilt)+card('Rotation',spaceData[currentKey]?.self)+card('Orbital Period',spaceData[currentKey]?.full)+card('Moons',spaceData[currentKey]?.moons);
    else extra.innerHTML=`<div class="learn-copy" style="grid-column:1/-1"><strong>Why it matters</strong><br>${d.why||''}<br><br><strong>Exploration & discovery</strong><br>${d.explore||''}<br><br><strong>Notable missions</strong><br>${d.missions||'—'}</div>`;
  }
  tabs.addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(b)renderTab(b.dataset.tab)});
  const baseShow=showDetails;
  showDetails=function(key){currentKey=key;baseShow(key);renderTab('overview')};

  document.querySelectorAll('.planet-click-box').forEach(box=>{box.tabIndex=0;box.setAttribute('role','button');const label=box.querySelector('.planet-label')?.textContent||'planet';box.setAttribute('aria-label',`Open ${label} details`);box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();box.click()}})});
  const sun=document.querySelector('.sun');sun.tabIndex=0;sun.setAttribute('role','button');sun.setAttribute('aria-label','Open Sun details');sun.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sun.click()}});

  const tools=document.createElement('div');tools.className='sim-tools';tools.innerHTML='<button id="simPause">Pause</button><button id="simSpeed">Speed 1×</button><button id="simLearn">Learn</button>';document.body.appendChild(tools);
  const note=document.createElement('div');note.className='scale-note';note.textContent='Relative visualization — sizes, distances and orbital speeds are not to scale';document.body.appendChild(note);
  let paused=false,speedIndex=1;const speeds=[.5,1,2,4];
  document.getElementById('simPause').onclick=()=>{paused=!paused;document.querySelectorAll('.orbit-wrapper').forEach(x=>x.style.animationPlayState=paused?'paused':'running');document.getElementById('simPause').textContent=paused?'Play':'Pause'};
  document.getElementById('simSpeed').onclick=()=>{speedIndex=(speedIndex+1)%speeds.length;const mult=speeds[speedIndex];document.querySelectorAll('.orbit-wrapper').forEach(x=>x.style.animationDuration=`calc(${getComputedStyle(x).animationDuration} / ${mult})`);document.getElementById('simSpeed').textContent=`Speed ${mult}×`};
  document.getElementById('simLearn').onclick=()=>{showDetails('earth');document.getElementById('pName').textContent='Solar System Guide';document.getElementById('pType').textContent='How to read this simulation';originalStats.style.display='none';originalDesc.style.display='none';extra.style.display='grid';tabs.querySelectorAll('button').forEach(b=>b.classList.remove('active'));extra.innerHTML='<div class="learn-copy" style="grid-column:1/-1"><strong>1 AU</strong> is the average Earth–Sun distance, about 149.6 million km.<br><br><strong>Rocky planets</strong> — Mercury, Venus, Earth and Mars — are small, dense worlds with solid surfaces. <strong>Gas giants</strong> Jupiter and Saturn are dominated by hydrogen and helium. <strong>Ice giants</strong> Uranus and Neptune contain more water-, ammonia- and methane-rich material in their interiors.<br><br><strong>Axial tilt</strong> helps create seasons. <strong>Orbital period</strong> is a world’s year. <strong>Rotation period</strong> is how long it takes to spin once.<br><br><strong>Pluto</strong> is a dwarf planet: it orbits the Sun and is round, but it has not cleared other objects from its orbital neighborhood.<br><br>This animation keeps the original artistic spacing and relative motion for readability. It is not a true scale model.</div>'};

  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();