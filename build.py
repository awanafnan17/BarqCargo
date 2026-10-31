"""Generate the original BarqCargo static website from its supplied business content."""
import json
from pathlib import Path
from html import escape as e
from urllib.parse import quote
from motion_sections import journey, service_catalog, testimonials
from hero_sections import kinetic_hero, about_intro, company_journey

ROOT = Path(__file__).parent
OUT = ROOT / 'dist'
DATA = json.loads((ROOT / 'content.json').read_text())
SOURCE = 'https://barqcargo.netlify.app'
def localize_assets(html):
 manifest=ROOT / 'asset-manifest.json'
 if manifest.exists():
  for asset in json.loads(manifest.read_text()):
   if (OUT / asset['local_path'].lstrip('/')).is_file():
    html=html.replace(asset['url'],asset['local_path'])
 return html

LOGO = '/assets/barq-logo-clean.png'
HUB = SOURCE + '/assets/logistics_hub-BVlk8NxV.jpg'
REEFER = SOURCE + '/assets/reefer_container-DEVPQ60D.jpg'
PATHS = {
 'arrow':'<path d="M5 19 19 5M5 5h14v14"/>',
 'down':'<path d="M12 4v16m-6-6 6 6 6-6"/>',
 'road':'<path d="M3 6h12v11H3zM15 10h4l3 4v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
 'air':'<path d="m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2"/>',
 'ocean':'<path d="M12 3v4M8 7h8v5M4 13l8-3 8 3-2 6H6l-2-6ZM2 21q2-2 4 0t4 0t4 0t4 0t4 0"/>',
 'customs':'<path d="M14 2H5v20h14V7l-5-5Zm0 0v5h5M8 12h8M8 16h5"/>',
 'project':'<path d="M4 21V5h3v16M4 5l13-3v3H4M16 5v8M14 13v3h4v-3M2 21h7M12 21h10M14 18h6v3"/>',
 'warehousing':'<path d="M3 21V8l9-5 9 5v13H3Zm5 0v-9h8v9M8 16h8M8 19h8"/>',
 'reefer':'<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4M20 14l-4 1 1 4M4 14l4 1-1 4M20 10l-4-1 1-4"/>',
 'multi':'<path d="M6 4h12v5H6zM4 17h5v5H4zM15 17h5v5h-5zM12 9v4M6.5 17v-4h11v4"/>',
 'close':'<path d="m6 6 12 12M6 18 18 6"/>'
}
def icon(name='arrow'):
 return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'+PATHS[name]+'</svg>'
def btn(text, href, style=''):
 return f'<a class="button {style}" href="{e(href)}"><span>{e(text)}</span>{icon()}</a>'
def textlink(text, href):
 return f'<a class="text-link" href="{e(href)}">{e(text)}{icon()}</a>'
def pic(src, alt, cls='', lazy=True):
 return f'<img src="{e(src)}" alt="{e(alt)}" class="{cls}" loading="{"lazy" if lazy else "eager"}" decoding="async">'
def heading_row(label, index):
 return f'<div class="kicker-row"><div class="eyebrow">{e(label)}</div><span class="section-index">{index}</span></div>'

def header(page):
 links=[('Home','/','home'),('About us','/about/','about'),('Services','/services/','services'),('Contact','/contact/','contact')]
 desktop=''.join(f'<a href="{href}"'+(' aria-current="page"' if page==key else '')+f'>{label}</a>' for label,href,key in links)
 mobile=desktop+'<a class="menu-contact" href="mailto:info@barqcargo.com">info@barqcargo.com</a>'
 return f'''<a class="skip-link" href="#main">Skip to content</a>
 <div class="reading-progress" aria-hidden="true"></div>
 <header class="site-header"><a class="brand" href="/" aria-label="Barq Cargo home">{pic(LOGO,'Barq Cargo',lazy=False)}<span class="brand-fallback" aria-hidden="true">BARQ<small>CARGO</small></span></a>
 <nav class="desktop-nav" aria-label="Main navigation">{desktop}</nav><div class="header-cta">{btn('Get a quote','/contact/')}</div>
 <button class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span></button></header>
 <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" hidden>{mobile}</nav>'''

