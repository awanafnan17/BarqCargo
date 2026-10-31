"""Original scroll narratives and modal service catalogue for BarqCargo."""
from html import escape as e
from urllib.parse import quote

def journey(network_html, source, reefer, icon, pic, btn):
 network_track,network_dialogs=network_html
 fleet=''.join('<div class="voyage-fleet-column">'+''.join('<img src="/assets/vessels/small-vessel.svg" alt="" width="575" height="150">' for _ in range(n))+'</div>' for n in [1,3,5])
 return f'''<section class="journey-story" id="journey" aria-label="Cold chain to global connections"><div class="journey-stage">
 <section class="journey-panel journey-cold" id="reefer"><div class="journey-cold-copy"><div class="eyebrow">04 / Precision under pressure</div><h2>Fresh thinking.<br><span class="accent">Perfectly kept.</span></h2><p>Sensitive cargo. Carefully controlled. From fresh produce to pharmaceuticals, the right conditions travel with your shipment.</p><div class="journey-temperature"><strong>−25° <small>to</small> +25°</strong><span>Temperature-controlled freight · Celsius</span></div>{btn('Explore cold-chain logistics','/services/#reefer')}</div><div class="journey-cold-photo">{pic(reefer,'Refrigerated freight container for temperature-sensitive cargo')}<span class="journey-photo-label">The right conditions.<br>From pickup to delivery.</span></div></section>
 <section class="journey-panel journey-voyage" aria-label="A connected cargo journey"><div class="voyage-heading"><div class="eyebrow">Every mile, connected</div><p>Care travels<br><span>with your cargo.</span></p></div></section>
 <div class="voyage-big" aria-hidden="true"><img src="/assets/vessels/large-vessel.svg" alt="" width="2689" height="408"></div>
 <div class="voyage-fleet" aria-hidden="true">{fleet}</div>
 <section class="journey-panel journey-reveal" id="network" aria-labelledby="network-title">{network_track}</section>
 <nav class="journey-nav" aria-label="Cargo journey chapters"><button type="button" data-journey-step="0"><span>01</span> Cold chain</button><button type="button" data-journey-step="1"><span>02</span> The journey</button><button type="button" data-journey-step="2"><span>03</span> Our network</button><span class="journey-scroll">Scroll to move <span aria-hidden="true">↔</span></span><div class="journey-progress" aria-hidden="true"><span></span></div></nav></div></section>{network_dialogs}'''

def catalogue_items(data):
 return data['Xl']+[
 {'id':'reefer','label':'Temperature-controlled Freight','image':'/assets/reefer_container-DEVPQ60D.jpg','shortDesc':'The right conditions for sensitive cargo, from first mile to final delivery.','fullContent':{'overview':"Refrigerated transport for cargo that depends on precise conditions. Barq's reefer services support fresh produce, pharmaceutical products, dairy, and frozen foods across domestic and export routes.",'highlights':['Temperature range: −25°C to +25°C','Fresh fruit and vegetable logistics','Pharmaceutical cold-chain handling','Dairy and frozen food distribution','Agricultural export corridors','Temperature monitoring and alerts'],'coverage':['Domestic routes','Agricultural export corridors']}},
 {'id':'multi','label':'Multi-mode Logistics','image':'/assets/logistics_hub-BVlk8NxV.jpg','shortDesc':'Road, air and ocean, coordinated through one connected logistics partner.','fullContent':{'overview':"Coordinate road, air, and ocean transport through one logistics partner. We connect pickup, transit handling, customs clearance, and final-mile delivery around your shipment's needs.",'highlights':['Domestic and international freight','Coordinated collection and delivery','Connected customs handling','Dedicated account management'],'coverage':['Pakistan','International trade routes']}}
 ]

