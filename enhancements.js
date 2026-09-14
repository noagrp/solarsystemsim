(()=>{
  const style=document.createElement('style');
  style.textContent=`
    :root{--sim-scale:1}
    body{height:100dvh}
    .orbit-track{transform:translate(-50%,-50%) scale(var(--sim-scale));transform-origin:center center}
    .sun{transform:scale(var(--sim-scale));transform-origin:center center}.sun:hover{transform:scale(calc(var(--sim-scale)*1.1))}
    .sim-tools{position:fixed;left:max(12px,env(safe-area-inset-left));top:max(12px,env(safe-area-inset-top));z-index:40;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .sim-tools button{border:1px solid rgba(255,255,255,.12);background:rgba(7,7,22,.72);color:#e2e8f0;border-radius:999px;padding:8px 11px;font:600 12px system-ui;backdrop-filter:blur(12px);cursor:pointer}
    .scale-note{position:fixed;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:30;color:#94a3b8;background:rgba(3,3,12,.58);border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 10px;font:600 10px/1.2 system-ui;white-space:nowrap;backdrop-filter:blur(10px)}
    .detail-panel{overflow:hidden;padding-top:max(60px,env(safe-area-inset-top));padding-bottom:max(24px,env(safe-area-inset-bottom))}.panel-content-grid{min-height:0}
    .knowledge-tabs{display:flex;gap:7px;flex-wrap:wrap;margin-top:4px}.knowledge-tabs button{width:auto;margin:0;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#94a3b8;border-radius:999px;padding:8px 11px;font:700 11px system-ui;cursor:pointer}.knowledge-tabs button.active{color:#fff;border-color:rgba(56,189,248,.55);background:rgba(56,189,248,.12)}
    .knowledge-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 28px;align-content:start}.knowledge-card{min-width:0}.knowledge-card .info-value{font-size:1.02rem;line-height:1.45}.learn-copy{line-height:1.75;color:#cbd5e1;font-size:1rem;max-width:950px}.learn-copy strong{color:#fff}.fact-list{margin:0;padding-left:20px;line-height:1.7;color:#cbd5e1}.fact-list li+li{margin-top:9px}
    @media(pointer:coarse){.planet-label{opacity:.78;color:rgba(255,255,255,.75)}.planet-click-box{min-width:34px;min-height:34px;justify-content:center}.sim-tools button{padding:9px 12px}}
    @media(max-width:768px){.detail-panel{padding-left:20px;padding-right:20px;gap:20px}.panel-header h2{padding-right:48px}.panel-content-grid{overflow-y:auto;padding-bottom:20px}.knowledge-grid{grid-template-columns:1fr 1fr}.scale-note{font-size:9px}.sim-tools{max-width:calc(100vw - 24px)}}
    @media(max-width:430px){.knowledge-grid{grid-template-columns:1fr}.knowledge-tabs{gap:5px}.knowledge-tabs button{padding:7px 9px;font-size:10px}.scale-note{max-width:88vw;overflow:hidden;text-overflow:ellipsis}}
  `;document.head.appendChild(style);

  const addLink=(rel,href,attrs={})=>{let el=document.querySelector(`link[rel="${rel}"]`);if(!el){el=document.createElement('link');el.rel=rel;document.head.appendChild(el)}el.href=href;Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el};
  addLink('manifest','./manifest.webmanifest');addLink('icon','./favicon-32x32.png',{type:'image/png',sizes:'32x32'});addLink('apple-touch-icon','./apple-touch-icon.png');
  let theme=document.querySelector('meta[name="theme-color"]');if(!theme){theme=document.createElement('meta');theme.name='theme-color';document.head.appendChild(theme)}theme.content='#03030c';
  let capable=document.querySelector('meta[name="apple-mobile-web-app-capable"]');if(!capable){capable=document.createElement('meta');capable.name='apple-mobile-web-app-capable';document.head.appendChild(capable)}capable.content='yes';
  function fitSystem(){const pad=34,w=Math.max(280,innerWidth-pad),h=Math.max(280,innerHeight-pad),scale=Math.min(1,w/710,h/710);document.documentElement.style.setProperty('--sim-scale',String(Math.max(.36,scale)))}fitSystem();addEventListener('resize',fitSystem);addEventListener('orientationchange',()=>setTimeout(fitSystem,120));

  const K={
    sun:{
      basic:{Age:'~4.6 billion years',Class:'G2V yellow dwarf star',Role:'The only star in our Solar System',EarthDistance:'~149.6 million km / 1 AU'},
      structure:{Diameter:'~1.39 million km',Mass:'1.989 × 10³⁰ kg',MassShare:'~99.8% of Solar System mass',Layers:'Core → radiative zone → convection zone → photosphere → chromosphere → corona',Core:'~15 million°C; hydrogen fusion produces helium',Photosphere:'~5,500°C visible surface'},
      orbit:{Rotation:'~25 days at equator; ~36 days near poles',Tilt:'7.25° to planetary orbital plane',GalaxyLocation:'Orion Spur of the Milky Way',GalacticSpeed:'~720,000 km/h',GalacticYear:'~230 million Earth years'},
      environment:{Corona:'Up to ~2 million°C despite being above the cooler photosphere',SolarWind:'Continuous stream of charged particles forms the heliosphere',Magnetism:'11-year activity cycle with sunspots, flares and magnetic reversals',SpaceWeather:'Flares and CMEs can disrupt satellites, radio, navigation and power grids'},
      family:{Planets:'8 planets orbit the Sun',SmallBodies:'Asteroids, comets, dwarf planets and dust also orbit it',Heliosphere:'Solar-wind bubble extends far beyond the planets',LightTime:'Sunlight reaches Earth in ~8 min 20 sec'},
      exploration:{Missions:'Parker Solar Probe, Solar Orbiter, SOHO, SDO',Parker:'First spacecraft to fly through the solar corona',Study:'Heliophysics investigates the Sun and its influence throughout the Solar System'},
      facts:['Energy made in the core may take tens of thousands of years to work outward before escaping as light.','The corona is mysteriously much hotter than the visible surface.','Differential rotation occurs because the Sun is plasma, not a solid body.','The Sun will eventually expand into a red giant and later become a white dwarf.','Roughly one million Earths could fit inside the Sun by volume.']
    },
    mercury:{
      basic:{Order:'1st planet from the Sun',Class:'Terrestrial / rocky planet',Size:'Smallest planet',Namesake:'Roman messenger god Mercury'},
      structure:{Diameter:'4,879 km',Mass:'3.30 × 10²³ kg',Gravity:'3.7 m/s²',Interior:'Very large metallic core with rocky mantle and crust',Density:'Second-highest planetary density after Earth'},
      orbit:{Distance:'0.39 AU average',Year:'88 Earth days',SiderealRotation:'58.6 Earth days',SolarDay:'176 Earth days sunrise-to-sunrise',OrbitalSpeed:'~47.4 km/s — fastest planet',Tilt:'~0.03°'},
      environment:{Exosphere:'Very thin; oxygen, sodium, hydrogen, helium and potassium',Temperature:'~−180°C at night to ~430°C by day',Surface:'Ancient, heavily cratered terrain and giant impact basins',MagneticField:'Weak but global',PolarIce:'Water ice survives in permanently shadowed polar craters'},
      family:{Moons:'0',Rings:'None'},
      exploration:{Missions:'Mariner 10; MESSENGER; BepiColombo',MESSENGER:'First spacecraft to orbit Mercury',BepiColombo:'ESA/JAXA mission designed for detailed study of Mercury'},
      facts:['Mercury is not the hottest planet; Venus is hotter because of its dense greenhouse atmosphere.','The Sun appears more than three times larger from Mercury than from Earth.','A 3:2 spin-orbit resonance means Mercury rotates three times for every two solar orbits.','Its huge iron-rich core occupies much of the planet’s radius.','Despite intense sunlight, permanently dark craters can remain cold enough for ice.']
    },
    venus:{
      basic:{Order:'2nd planet from the Sun',Class:'Terrestrial / rocky planet',Size:'Nearly Earth-sized',Namesake:'Roman goddess of love and beauty'},
      structure:{Diameter:'12,104 km',Mass:'4.87 × 10²⁴ kg',Gravity:'8.9 m/s²',Interior:'Likely iron core, rocky mantle and crust',Surface:'Volcanic plains, mountains and deformed highlands'},
      orbit:{Distance:'0.72 AU average',Year:'224.7 Earth days',Rotation:'243 Earth days, retrograde',SolarDay:'~117 Earth days',OrbitalSpeed:'~35.0 km/s',Tilt:'177.4°'},
      environment:{Atmosphere:'~96.5% CO₂, ~3.5% nitrogen',Pressure:'~92 times Earth sea-level pressure',Temperature:'~465°C average surface temperature',Clouds:'Sulfuric-acid cloud layers',Weather:'Super-rotating atmosphere circles planet much faster than surface'},
      family:{Moons:'0',Rings:'None'},
      exploration:{Missions:'Venera program, Magellan, Venus Express, Akatsuki',Landings:'Soviet Venera probes achieved the first successful landings on another planet',Future:'DAVINCI and VERITAS are designed to investigate atmosphere and geology'},
      facts:['Venus has the hottest planetary surface in the Solar System.','Its rotation is opposite to most planets.','A Venus day is longer than its year if using sidereal rotation.','Surface conditions are hot enough to melt lead.','Venus is a key natural laboratory for runaway greenhouse climate physics.']
    },
    earth:{
      basic:{Order:'3rd planet from the Sun',Class:'Terrestrial / rocky planet',KnownLife:'Only world currently known to host life',Namesake:'Germanic/Old English word meaning ground'},
      structure:{Diameter:'12,756 km',Mass:'5.97 × 10²⁴ kg',Gravity:'9.8 m/s²',Interior:'Iron-nickel core, mantle and rocky crust',Surface:'~71% ocean; continents and active plate tectonics'},
      orbit:{Distance:'1 AU average',Year:'365.25 days',Rotation:'23 h 56 min sidereal; ~24 h solar day',OrbitalSpeed:'~29.8 km/s',Tilt:'23.44°',LightTime:'Sunlight takes ~8.3 minutes'},
      environment:{Atmosphere:'~78% nitrogen, ~21% oxygen plus trace gases',Water:'Stable liquid oceans cover most of the surface',MagneticField:'Global field generated by liquid outer core',Climate:'Active water, carbon and rock cycles regulate long-term conditions'},
      family:{Moons:'1 — the Moon',Rings:'None',MoonRole:'Drives most ocean tides and helps stabilize Earth’s axial tilt'},
      exploration:{Observation:'Thousands of satellites monitor weather, climate, land, oceans and hazards',HumanSpaceflight:'Earth orbit supports long-duration crewed research and communications infrastructure'},
      facts:['Earth is the densest planet in the Solar System.','Plate tectonics continuously recycles crust and reshapes continents.','The oxygen-rich atmosphere is strongly influenced by life.','Earth’s magnetic field forms a magnetosphere that deflects much solar wind.','Liquid surface oceans are a defining feature not confirmed anywhere else.']
    },
    mars:{
      basic:{Order:'4th planet from the Sun',Class:'Terrestrial / rocky planet',Nickname:'The Red Planet',Namesake:'Roman god of war'},
      structure:{Diameter:'6,792 km',Mass:'6.42 × 10²³ kg',Gravity:'3.7 m/s²',Interior:'Iron-rich core, silicate mantle and basaltic crust',Surface:'Volcanoes, impact basins, dunes, canyons and polar caps'},
      orbit:{Distance:'1.52 AU average',Year:'687 Earth days',Rotation:'24 h 37 min',OrbitalSpeed:'~24.1 km/s',Tilt:'25.2°',Seasons:'Earth-like seasons, roughly twice as long'},
      environment:{Atmosphere:'~95% CO₂; very thin',Pressure:'Less than 1% of Earth sea-level pressure',Temperature:'Roughly −153°C to 20°C',Dust:'Planet-wide dust storms can occur',Water:'Large quantities of water ice; evidence of ancient rivers and lakes'},
      family:{Moons:'2 — Phobos and Deimos',Rings:'None today',Future:'Phobos is slowly spiraling inward and may eventually break apart'},
      exploration:{Missions:'Viking, Spirit, Opportunity, Curiosity, Perseverance, MAVEN, MRO, Mars Express',Samples:'Perseverance is caching selected rock and regolith samples',Helicopter:'Ingenuity demonstrated powered flight on another world'},
      facts:['Olympus Mons is the largest known volcano in the Solar System.','Valles Marineris is a canyon system thousands of kilometers long.','Ancient Mars was wetter and had environments that may once have been habitable.','Mars lacks a strong global magnetic field today.','Its reddish appearance comes largely from iron oxides in surface dust.']
    },
    jupiter:{
      basic:{Order:'5th planet from the Sun',Class:'Gas giant',Rank:'Largest planet',Namesake:'King of the Roman gods'},
      structure:{Diameter:'142,984 km',Mass:'1.898 × 10²⁷ kg',Gravity:'~24.8 m/s² near cloud tops',Composition:'Mostly hydrogen and helium',Interior:'Molecular hydrogen → metallic hydrogen → deep central region'},
      orbit:{Distance:'5.20 AU average',Year:'11.86 Earth years',Rotation:'~9 h 56 min',OrbitalSpeed:'~13.1 km/s',Tilt:'3.1°'},
      environment:{Surface:'No solid surface',Clouds:'Ammonia and other compounds form banded cloud decks',Storms:'Great Red Spot is a giant long-lived storm',MagneticField:'Strongest planetary magnetic field in Solar System',Radiation:'Intense radiation belts surround the planet'},
      family:{Moons:'115 known',Rings:'Faint dusty ring system',Galilean:'Io, Europa, Ganymede and Callisto',OceanWorlds:'Europa likely hides a global salty ocean beneath ice'},
      exploration:{Missions:'Pioneer, Voyager, Galileo, Juno',Juno:'Studies gravity, magnetic field, atmosphere and deep interior',EuropaClipper:'Designed to investigate Europa’s habitability and ocean-related geology'},
      facts:['Jupiter contains more than twice the mass of all other planets combined.','Ganymede is the largest moon in the Solar System and has its own magnetic field.','Io is the most volcanically active known world.','Metallic hydrogen deep inside helps generate Jupiter’s enormous magnetic field.','Jupiter’s gravity strongly influenced the early architecture of the Solar System.']
    },
    saturn:{
      basic:{Order:'6th planet from the Sun',Class:'Gas giant',Rank:'Second-largest planet',Namesake:'Roman god associated with agriculture and time'},
      structure:{Diameter:'120,536 km',Mass:'5.68 × 10²⁶ kg',Gravity:'~10.4 m/s² near cloud tops',Composition:'Mostly hydrogen and helium',Density:'Lowest average density of any planet'},
      orbit:{Distance:'9.58 AU average',Year:'29.45 Earth years',Rotation:'~10.7 hours',OrbitalSpeed:'~9.7 km/s',Tilt:'26.7°'},
      environment:{Surface:'No solid surface',Atmosphere:'Hydrogen-helium with trace compounds',NorthPole:'Persistent hexagon-shaped jet-stream pattern',Winds:'Powerful equatorial winds and storms'},
      family:{Moons:'293 known',Rings:'Extensive icy rings divided into many ringlets and gaps',Titan:'Dense nitrogen atmosphere; methane lakes and rain',Enceladus:'Subsurface ocean vents water-rich plumes into space'},
      exploration:{Missions:'Pioneer 11, Voyager 1/2, Cassini-Huygens',Cassini:'Orbited Saturn from 2004 to 2017',Huygens:'First landing in the outer Solar System, on Titan in 2005'},
      facts:['Saturn’s average density is lower than liquid water.','The main rings are mostly water ice with particles from grains to mountain-sized chunks.','Enceladus is one of the strongest places to investigate present-day habitability beyond Earth.','Titan has stable liquids on its surface, but they are hydrocarbons rather than water.','The rings are dynamically active, sculpted by resonances and small moons.']
    },
    uranus:{
      basic:{Order:'7th planet from the Sun',Class:'Ice giant',Color:'Blue-green from methane absorption',Discovery:'William Herschel, 1781'},
      structure:{Diameter:'51,118 km',Mass:'8.68 × 10²⁵ kg',Gravity:'~8.7 m/s²',Composition:'Hydrogen, helium, methane; water/ammonia/methane-rich interior',Interior:'Rocky core beneath a hot dense fluid mantle'},
      orbit:{Distance:'19.22 AU average',Year:'84 Earth years',Rotation:'~17.2 hours, retrograde',OrbitalSpeed:'~6.8 km/s',Tilt:'97.8° — rotates almost on its side'},
      environment:{Temperature:'Among the coldest planetary atmospheres',Atmosphere:'Hydrogen, helium and methane',Seasons:'Extreme seasons because of axial tilt',MagneticField:'Highly tilted and offset from center'},
      family:{Moons:'29 known',Rings:'Dark, narrow ring system',NotableMoons:'Titania, Oberon, Ariel, Umbriel and Miranda'},
      exploration:{Missions:'Voyager 2 is the only spacecraft to visit Uranus',Flyby:'Voyager 2 passed Uranus in January 1986',Priority:'A dedicated Uranus orbiter/probe is a major proposed planetary-science goal'},
      facts:['Uranus was the first planet discovered with a telescope.','Its extreme tilt may have resulted from a giant collision early in its history.','Each pole can experience decades of sunlight followed by decades of darkness.','Its magnetic poles are dramatically misaligned with its rotation axis.','The methane that colors Uranus is only a small fraction of its atmosphere.']
    },
    neptune:{
      basic:{Order:'8th planet from the Sun',Class:'Ice giant',Discovery:'Predicted mathematically; observed in 1846',Namesake:'Roman god of the sea'},
      structure:{Diameter:'49,528 km',Mass:'1.02 × 10²⁶ kg',Gravity:'~11.2 m/s²',Composition:'Hydrogen, helium, methane; water/ammonia/methane-rich interior',Interior:'Dense hot fluid mantle around a rocky core'},
      orbit:{Distance:'30.05 AU average',Year:'164.8 Earth years',Rotation:'~16.1 hours',OrbitalSpeed:'~5.4 km/s',Tilt:'28.3°'},
      environment:{Temperature:'Cloud-top temperatures around −200°C',Atmosphere:'Hydrogen, helium and methane',Winds:'Fastest known planetary winds, exceeding 2,000 km/h',Storms:'Large dark storms can appear and disappear',Heat:'Radiates substantially more energy than it receives from the Sun'},
      family:{Moons:'16 known',Rings:'Faint rings with unusual arcs',Triton:'Largest moon; retrograde orbit suggests it was captured',TritonActivity:'Voyager 2 observed active nitrogen geyser-like plumes'},
      exploration:{Missions:'Voyager 2 is the only spacecraft to visit Neptune',Flyby:'Voyager 2 passed Neptune in August 1989',Observation:'Hubble and large ground telescopes continue monitoring weather and moons'},
      facts:['Neptune was found after irregularities in Uranus’s orbit led mathematicians to predict another planet.','Triton probably formed elsewhere and was captured by Neptune.','Neptune completed its first full orbit since discovery in 2011.','Its vivid blue appearance is influenced by atmospheric methane and other absorbers.','Despite its great distance from the Sun, Neptune has extraordinarily energetic weather.']
    },
    pluto:{
      basic:{Order:'Kuiper Belt dwarf planet beyond Neptune',Class:'Dwarf planet',Discovery:'Clyde Tombaugh, 1930',Status:'Reclassified as a dwarf planet by the IAU in 2006'},
      structure:{Diameter:'2,376 km',Mass:'1.30 × 10²² kg',Gravity:'~0.62 m/s²',Surface:'Nitrogen, methane and carbon-monoxide ices over water-ice crust',Interior:'Likely rocky core with water-ice mantle'},
      orbit:{Distance:'~39.5 AU average',Year:'248 Earth years',Rotation:'~6.4 Earth days, retrograde',OrbitalSpeed:'~4.7 km/s',Tilt:'~122.5°',OrbitShape:'More eccentric and inclined than major planets'},
      environment:{Atmosphere:'Thin nitrogen with methane and carbon monoxide',Temperature:'Roughly −230°C range',Seasonality:'Atmosphere can expand or partially freeze as Pluto moves along its orbit',Geology:'Young icy plains, mountains and possible cryovolcanic terrain'},
      family:{Moons:'5 — Charon, Styx, Nix, Kerberos, Hydra',Rings:'No known rings',Charon:'So large relative to Pluto that the system’s barycenter lies outside Pluto'},
      exploration:{Mission:'New Horizons flyby, July 2015',Achievement:'First close-up exploration of Pluto and its moons',Legacy:'Revealed a far more geologically active and diverse world than expected'},
      facts:['Sputnik Planitia is a vast nitrogen-ice basin with convection-like cells.','Pluto and Charon are mutually tidally locked, always showing the same face to each other.','Pluto sometimes comes closer to the Sun than Neptune, though their orbital resonance prevents collision.','Its surface includes mountains made largely of water ice.','Pluto is one of five officially recognized dwarf planets in the Solar System.']
    }
  };

  const moonCounts={mercury:'0',venus:'0',earth:'1',mars:'2',jupiter:'115 known',saturn:'293 known',uranus:'29 known',neptune:'16 known',pluto:'5'};Object.entries(moonCounts).forEach(([k,v])=>{if(spaceData[k])spaceData[k].moons=v});
  const panel=document.getElementById('detailPanel'),content=panel.querySelector('.panel-content-grid'),originalStats=content.querySelector('.stats-block'),originalDesc=content.querySelector('.info-section:last-child');
  const tabs=document.createElement('div');tabs.className='knowledge-tabs';tabs.innerHTML='<button data-tab="basic" class="active">Basic</button><button data-tab="structure">Structure</button><button data-tab="orbit">Orbit & Motion</button><button data-tab="environment">Environment</button><button data-tab="family">Moons / Rings</button><button data-tab="exploration">Exploration</button><button data-tab="facts">Scientific Facts</button>';panel.querySelector('.panel-header').appendChild(tabs);
  const extra=document.createElement('div');extra.className='knowledge-grid';content.appendChild(extra);let currentKey='earth';
  function card(label,value){return `<div class="knowledge-card"><div class="info-label">${label}</div><div class="info-value">${value||'—'}</div></div>`}
  function cards(obj){return Object.entries(obj||{}).map(([k,v])=>card(k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()),v)).join('')}
  function renderTab(tab){tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));originalStats.style.display='none';originalDesc.style.display='none';extra.style.display='grid';const d=K[currentKey]||{};if(tab==='facts'){extra.innerHTML=`<div class="learn-copy" style="grid-column:1/-1"><ul class="fact-list">${(d.facts||[]).map(x=>`<li>${x}</li>`).join('')}</ul></div>`;return}extra.innerHTML=cards(d[tab])}
  tabs.addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(b)renderTab(b.dataset.tab)});
  const baseShow=showDetails;showDetails=function(key){currentKey=key;baseShow(key);renderTab('basic')};

  document.querySelectorAll('.planet-click-box').forEach(box=>{box.tabIndex=0;box.setAttribute('role','button');const label=box.querySelector('.planet-label')?.textContent||'planet';box.setAttribute('aria-label',`Open ${label} details`);box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();box.click()}})});const sun=document.querySelector('.sun');sun.tabIndex=0;sun.setAttribute('role','button');sun.setAttribute('aria-label','Open Sun details');sun.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sun.click()}});

  const tools=document.createElement('div');tools.className='sim-tools';tools.innerHTML='<button id="simPause">Pause</button><button id="simSpeed">Speed 1×</button>';document.body.appendChild(tools);const note=document.createElement('div');note.className='scale-note';note.textContent='Relative visualization — sizes, distances and orbital speeds are not to scale';document.body.appendChild(note);
  let paused=false,speedIndex=1;const speeds=[.5,1,2,4],baseDurations=new Map();document.querySelectorAll('.orbit-wrapper').forEach(x=>baseDurations.set(x,parseFloat(getComputedStyle(x).animationDuration)||1));document.getElementById('simPause').onclick=()=>{paused=!paused;document.querySelectorAll('.orbit-wrapper').forEach(x=>x.style.animationPlayState=paused?'paused':'running');document.getElementById('simPause').textContent=paused?'Play':'Pause'};document.getElementById('simSpeed').onclick=()=>{speedIndex=(speedIndex+1)%speeds.length;const mult=speeds[speedIndex];document.querySelectorAll('.orbit-wrapper').forEach(x=>x.style.animationDuration=(baseDurations.get(x)/mult)+'s');document.getElementById('simSpeed').textContent=`Speed ${mult}×`};
  if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();