def contact_banner():
 return ''

def page_loader(page):
 titles={'home': 'Beyond borders.<br>Ahead of time.', 'about': 'Built on trust.<br>Powered by speed.', 'services': 'Every cargo.<br>Every possibility.', 'contact': 'Your next move.<br>Starts here.', 'network': 'Local knowledge.<br>Global connections.', '404': 'Back on track.'}
 panels=''.join(f'<span style="--panel:{i}"></span>' for i in range(6))
 return f'''<div class="page-loader" aria-hidden="true"><div class="loader-panels">{panels}</div><div class="loader-content"><div class="loader-brand">{pic(LOGO,'',lazy=False)}</div><div class="loader-heading">{titles[page]}</div><div class="loader-bottom"><span class="loader-label">WHERE SPEED MEETS RELIABILITY</span><div class="loader-count"><span>00</span><small>%</small></div></div><div class="loader-rule"><span></span></div></div></div>'''

def footer():
 services=''.join(f'<a href="/services/#{s["id"]}">{e(s["label"])}</a>' for s in DATA['Xl'][:3])+'<a href="/services/#reefer">Reefer logistics</a>'
 return f'''<footer class="site-footer"><div class="footer-main"><div class="footer-brand-column"><a class="footer-brand" href="/">{pic(LOGO,'Barq Cargo')}</a><p class="footer-description">Where speed meets reliability.<br>Connecting businesses across borders with freight solutions from Pakistan to the world.</p></div>
 <div class="footer-column"><h3>Move with Barq</h3>{services}<a href="/services/">All services</a></div>
 <div class="footer-column"><h3>Explore</h3><a href="/about/">About us</a><a href="/network/">Our network</a><a href="/#faq">FAQs</a><a href="/contact/">Contact us</a></div>
 <div class="footer-column"><h3>Let's talk logistics</h3><a href="mailto:info@barqcargo.com">info@barqcargo.com</a><a href="tel:+9242111227700">+92 42 111 227 700</a><p>Lahore &amp; Karachi<br>Pakistan</p></div></div>
 <div class="footer-bottom"><span>© 2026 Barq Cargo. All rights reserved.</span><span>Where Speed Meets Reliability.</span><button class="motion-toggle" type="button" aria-pressed="false">Pause animations</button></div><a class="footer-marquee" href="/contact/" aria-label="Let’s move your business. Contact Barq Cargo."><div class="footer-marquee-track" aria-hidden="true"><span>Let’s move your business. {icon()} Pakistan. And beyond. {icon()}</span><span>Let’s move your business. {icon()} Pakistan. And beyond. {icon()}</span></div><span class="footer-cursor" aria-hidden="true">Let’s talk {icon()}</span></a></footer>'''

def network(in_journey=False):
 cards='';dialogs=''
 for i,c in enumerate(DATA['Lp']):
  cards+=f'''<article class="network-card" data-company-index="{i}" data-network-item><div class="network-image">{pic(SOURCE+c['image'],c['name'])}</div><div class="network-card-label"><span class="location">{e(c['location'])}</span><h3>{e(c['name'])}</h3><button class="text-link" data-dialog="company-{c['id']}" aria-haspopup="dialog">Explore company{icon()}</button></div></article>'''
  lis=''.join('<li>'+e(h)+'</li>' for h in c['highlights'])
  dialogs+=f'''<dialog class="company-dialog" id="company-{c['id']}" aria-labelledby="company-title-{c['id']}"><button class="dialog-close" aria-label="Close company details">{icon('close')}</button>{pic(SOURCE+c['image'],c['name'],'dialog-visual')}<div class="dialog-content"><div class="eyebrow">{e(c['location'])}</div><h2 id="company-title-{c['id']}">{e(c['name'])}</h2><p>{e(c['overview'])}</p><ul>{lis}</ul>{btn('Discuss your requirements','/contact/?service='+quote(c['name']))}</div></dialog>'''
 track=f'''<div class="network-track" id="company-grid" data-network-track><div class="network-title-slide"><div class="eyebrow">Connected across continents</div><h2 id="network-title">Local knowledge.<br><span>Global connections.</span></h2><p>The Barq corporate family connects sourcing, freight, and fulfilment across China, Pakistan, and the United States.</p><a class="text-link" href="/contact/">Connect with our team{icon()}</a></div>{cards}</div><nav class="network-controls" aria-label="Explore the corporate network"><span class="network-step-label">Our connections</span><button type="button" data-network-direction="-1" aria-label="Previous company">{icon('down')}</button><span class="network-count"><b>01</b> / 04</span><button type="button" data-network-direction="1" aria-label="Next company">{icon('down')}</button><div class="network-track-progress" aria-hidden="true"><span></span></div></nav>'''
 if in_journey:
  return track,dialogs
 return f'<section class="network-story" id="network" data-network-story aria-labelledby="network-title"><div class="network-stage">{track}</div></section>{dialogs}'

