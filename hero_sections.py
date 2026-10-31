"""Barq-branded ocean heroes and archived vessel choreography."""
from html import escape as e

CONFIG={
 'home':dict(label='Point 2 Point. Precision logistics.',title='Beyond borders.<br><span>Ahead of time.</span>',description='From your warehouse to the world. Freight that moves your business forward.',action='Move with Barq',href='/contact/',foot='Where speed meets reliability.',scene='kite'),
 'about':dict(label='The people behind your next move',title='Built on trust.<br><span>Always moving.</span>',description='A Pakistan-based team connecting manufacturers, exporters and importers through road, air and ocean freight.',action='Meet Barq',href='#page-content',foot='Pakistan at heart. The world in reach.',scene='partners'),
 'services':dict(label='Freight, without friction',title='Your cargo.<br><span>Every direction.</span>',description='From a single parcel to a full container. One connected range of solutions for your supply chain.',action='Explore our services',href='#page-content',foot='Ground. Air. Ocean.',scene='partners'),
 'contact':dict(label='Your next move starts here',title='Big plans.<br><span>Let’s move them.</span>',description='Tell us what you are moving, where it needs to go and when. We’ll help you connect every part of the journey.',action='Plan your shipment',href='#quote-form',foot='Lahore / Karachi / And beyond.',scene='partners'),
 'network':dict(label='Connected across continents',title='One network.<br><span>More possibilities.</span>',description='Local teams and international connections. Discover the Barq corporate family across China, Pakistan and the United States.',action='Explore our network',href='#network',foot='China / Pakistan / United States.',scene='partners'),
 '404':dict(label='404 / A small detour',title='Let’s get you<br><span>back on track.</span>',description='This page does not exist. Your next move is only a click away.',action='Return home',href='/',foot='Where speed meets reliability.',scene='kite')
}
PARTNERS=[('OOCL','oocl-Bj29iAUy.jpg'),('Maersk','Maersk-9V1WA-iP.jpg'),('CMA CGM','CMA%20CGM-CzJMH33N.jpg'),('COSCO','COSCO-BXmIUkOy.jpg'),('Hyundai','Hyundai-CZEYG0Hu.jpg'),('Hamburg Süd','Hamburg%20S%C3%BCd-BesacNS1.jpg')]

def partner_rail(source):
 logos=''.join(f'<li><img src="{source}/assets/{filename}" alt="" width="150" height="62" loading="eager" decoding="async"><span>{e(name)}</span></li>' for name,filename in PARTNERS)
 return f'<aside class="cinema-partners" aria-label="Our shipping partners"><p>Connected with the world’s carriers</p><ul>{logos}</ul></aside>'

def kinetic_hero(page,icon,pic,btn,source):
 c=CONFIG[page];target='#about' if page=='home' else '#page-content'
 water_ship='<img class="cinema-water-vessel" src="/assets/vessels/hero-vessel.png" alt="" width="200" height="713">' if c['scene']=='kite' else ''
 scene='<div class="cinema-scene" data-archive-scene="kite" data-scene-page="'+page+'" aria-hidden="true"><img class="scene-fallback" src="/assets/vessels/kite.png" alt="" width="1048" height="970"></div>' if c['scene']=='kite' else ''
 if page=='home':
  scene=scene.replace('</div>','<img class="cinema-mobile-vessel" src="/assets/vessels/hero-vessel.png" alt="" width="200" height="713" decoding="async"></div>')
 return f'''<div class="cinema-wrap"><section class="cinema-hero cinema-{page} {'cinema-inner' if c['scene']=='partners' else 'cinema-flight'}" data-cinema="{page}" aria-label="{e(c['label'])}">
 <div class="cinema-media" aria-hidden="true"><div class="cinema-ocean"><img class="cinema-poster" src="/assets/vessels/ocean-poster.jpeg" alt="" fetchpriority="high" width="1280" height="763"><video class="cinema-film" muted loop playsinline preload="metadata" poster="/assets/vessels/ocean-poster.jpeg" tabindex="-1"><source src="/assets/vessels/ocean.mp4" type="video/mp4"></video>{water_ship}</div></div>
{scene}
 <div class="cinema-shade" aria-hidden="true"></div>
 <div class="cinema-content"><div class="eyebrow">{c['label']}</div><h1>{c['title']}</h1><p>{c['description']}</p><div class="cinema-actions">{btn(c['action'],c['href'])}</div></div>
 {partner_rail(source)}
 <div class="cinema-bottom"><p>{c['foot']}</p><a class="cinema-scroll" href="{target}"><span>Scroll to<br><strong>explore the journey</strong></span>{icon('down')}</a><button class="cinema-toggle" type="button" aria-label="Pause background animation"><span aria-hidden="true">Ⅱ</span><span class="cinema-toggle-label">Pause motion</span></button></div>
 <div class="cinema-progress" aria-hidden="true"><span></span></div></section></div>'''+('<div id="page-content"></div>' if page!='home' else '')

def about_intro(icon,pic,btn,source,section_id='about'):
 facts=[('500+','Clients served'),('50+','Cities covered'),('10k+','Shipments delivered'),('24/7','Operations support')]
 numbers=''.join(f'<div class="intro-stat"><strong>{n}</strong><span>{label}</span></div>' for n,label in facts)
 return f'''<section class="intro-orbit" id="{section_id}" aria-label="The Barq way, from every angle"><div class="intro-orbit-stage"><div class="intro-orbit-copy"><div class="eyebrow">01 / The Barq way</div><h2>Big on ambition.<br>Precise on<br><span>every mile.</span></h2><p>Barq means lightning. For us, it means connecting your business to what comes next — with speed, care, and a clear path from origin to destination.</p>{btn('Get to know Barq','/about/','navy')}</div><div class="intro-orbit-scene" data-archive-scene="vessel" data-scene-page="story" tabindex="0" role="img" aria-label="A complete container vessel. Scroll to orbit, or use the left and right arrow keys to turn the view."><img class="scene-fallback" src="/assets/vessels/vessel-deck.png" alt="" width="581" height="1420" loading="lazy"></div><div class="intro-orbit-caption"><span>01 /</span><strong>Care in every detail.</strong></div><div class="intro-orbit-facts">{numbers}</div><div class="intro-orbit-progress" aria-hidden="true"><span></span></div></div></section>'''

def company_journey(icon,btn):
 steps=[('customs','Understand your shipment.','Share the cargo type, collection point, destination and timing. We shape the plan around what your business needs.'),('multi','Connect every mile.','Road, air and ocean transport work together with customs handling and warehousing through one coordinated team.'),('road','Keep the destination in view.','Our operations team coordinates delivery and keeps you informed as your cargo moves from origin to destination.')]
 cards=''.join(f'<article class="route-step" data-route-step><span class="route-step-number">0{i+1}</span><div class="route-step-copy"><span class="route-step-icon">{icon(kind)}</span><h3>{title}</h3><p>{copy}</p></div></article>' for i,(kind,title,copy) in enumerate(steps))
 return f'''<div class="about-route" aria-label="How Barq connects your shipment"><div class="route-intro"><div class="eyebrow">One connected team</div><h2>Every origin.<br><span>Every destination.</span></h2><p>A clear plan. Coordinated transport. People who keep the whole journey in view.</p><div class="route-status"><span data-route-index>01</span><small>/ 03 · Your cargo journey</small></div><div class="route-progress" aria-hidden="true"><span></span></div>{btn('Plan your shipment','/contact/')}</div><div class="route-steps">{cards}</div></div>'''