def service_catalog(data, source, icon, pic, btn):
 items=catalogue_items(data);pairs=[];modals='';fallback=''
 for start in range(0,len(items),2):
  cards=''
  for i,s in enumerate(items[start:start+2],start):
   cards+=f'''<article class="catalog-card" id="{s['id']}"><button type="button" class="catalog-card-open" data-dialog="service-dialog-{s['id']}" aria-haspopup="dialog" aria-label="Explore {e(s['label'])}" data-glow><span class="catalog-photo">{pic(source+s['image'],s['label'])}</span><span class="catalog-number">0{i+1} / FREIGHT SOLUTIONS</span><span class="catalog-card-content"><span class="catalog-icon">{icon(s['id'])}</span><span class="catalog-title">{e(s['label'])}</span><span class="catalog-description">{e(s['shortDesc'])}</span><span class="catalog-action">Explore service<span>{icon()}</span></span></span></button></article>'''
   d=s['fullContent'];lis=''.join(f'<li>{e(h)}</li>' for h in d['highlights']);coverage=' · '.join(e(c) for c in d['coverage'])
   quote_label='Temperature-controlled freight' if s['id']=='reefer' else 'Multi-mode logistics' if s['id']=='multi' else s['label']
   modals+=f'''<dialog class="company-dialog service-modal" id="service-dialog-{s['id']}" data-service="{s['id']}" aria-labelledby="service-title-{s['id']}"><button class="dialog-close" aria-label="Close service details">{icon('close')}</button><div class="service-modal-photo">{pic(source+s['image'],s['label'])}<span>BARQ / 0{i+1}</span></div><div class="dialog-content"><div class="eyebrow">A complete freight solution</div><h2 id="service-title-{s['id']}">{e(s['label'])}</h2><p>{e(d['overview'])}</p><ul>{lis}</ul><p class="coverage"><strong>Coverage</strong><br>{coverage}</p>{btn('Request a quote','/contact/?service='+quote(quote_label))}</div></dialog>'''
   fallback+=f'<article><h2>{e(s["label"])}</h2><p>{e(d["overview"])}</p><ul>{lis}</ul><p>{coverage}</p>{btn("Request a quote","/contact/?service="+quote(quote_label))}</article>'
  pairs.append(f'<div class="catalog-pair" data-pair="{start//2}">{cards}</div>')
 jump=''.join(f'<a href="#{s["id"]}">{e(s["label"])}</a>' for s in items)
 return f'''<nav class="service-jump" aria-label="Choose a freight service">{jump}</nav><section class="catalog-story" aria-label="Explore freight services"><div class="catalog-stage"><div class="catalog-heading"><div><div class="eyebrow">The right solution. Every shipment.</div><h2>Made for your <br><span>next move.</span></h2></div><p>Explore our services.<br>Select a card to see the details.</p></div><div class="catalog-window"><div class="catalog-track">{''.join(pairs)}</div></div><div class="catalog-controls"><button type="button" data-catalog-direction="-1" aria-label="Previous services">{icon('down')}</button><span class="catalog-page"><b>01</b> / 04</span><button type="button" data-catalog-direction="1" aria-label="Next services">{icon('down')}</button><span class="catalog-scroll">Scroll to explore <span aria-hidden="true">↔</span></span><div class="catalog-progress" aria-hidden="true"><span></span></div></div></div></section>{modals}<noscript><section class="service-text-fallback section">{fallback}</section></noscript>'''

def testimonials(icon):
 samples=[
 ('Road freight','“Clear updates, careful handling and a delivery plan that kept our business moving.”','Domestic distribution'),
 ('Ocean freight','“From documentation to arrival, having one team coordinate the journey made all the difference.”','Import & export'),
 ('Cold-chain logistics','“Our shipment needed careful temperature control. The communication throughout was just as important.”','Temperature-sensitive cargo'),
 ('Warehousing','“A connected approach to storage, consolidation and dispatch helped simplify the next step.”','Storage & fulfilment')]
 cards=''
 for i,(service,copy,industry) in enumerate(samples):
  cards+=f'''<article class="testimonial-card" data-testimonial="{i}"><span class="testimonial-sample">Sample testimonial · For layout review</span><span class="testimonial-quote" aria-hidden="true">“</span><blockquote>{e(copy.strip('“”'))}</blockquote><div class="testimonial-person"><span class="testimonial-avatar" aria-hidden="true">0{i+1}</span><div><strong>Client name to be added</strong><span>{e(industry)}</span></div></div><span class="testimonial-service">{e(service)}</span></article>'''
 return f'''<section class="testimonials-story" id="testimonials" aria-label="Testimonial layout with sample content"><div class="testimonials-stage"><div class="testimonial-heading"><div class="eyebrow">Client stories</div><h2>Good journeys.<br><span>Lasting connections.</span></h2><p>Preview copy. Approved client testimonials will replace these samples.</p></div><div class="testimonial-deck">{cards}</div><div class="testimonial-controls"><button type="button" data-testimonial-direction="-1" aria-label="Previous testimonial">{icon('down')}</button><span class="testimonial-counter"><b>01</b> / 04</span><button type="button" data-testimonial-direction="1" aria-label="Next testimonial">{icon('down')}</button></div></div></section>'''