def faq():
 items=''.join(f'<details class="faq-item"><summary><span class="faq-item-number">0{i+1}</span><span>{e(q["q"])}</span><span class="plus" aria-hidden="true">+</span></summary><div class="faq-answer"><div>{e(q["a"])}</div></div></details>' for i,q in enumerate(DATA['sr']))
 return f'''<section class="section faq" id="faq"><div class="faq-intro"><div class="eyebrow">Good to know</div><h2>Your questions.<br>Clear answers.</h2><div class="faq-focus-index" aria-label="Selected question"><span>—</span><small>/ {len(DATA['sr']):02}</small></div><p>Have something more specific in mind?<br>Our team can help plan your shipment.</p>{textlink('Talk to Barq','/contact/')}</div><div class="faq-list">{items}</div></section>'''

def carriers():
 names=[('OOCL','oocl-Bj29iAUy.jpg'),('Maersk','Maersk-9V1WA-iP.jpg'),('CMA CGM','CMA%20CGM-CzJMH33N.jpg'),('COSCO','COSCO-BXmIUkOy.jpg'),('Hyundai','Hyundai-CZEYG0Hu.jpg'),('Hamburg Süd','Hamburg%20S%C3%BCd-BesacNS1.jpg')]
 def group(duplicate=False):
  logos=''.join(f'<div class="carrier-chip" style="--float-delay:-{i*.8}s">{pic(SOURCE+"/assets/"+p,"" if duplicate else n)}</div>' for i,(n,p) in enumerate(names))
  return f'<div class="carrier-group"'+(' aria-hidden="true"' if duplicate else '')+'>'+logos+'</div>'
 return f'<section class="carriers" aria-label="Carrier partners"><div class="carrier-intro"><div class="eyebrow">Stronger connections</div><h2>In good company.</h2><p>Connected with leading ocean carriers.</p></div><div class="carrier-window"><div class="carrier-track">{group()}{group(True)}</div></div></section>'

def service_deck():
 cards=''
 for i,s in enumerate(DATA['Xl']):
  cards+=f'''<article class="freight-card" data-card-index="{i}"><a class="freight-card-inner" href="/services/#{s['id']}" data-glow><div class="freight-card-image">{pic(SOURCE+s['image'],s['label'])}</div><span class="freight-number">0{i+1} / BARQ SOLUTIONS</span><div class="freight-card-content"><div class="freight-icon">{icon(s['id'])}</div><h3>{e(s['label'])}</h3><p>{e(s['shortDesc'])}</p><span class="freight-card-action">Explore service<span>{icon()}</span></span></div></a></article>'''
 return f'''<section class="services-vault" id="services" aria-label="Explore freight services"><div class="vault-stage"><div class="vault-heading"><div class="eyebrow">03 / Freight, without friction</div><h2>A world of possibilities.<br><span>One logistics partner.</span></h2></div><div class="freight-deck">{cards}</div><div class="vault-bottom"><span class="vault-hint">Scroll to explore <span aria-hidden="true">↕</span></span><div class="vault-controls"><button type="button" class="vault-prev" aria-label="Previous service">{icon('down')}</button><span class="vault-counter" aria-live="off"><b>01</b><span>/ 06</span></span><button type="button" class="vault-next" aria-label="Next service">{icon('down')}</button></div>{textlink('All services','/services/')}</div></div></section>'''

