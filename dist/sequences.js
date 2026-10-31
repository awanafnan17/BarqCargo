/* Original, reversible cargo narratives. Scroll position is the source of truth. */
(() => {
  'use strict';
  const root=document.documentElement;
  const {clamp,progress,segment,journeyPose,shipWipe,cataloguePosition,networkOffset}=window.BarqMath;
  const motion=window.BarqMotion;
  const compact=()=>motion.isPaused()||root.classList.contains('compact-vault');
  const layoutTop=el=>{let y=0;for(let node=el;node;node=node.offsetParent)y+=node.offsetTop;return y;};
  const record=selector=>{const el=document.querySelector(selector);return el?{el,top:0,height:1,width:1}:null;};
  const journey=record('.journey-story'),catalog=record('.catalog-story'),stories=record('.testimonials-story');
  const cold=journey?.el.querySelector('.journey-cold'),coldCopy=cold?.querySelector('.journey-cold-copy'),voyagePanel=journey?.el.querySelector('.journey-voyage'),networkReveal=journey?.el.querySelector('.journey-reveal'),journeyNav=journey?.el.querySelector('.journey-nav');
  const panels=[...document.querySelectorAll('.journey-panel')];
  const largeVessel=journey?.el.querySelector('.voyage-big'),fleet=journey?.el.querySelector('.voyage-fleet');
  const journeyButtons=[...document.querySelectorAll('[data-journey-step]')];
  const journeyProgress=journey?.el.querySelector('.journey-progress>span');
  const coldPhoto=journey?.el.querySelector('.journey-cold-photo img');
  const voyageHeading=journey?.el.querySelector('.voyage-heading');
  const catalogTrack=catalog?.el.querySelector('.catalog-track');
  const pairs=[...document.querySelectorAll('.catalog-pair')];
  const catalogButtons=[...document.querySelectorAll('[data-catalog-direction]')];
  const catalogCount=catalog?.el.querySelector('.catalog-page>b');
  const catalogProgress=catalog?.el.querySelector('.catalog-progress>span');
  const testimonialCards=[...document.querySelectorAll('.testimonial-card')];
  const testimonialButtons=[...document.querySelectorAll('[data-testimonial-direction]')];
  const testimonialCount=stories?.el.querySelector('.testimonial-counter>b');
  const milestones=[...document.querySelectorAll('.milestone')].map(el=>({el,top:0,height:1,year:el.querySelector(':scope>span')?.textContent}));
  const year=document.querySelector('.history-year'),historyProgress=document.querySelector('.history-progress>span');
  const faqItems=[...document.querySelectorAll('.faq-item')].map(el=>({el,top:0,height:1}));
  const faqIndex=document.querySelector('.faq-focus-index>span');
  const networks=[...document.querySelectorAll('[data-network-track]')].map(track=>({track,host:track.parentElement,story:track.closest('[data-network-story]'),cards:[...track.querySelectorAll('[data-network-item]')],controls:track.parentElement.querySelector('.network-controls'),top:0,height:1,width:1,stops:[0],items:[],current:0}));
  const routeSteps=[...document.querySelectorAll('[data-route-step]')].map(el=>({el,top:0,height:1}));
  const routeIndex=document.querySelector('[data-route-index]'),routeProgress=document.querySelector('.route-progress>span');
  let viewport=innerHeight,phone=innerWidth<=600,pairWidth=1,testimonialWidth=300;
  let bigWidth=1,fleetWidth=1;
  let catalogCurrent=0,testimonialCurrent=0,lastCompact=null;

  function measure(){
    viewport=innerHeight;phone=innerWidth<=600;
    [journey,catalog,stories].filter(Boolean).forEach(item=>{item.top=layoutTop(item.el);item.height=item.el.offsetHeight;item.width=item.el.clientWidth;});
    [...milestones,...faqItems,...routeSteps].forEach(item=>{item.top=layoutTop(item.el);item.height=item.el.offsetHeight;});
    pairWidth=catalog?.el.querySelector('.catalog-window')?.clientWidth||1;
    testimonialWidth=testimonialCards[0]?.offsetWidth||300;
    networks.forEach(n=>{
      n.top=layoutTop(n.story||journey.el);n.height=(n.story||journey.el).offsetHeight;n.width=n.host.clientWidth;
      const limit=Math.max(0,n.track.scrollWidth-n.width);
      n.title=n.track.querySelector('.network-title-slide');n.titleWidth=n.title.offsetWidth;
      n.items=n.cards.map(el=>({el,left:el.offsetLeft,width:el.offsetWidth}));
      n.stops=[0,...n.items.map(item=>clamp(item.left-(n.width-item.width)/2,0,limit))];
    });
    bigWidth=largeVessel?.offsetWidth||1;fleetWidth=fleet?.scrollWidth||1;

  }
  function seek(item,p,instant=false){
    if(!item)return;
    measure();
    window.scrollTo({top:item.top+clamp(p)*Math.max(1,item.height-viewport),behavior:instant||motion.isPaused()?'instant':'smooth'});
    motion.refresh();
  }
  function activateButtons(buttons,index,key,max){
    buttons.forEach(button=>{const direction=Number(button.dataset[key]);button.disabled=direction<0?index===0:index===max;});
  }
  function setInert(el,value){
    // An open native dialog keeps its active chapter available until it closes.
    if(value&&el.querySelector('dialog[open]'))return;
    if(el.inert!==value)el.inert=value;
  }
  function chapter(index,instant=false){
    if(!journey)return;
    if(compact()){panels[index]?.scrollIntoView({behavior:'instant',block:'start'});return;}
    seek(journey,[.04,.35,.64][index],instant);
  }
  journeyButtons.forEach(button=>button.addEventListener('click',()=>chapter(Number(button.dataset.journeyStep))));
  catalogButtons.forEach(button=>button.addEventListener('click',()=>seek(catalog,(catalogCurrent+Number(button.dataset.catalogDirection))/(pairs.length-1))));
  testimonialButtons.forEach(button=>button.addEventListener('click',()=>seek(stories,(testimonialCurrent+Number(button.dataset.testimonialDirection))/(testimonialCards.length-1))));
  function seekNetwork(n,index){
    const p=clamp(index/Math.max(1,n.stops.length-1));
    if(n.story)seek({top:n.top,height:n.height},p);
    else seek(journey,.64+p*.34);
  }
  networks.forEach(n=>n.controls.querySelectorAll('[data-network-direction]').forEach(button=>button.addEventListener('click',()=>seekNetwork(n,n.current+Number(button.dataset.networkDirection)))));
  function paintNetwork(n,p,disabled,entrance=0){
    const offset=disabled?0:networkOffset(p,n.stops);
    n.track.style.transform=`translate3d(${entrance-offset}px,0,0)`;
    setInert(n.title,!disabled&&entrance-offset+n.titleWidth<=0);
    n.items.forEach(({el,left,width})=>{
      const center=left+width/2-offset+entrance,d=clamp((center-n.width*.5)/n.width,-1,1);
      el.style.transform=disabled?'none':`perspective(1600px) rotateY(${-d*5}deg)`;
      setInert(el,!disabled&&(left+entrance-offset>=n.width-12||left+width+entrance-offset<=12));
    });
    n.current=Math.round(p*(n.stops.length-1));n.controls.querySelector('.network-count>b').textContent=String(n.current+1).padStart(2,'0');
    n.controls.querySelector('.network-track-progress>span').style.transform=`scaleX(${p})`;
    activateButtons([...n.controls.querySelectorAll('[data-network-direction]')],n.current,'networkDirection',n.stops.length-1);
  }


  function frame({detail:{scroll,paused}}){
    const disabled=paused||root.classList.contains('compact-vault');
    if(disabled!==lastCompact){
      lastCompact=disabled;
      if(disabled){
        [...panels,...pairs].forEach(el=>setInert(el,false));
        journeyNav?.removeAttribute('inert');
      }
      measure();
    }
    if(journey&&!disabled){
      const p=progress(scroll,journey.top,journey.height,viewport),pose=journeyPose(p);
      const w=journey.width,big=shipWipe(pose.big,w,bigWidth),small=shipWipe(pose.fleet,w,fleetWidth,70);
      largeVessel.style.transform=`translate3d(${big.x}px,0,0)`;
      fleet.style.transform=`translate3d(${small.x}px,0,0)`;
      coldCopy.style.clipPath=`inset(0 ${Math.max(0,coldCopy.offsetWidth-big.front)}px 0 0)`;
      voyagePanel.style.clipPath=`inset(0 ${(1-small.before)*100}% 0 ${big.after*100}%)`;
      networkReveal.style.clipPath=`inset(0 0 0 ${small.after*100}%)`;
      networks.filter(n=>!n.story).forEach(n=>paintNetwork(n,pose.network,false,Math.max(0,small.back+45)));
      largeVessel.style.visibility=pose.big>0&&pose.big<1?'visible':'hidden';
      fleet.style.visibility=pose.fleet>0&&pose.fleet<1?'visible':'hidden';
      setInert(cold,big.before<.3);setInert(voyagePanel,pose.big<.5||pose.fleet>.5);setInert(networkReveal,pose.fleet<1);
      const active=p<.10?0:p<.60?1:2;
      journeyButtons.forEach((button,i)=>button.setAttribute('aria-current',String(i===active)));
      journeyProgress.style.transform=`scaleX(${p})`;
      journeyNav.style.opacity=String(pose.nav);setInert(journeyNav,pose.nav<.1);
      coldPhoto.style.transform=`translate3d(0,${pose.big*-28}px,0) scale(${1.02+pose.big*.1})`;
      coldPhoto.parentElement.style.opacity=String(1-segment(pose.big,0,.30));

    }
    networks.filter(n=>n.story||disabled).forEach(n=>paintNetwork(n,disabled?0:progress(scroll,n.top,n.height,viewport),disabled));
    if(catalog&&!disabled){
      const p=progress(scroll,catalog.top,catalog.height,viewport),center=cataloguePosition(p,pairs.length);
      catalogTrack.style.transform=`translate3d(${-center*pairWidth}px,0,0)`;
      pairs.forEach((pair,i)=>{
        const d=i-center,a=Math.abs(d);
        pair.style.transform=`translate3d(0,${Math.min(a,1)*15}px,${-Math.min(a,1)*120}px) rotateY(${-clamp(d,-1,1)*8}deg)`;
        pair.style.opacity=String(clamp(1-a*.38,.3,1));
        setInert(pair,a>.85);
      });
      catalogCurrent=Math.round(center);catalogCount.textContent=String(catalogCurrent+1).padStart(2,'0');
      catalogProgress.style.transform=`scaleX(${p})`;
      activateButtons(catalogButtons,catalogCurrent,'catalogDirection',pairs.length-1);
    }
    if(stories&&!disabled){
      const p=progress(scroll,stories.top,stories.height,viewport),center=p*(testimonialCards.length-1);
      testimonialCards.forEach((card,i)=>{
        const d=i-center,a=Math.abs(d);
        card.style.transform=`translate3d(${d*testimonialWidth*1.03}px,${Math.min(a,2)*26}px,${-a*165}px) rotateY(${-d*13}deg) rotateZ(${d*2.5}deg)`;
        card.style.opacity=String(clamp(1-a*.2,.2,1));card.style.zIndex=String(20-Math.round(a*5));
        card.classList.toggle('is-current',a<.5);
      });
      testimonialCurrent=Math.round(center);testimonialCount.textContent=String(testimonialCurrent+1).padStart(2,'0');
      activateButtons(testimonialButtons,testimonialCurrent,'testimonialDirection',testimonialCards.length-1);
    }
    if(!disabled){
      [...milestones,...faqItems,...routeSteps].forEach(({el,top,height})=>{
        if(top-scroll>viewport*1.3||top+height-scroll<-viewport*.3)return;
        const p=segment(scroll,top-viewport*.97,top-viewport*.43);
        const distance=el.matches('.faq-item')?85:145;
        el.style.transform=`perspective(1300px) translate3d(${(1-p)*distance}px,${(1-p)*13}px,${(1-p)*-90}px) rotateY(${(1-p)*-9}deg)`;
        el.style.opacity=String(.5+.5*p);
      });
    }
    if(routeSteps.length){
      let current=0;routeSteps.forEach((item,i)=>{if(item.top<scroll+viewport*.65)current=i;});
      routeSteps.forEach((item,i)=>item.el.classList.toggle('is-current',i===current));
      routeIndex.textContent=String(current+1).padStart(2,'0');routeProgress.style.transform=`scaleX(${(current+1)/routeSteps.length})`;
    }
    if(milestones.length){
      let current=0;
      milestones.forEach((item,i)=>{if(item.top<scroll+viewport*.57)current=i;});
      milestones.forEach((item,i)=>item.el.classList.toggle('is-current',i===current));
      if(year.textContent!==milestones[current].year)year.textContent=milestones[current].year;
      historyProgress.style.transform=`scaleX(${(current+1)/milestones.length})`;
    }
  }
  document.addEventListener('barq:layout',measure);
  document.addEventListener('barq:frame',frame);

  // A service URL is a real, shareable detail entry, including Back and Forward.
  const serviceMap=new Map([...document.querySelectorAll('.service-modal')].map(dialog=>[dialog.dataset.service,dialog]));
  function showService(id,trigger){
    const dialog=serviceMap.get(id);if(!dialog)return false;
    const card=document.getElementById(id),pair=card?.closest('.catalog-pair');
    if(!compact()&&pair){
      pair.inert=false;
      seek(catalog,Number(pair.dataset.pair)/Math.max(1,pairs.length-1),true);
    }
    window.BarqDialogs.open(dialog,trigger||card?.querySelector('button'));return true;
  }
  document.addEventListener('barq:dialogopen',event=>{
    const id=event.detail.dialog.dataset.service;
    if(id&&location.hash!=='#'+id)history.pushState(history.state,'',location.pathname+location.search+'#'+id);
  });
  document.addEventListener('barq:dialogclose',event=>{
    const id=event.detail.dialog.dataset.service;
    if(id&&location.hash==='#'+id)history.replaceState(history.state,'',location.pathname+location.search);
  });
  function hashValue(){try{return decodeURIComponent(location.hash.slice(1));}catch{return '';}}
  function handleHash(){
    const id=hashValue();
    if(serviceMap.has(id)){showService(id);return;}
    document.querySelectorAll('.service-modal[open]').forEach(dialog=>window.BarqDialogs.close(dialog));
    if(journey&&(id==='reefer'||id==='network'||id==='journey'))chapter(id==='network'?2:0,true);
  }
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href]');
    if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const url=new URL(anchor.href,location.href);
    if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search||!url.hash)return;
    let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{return;}
    if(serviceMap.has(id)){event.preventDefault();showService(id,anchor);}
    else if(journey&&['reefer','network','journey'].includes(id)){
      event.preventDefault();history.pushState(history.state,'',url.href);chapter(id==='network'?2:0);
    }
  });
  window.addEventListener('popstate',handleHash);
  window.addEventListener('hashchange',handleHash);
  let initialRouted=false;
  function initialRoute(){if(initialRouted)return;initialRouted=true;handleHash();}
  document.addEventListener('barq:loaded',initialRoute);
  window.addEventListener('load',()=>{if(!root.classList.contains('is-loading'))initialRoute();},{once:true});
  if(document.readyState==='complete'&&!root.classList.contains('is-loading'))initialRoute();

  // Native details semantics, with cancellable drawer motion for rapid toggles.
  const faqAnimations=new WeakMap();
  function updateFaqIndex(preferred){
    const selected=Number.isInteger(preferred)&&faqItems[preferred]?.el.open?preferred:faqItems.reduce((last,item,index)=>item.el.open?index:last,-1);
    if(faqIndex)faqIndex.textContent=selected<0?'—':String(selected+1).padStart(2,'0');
  }
  faqItems.forEach(({el},index)=>{
    const summary=el.querySelector('summary'),answer=el.querySelector('.faq-answer'),content=answer.firstElementChild;
    summary.addEventListener('click',event=>{
      if(!answer.animate||motion.isPaused())return;
      event.preventDefault();
      const old=faqAnimations.get(el),open=!(old?old.target:el.open);
      const start=el.open?answer.getBoundingClientRect().height:0;
      old?.animation.cancel();el.open=true;
      const target=open?content.offsetHeight:0;
      const animation=answer.animate([
        {height:start+'px',opacity:start?1:0,transform:`translate3d(${open?22:0}px,0,0)`},
        {height:target+'px',opacity:open?1:0,transform:`translate3d(${open?0:-12}px,0,0)`}
      ],{duration:open?520:340,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
      faqAnimations.set(el,{animation,target:open});
      if(open)updateFaqIndex(index);
      animation.onfinish=()=>{el.open=open;animation.cancel();faqAnimations.delete(el);updateFaqIndex(open?index:undefined);motion.refresh();};
      motion.refresh();
    });
    el.addEventListener('toggle',()=>{updateFaqIndex(el.open?index:undefined);motion.refresh();});
  });
  document.addEventListener('barq:motionchange',()=>{
    faqItems.forEach(({el})=>{const state=faqAnimations.get(el);if(state){el.open=state.target;state.animation.cancel();faqAnimations.delete(el);}});
    lastCompact=null;motion.refresh();
  });
  measure();motion.refresh();
})();