def home():
 strip=''
 for name,id,desc in [('Road freight','road','Across Pakistan'),('Air freight','air','When every hour counts'),('Ocean freight','ocean','Connected to the world'),('Multi-mode','multi','One seamless journey')]:
  strip+=f'<a href="/services/#{id}">{icon(id)}<span><strong>{name}</strong><small>{desc}</small></span>{icon()}</a>'
 return kinetic_hero('home',icon,pic,btn,SOURCE)+f'''
 <nav class="transport-strip" aria-label="Freight options">{strip}</nav>
 {about_intro(icon,pic,btn,SOURCE)}
 <section class="cargo-story" aria-label="Your cargo journey"><div class="cargo-stage"><div class="cargo-copy"><div class="eyebrow">02 / Cargo, considered</div><h2>Every detail.<br>Every direction.</h2><p>One connected team for the things that matter: careful handling, coordinated movement, and delivery to your destination.</p><div class="cargo-chapters"><div class="cargo-chapter is-active"><span>01</span><strong>Handle with care</strong></div><div class="cargo-chapter"><span>02</span><strong>Move with precision</strong></div><div class="cargo-chapter"><span>03</span><strong>Deliver with confidence</strong></div></div></div><div class="cargo-viewport"><canvas id="cargo-canvas" role="img" aria-label="Interactive 3D Barq Cargo container. Its doors open as you scroll."></canvas>{pic(REEFER,'Barq Cargo freight container','cargo-fallback')}<span class="cargo-viewport-caption">From first mile to final destination</span></div><div class="cargo-scroll-note">Scroll to follow the cargo{icon('down')}</div></div></section>
 {service_deck()}
 {journey(network(True),SOURCE,REEFER,icon,pic,btn)}{carriers()}{testimonials(icon)}{faq()}'''

def pagehero(label,title,description,num):
 page={'COMPANY':'about','SERVICES':'services','CONTACT':'contact','404':'404'}[num]
 return kinetic_hero(page,icon,pic,btn,SOURCE)

def about():
 timeline=''.join(f'<article class="milestone"><span>{e(m["year"])}</span><div><h3>{e(m["title"])}</h3><p>{e(m["desc"])}</p></div></article>' for m in DATA['rP'])
 return pagehero('About Barq','Built on trust.<br><span class="accent">Powered by speed.</span>','A Pakistan-based logistics company connecting manufacturers, exporters, and importers through road, air, and ocean freight.','COMPANY')+f'''
 <section class="section about-overview">{company_journey(icon,btn)}<div class="about-text"><h2 data-reveal>Pakistan at heart.<br>The world in reach.</h2><div data-reveal><p>Headquartered in Pakistan with offices in Lahore and Karachi, Barq Cargo brings together ground transport, air cargo, ocean freight, and customs clearance in one connected service.</p><p>Our name, Barq — Arabic and Urdu for lightning — reflects our focus on speed without compromising reliability. Industry experience and a dedicated team help us coordinate every consignment from origin to destination.</p><p>Whether you are moving a single parcel, a full container, or specialist project cargo, we build the journey around your requirements.</p>{textlink('Find your freight solution','/services/')}</div></div></section>
 {about_intro(icon,pic,btn,SOURCE,'our-perspective')}
 <section class="section about-values">{heading_row('What drives us','Purpose')}<h2 data-reveal>Moving more<br>than freight.</h2><div class="value-grid"><article class="value" data-reveal><span class="section-index">01 / Mission</span><h3>Connect opportunity.</h3><p>Deliver connected, technology-driven logistics that help Pakistani businesses compete globally — across the country and beyond.</p></article><article class="value" data-reveal><span class="section-index">02 / Vision</span><h3>Earn the next mile.</h3><p>Build a leading South Asian logistics business known for trust, innovation, and the care put into every shipment.</p></article><article class="value" data-reveal><span class="section-index">03 / Commitment</span><h3>Keep your business moving.</h3><p>Combine responsive support, secure handling, and coordinated transport, with one team keeping the whole journey in view.</p></article></div></section>
 <section class="history"><div class="history-blue"><div class="history-blue-inner"><div class="eyebrow">Our journey</div><h2>A business<br>in motion.</h2><p>From our first mile in Lahore<br>to the connections we make today.</p><div class="history-year" aria-hidden="true">2015</div><div class="history-progress" aria-hidden="true"><span></span></div></div></div><div class="timeline">{timeline}</div></section>{network()}{contact_banner()}'''

def services():
 return pagehero('Our services','Your cargo.<br><span class="accent">Our complete focus.</span>','From a single parcel to a full container, a connected range of freight services for your supply chain.','SERVICES')+service_catalog(DATA,SOURCE,icon,pic,btn)+faq()

def contact():
 options=''.join(f'<option>{e(s["label"])}</option>' for s in DATA['Xl'])+'<option>Temperature-controlled freight</option><option>Multi-mode logistics</option><option>Yiwu Barq Trading &amp; CO., LTD</option><option>Vector Logistics</option><option>Elite Prepware</option><option>Other / Not sure yet</option>'
 offices=''
 for o in DATA['Dp']:
  tel=''.join(c for c in o['phone'] if c in '+0123456789')
  offices+=f'''<article data-reveal><div class="eyebrow">{e(o['city'])}</div><h3>{e(o['city'].replace(' Office',''))}</h3><p>{e(o['address'])}</p><div class="office-contacts"><a href="tel:{tel}">{e(o['phone'])}</a><a href="mailto:{e(o['email'])}">{e(o['email'])}</a><span>{e(o['hours'])}</span></div>{textlink('View area on map','https://www.google.com/maps/search/?api=1&query='+quote(o['address']))}</article>'''
 return pagehero('Get in touch','Your next move.<br><span class="accent">Starts here.</span>','Tell us what you are moving, where it needs to go, and when. Our team will help you plan the journey.','CONTACT')+f'''
 <section class="section contact-section"><div class="contact-info"><h2>Let's talk logistics.</h2><p>From regular freight to a specialist shipment, connect with the Barq team for a tailored quote.</p><div class="contact-info-block"><small>General enquiries</small><a href="mailto:info@barqcargo.com">info@barqcargo.com</a></div><div class="contact-info-block"><small>Lahore office</small><a href="tel:+9242111227700">+92 42 111 227 700</a></div><div class="contact-info-block"><small>Karachi office</small><a href="tel:+9221111227700">+92 21 111 227 700</a></div><div class="contact-info-block"><small>Office hours</small><p>Monday–Saturday<br>9:00 AM–6:00 PM</p></div></div>
 <form class="quote-form" id="quote-form" action="mailto:info@barqcargo.com" method="post" enctype="text/plain"><h2>Your shipment details.</h2><p class="form-intro">Prepare an enquiry to send to our team by email.</p><div class="form-grid">
 <div class="form-field"><label for="name">Your name *</label><input id="name" name="name" autocomplete="name" placeholder="Full name" required maxlength="100"></div>
 <div class="form-field"><label for="company">Company</label><input id="company" name="company" autocomplete="organization" placeholder="Business name" maxlength="120"></div>
 <div class="form-field"><label for="email">Email address *</label><input id="email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required maxlength="150"></div>
 <div class="form-field"><label for="phone">Phone number</label><input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="+92" maxlength="30"></div>
 <div class="form-field full"><label for="service">What can we help with? *</label><select id="service" name="service" required><option value="">Select a service</option>{options}</select></div>
 <div class="form-field"><label for="origin">Origin</label><input id="origin" name="origin" placeholder="City, country" maxlength="100"></div>
 <div class="form-field"><label for="destination">Destination</label><input id="destination" name="destination" placeholder="City, country" maxlength="100"></div>
 <div class="form-field full"><label for="message">Tell us about your cargo *</label><textarea id="message" name="message" placeholder="Cargo type, quantity, dimensions, timing, and any special handling requirements…" required maxlength="2500"></textarea></div></div>
 <div class="form-submit"><button class="button navy" type="submit"><span>Prepare email enquiry</span>{icon()}</button><p class="form-note">Review your enquiry, then send it through your email app.</p></div>
 <div class="enquiry-result" id="enquiry-result" hidden tabindex="-1" role="status"><h3>Your enquiry is ready.</h3><p>Nothing has been sent yet. Open your email app to review and send it to Barq Cargo.</p><pre class="enquiry-preview" id="enquiry-preview"></pre><a class="button navy" id="send-enquiry" href="mailto:info@barqcargo.com"><span>Open email app</span>{icon()}</a><button type="button" class="copy-enquiry text-link">Copy enquiry</button><p id="copy-status" aria-live="polite"></p></div>
 </form></section>{about_intro(icon,pic,btn,SOURCE,'our-perspective')}
 <section class="section about-values"><div class="kicker-row"><div class="eyebrow">Find us in Pakistan</div></div><div class="contact-locations">{offices}</div></section>'''

def network_page():
 return kinetic_hero('network',icon,pic,btn,SOURCE)+network()+carriers()

def document(title, description, page, body):
 return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#052443"><title>{e(title)}</title><meta name="description" content="{e(description)}"><link rel="icon" href="/assets/barq-logo-clean.png"><link rel="preconnect" href="{SOURCE}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/premium.css"><link rel="stylesheet" href="/sequences.css"><link rel="stylesheet" href="/hero-experience.css?v=barq10"><script>document.documentElement.classList.add('js','is-loading');window.barqLoaderWatchdog=setTimeout(function(){{document.documentElement.classList.remove('is-loading','is-leaving');document.querySelector('.page-loader')?.classList.add('loader-done');if(!window.BarqReady)document.documentElement.classList.remove('js')}},4500);</script><script defer src="/motion-math.js?v=barq9"></script><script defer src="/app.js"></script><script defer src="/sequences.js?v=barq9"></script><script defer src="/archived-vessels.js?v=barq9"></script><script defer src="/hero-experience.js?v=barq9"></script>{'<script defer src="/cargo-3d.js"></script><link rel="preload" as="image" href="/assets/ocean-hero.webp">' if page=='home' else ''}</head><body data-page="{page}">{page_loader(page)}{header(page)}<main id="main">{body}</main>{footer()}</body></html>'''

pages=[('', 'home','Barq Cargo — Beyond borders. Ahead of time.','Barq Cargo connects Pakistan to the world through road, air, ocean freight, customs clearance, reefer logistics, and warehousing.',home()),('about','about','About Barq Cargo — Where speed meets reliability','Meet Barq Cargo: a Pakistan-based logistics company with offices in Lahore and Karachi and a corporate network across China and the United States.',about()),('services','services','Freight & logistics services — Barq Cargo','Explore road freight, air cargo, ocean shipping, customs clearance, project handling, warehousing, and temperature-controlled logistics.',services()),('contact','contact','Contact & freight quotes — Barq Cargo','Contact Barq Cargo in Lahore or Karachi. Prepare a freight enquiry for road, air, ocean, reefer, or specialist cargo.',contact())]
pages.append(('network','network','Our corporate network — Barq Cargo','Meet the Barq corporate family connecting sourcing, freight and fulfilment across China, Pakistan and the United States.',network_page()))
for route,page,title,description,body in pages:
 destination=OUT / route;destination.mkdir(parents=True,exist_ok=True);(destination/'index.html').write_text(localize_assets(document(title,description,page,body)))
(OUT/'404.html').write_text(localize_assets(document('Page not found — Barq Cargo','Find your way back to Barq Cargo.','404',pagehero('404 / Page not found','Let’s get you<br>back on track.','This page does not exist. Explore our services or return to the homepage.','404')+'<section class="section">'+btn('Return to home','/')+'</section>')))
print('Generated 5 complete pages and a custom 404 page.')
