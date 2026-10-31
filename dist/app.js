(() => {
  'use strict';
  const root=document.documentElement;
  const {clamp,progress:storyProgress,cardPose,damp}=window.BarqMath;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused=false;
  try{userPaused=localStorage.getItem('barq-motion')==='paused';}catch{}
  const isPaused=()=>userPaused||reduced.matches;
  window.BarqMotion={isPaused,refresh:()=>{needsMeasure=true;schedule();}};
  const toggle=document.querySelector('.motion-toggle');
  let raf=0,lastTime=0,scroll=window.scrollY,needsMeasure=true;
  let viewport=innerHeight;
  function setMotion(){
    const paused=isPaused();
    root.classList.toggle('motion-paused',paused);
    root.classList.toggle('motion-enabled',!paused);
    root.classList.toggle('compact-vault',innerHeight<530);
    if(toggle){toggle.textContent=reduced.matches?'Reduced motion enabled':paused?'Enable animations':'Pause animations';toggle.setAttribute('aria-pressed',String(paused));toggle.disabled=reduced.matches;}
    document.dispatchEvent(new Event('barq:motionchange'));
    needsMeasure=true;schedule();
  }
  toggle?.addEventListener('click',()=>{userPaused=!userPaused;try{localStorage.setItem('barq-motion',userPaused?'paused':'active');}catch{}setMotion();});
  reduced.addEventListener('change',setMotion);

  // Shared six-panel intro, replayed on every route load, including history restoration.
  const loader=document.querySelector('.page-loader');
  let loaderToken=0,leaving=false;
  function clearLoader(){root.classList.remove('is-loading','is-leaving');loader?.classList.add('loader-done');clearTimeout(window.barqLoaderWatchdog);document.dispatchEvent(new Event('barq:loaded'));}
  function intro(){
    if(!loader||isPaused()){clearLoader();return;}
    const token=++loaderToken;
    leaving=false;loader.classList.remove('loader-done','loader-exit');root.classList.remove('is-leaving');root.classList.add('is-loading');
    const count=loader.querySelector('.loader-count>span'),rule=loader.querySelector('.loader-rule>span');
    const start=performance.now();
    const duration=1450;
    clearTimeout(window.barqLoaderWatchdog);window.barqLoaderWatchdog=setTimeout(clearLoader,3600);
    function step(time){
      if(token!==loaderToken)return;
      const p=clamp((time-start)/duration),value=Math.round(100*(1-Math.pow(1-p,2.4)));
      count.textContent=String(value).padStart(2,'0');rule.style.transform=`scaleX(${value/100})`;
      if(p<1&&!isPaused()){requestAnimationFrame(step);return;}
      count.textContent='100';rule.style.transform='scaleX(1)';
      loader.classList.add('loader-exit');
      setTimeout(()=>{if(token!==loaderToken)return;clearLoader();},950);
    }
    requestAnimationFrame(step);
  }
  window.addEventListener('pageshow',event=>{if(event.persisted){leaving=false;scroll=window.scrollY;needsMeasure=true;intro();schedule();}});
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href]');
    if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self')||isPaused())return;
    const target=new URL(anchor.href,location.href);
    if(target.origin!==location.origin||!/^https?:$/.test(target.protocol))return;
    if(target.pathname===location.pathname&&target.search===location.search)return;
    if(leaving){event.preventDefault();return;}
    event.preventDefault();leaving=true;++loaderToken;
    document.querySelectorAll('.company-dialog[open]').forEach(dialog=>closeDialog(dialog,true));
    clearTimeout(window.barqLoaderWatchdog);
    loader.classList.remove('loader-done','loader-exit');root.classList.remove('is-loading');
    // Paint the empty panels before scaling them from the top.
    requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('is-leaving')));
    setTimeout(()=>location.assign(target.href),720);
    window.barqLoaderWatchdog=setTimeout(()=>{clearLoader();leaving=false;},4000);
  });

  document.querySelectorAll('.brand img').forEach(img=>{
    function fallback(){img.style.display='none';if(img.nextElementSibling)img.nextElementSibling.style.display='block';}
    img.addEventListener('error',fallback);if(img.complete&&!img.naturalWidth)fallback();
  });
  const header=document.querySelector('.site-header'),menuButton=document.querySelector('.menu-toggle'),menu=document.querySelector('.mobile-menu');
  function closeMenu(restore=false){
    if(!menu||menu.hidden)return;
    menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');document.body.classList.remove('menu-open');
    document.querySelector('main')?.removeAttribute('inert');document.querySelector('.site-footer')?.removeAttribute('inert');if(restore)menuButton.focus();
  }
  menuButton?.addEventListener('click',()=>{
    if(!menu.hidden){closeMenu();return;}
    menu.hidden=false;menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Close menu');document.body.classList.add('menu-open');
    document.querySelector('main')?.setAttribute('inert','');document.querySelector('.site-footer')?.setAttribute('inert','');menu.querySelector('a')?.focus();
  });
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',event=>{
    if(!menu||menu.hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeMenu(true);}
    if(event.key==='Tab'){
      const items=[menuButton,...menu.querySelectorAll('a')],first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });

  // Cache layout coordinates, not transformed rectangles, so animations cannot feed back into measurements.
  const layoutTop=el=>{let y=0;for(let node=el;node;node=node.offsetParent)y+=node.offsetTop;return y;};
  const reveals=[...document.querySelectorAll('[data-reveal]')].map(el=>({el,top:0,height:0}));
  const photos=[...document.querySelectorAll('.parallax-photo')].map(el=>({el,top:0,height:0}));
  const hero=document.querySelector('.hero'),heroInner=document.querySelector('.hero-inner'),heroMedia=document.querySelector('.hero-media');
  const pageHero=document.querySelector('.page-hero'),pageCopy=document.querySelector('.page-hero-copy'),pageScene=document.querySelector('.page-scene');
  const progressBar=document.querySelector('.reading-progress');
  const vault=document.querySelector('.services-vault'),deck=document.querySelector('.freight-deck');
  const cards=[...document.querySelectorAll('.freight-card')];
  const previous=document.querySelector('.vault-prev'),next=document.querySelector('.vault-next'),counter=document.querySelector('.vault-counter>b');
  let vaultTop=0,vaultHeight=1,cardWidth=260,currentCard=0,pageHeight=1,heroHeight=1;
  function measure(){
    viewport=innerHeight;
    reveals.forEach(item=>{item.top=layoutTop(item.el);item.height=item.el.offsetHeight;});
    photos.forEach(item=>{item.top=layoutTop(item.el.parentElement);item.height=item.el.parentElement.offsetHeight;});
    if(vault){vaultTop=layoutTop(vault);vaultHeight=vault.offsetHeight;cardWidth=cards[0]?.offsetWidth||260;}
    pageHeight=document.documentElement.scrollHeight;heroHeight=hero?.offsetHeight||pageHero?.offsetHeight||1;
    needsMeasure=false;
    document.dispatchEvent(new CustomEvent('barq:layout',{detail:{viewport}}));
  }
  function update(time){
    raf=0;
    const dt=lastTime?time-lastTime:16;lastTime=time;
    if(needsMeasure)measure();
    const target=window.scrollY,paused=isPaused();
    scroll=paused?target:damp(scroll,target,dt);
    if(Math.abs(target-scroll)<.06)scroll=target;
    header?.classList.toggle('is-scrolled',target>35);
    if(progressBar)progressBar.style.transform=`scaleX(${clamp(target/Math.max(1,pageHeight-viewport))})`;
    if(!paused){
      reveals.forEach(({el,top,height})=>{
        const local=top-scroll;
        if(local>viewport*1.15||local+height<-.25*viewport)return;
        const enter=clamp((viewport*.94-local)/(viewport*.42));
        const exit=clamp((-local-height*.45)/(viewport*.65));
        el.style.setProperty('--reveal-opacity',String(.45+.55*enter));
        el.style.setProperty('--reveal-y',`${(1-enter)*65-exit*22}px`);
        el.style.setProperty('--reveal-z',`${-(1-enter)*90-exit*25}px`);
        el.style.setProperty('--reveal-rx',`${(1-enter)*9-exit*3}deg`);
      });
      photos.forEach(({el,top,height})=>{
        if(top-scroll>viewport||top+height-scroll<0)return;
        const p=clamp((viewport-top+scroll)/(viewport+height));
        el.style.transform=`translate3d(0,${-p*12}%,0) scale(1.015)`;
      });
      const hp=clamp(scroll/heroHeight);
      if(hero&&scroll<heroHeight+100){
        heroMedia.style.transform=`translate3d(0,${hp*120}px,0) scale(${1+hp*.11})`;
        heroInner.style.transform=`perspective(1400px) translate3d(0,${hp*105}px,${-hp*130}px) rotateX(${hp*8}deg)`;
      }
      if(pageHero&&scroll<heroHeight+100){
        pageCopy.style.transform=`translate3d(0,${hp*80}px,${-hp*85}px) rotateX(${hp*6}deg)`;
        pageScene.style.transform=`translate3d(0,${hp*95}px,${hp*80}px) rotateZ(${-hp*7}deg)`;
      }
    }
    if(vault&&!paused&&!root.classList.contains('compact-vault')){
      const p=storyProgress(scroll,vaultTop,vaultHeight,viewport),center=p*(cards.length-1);
      if(vaultTop-scroll<viewport&&vaultTop+vaultHeight-scroll>0){
        cards.forEach((card,i)=>{
          const pose=cardPose(i,center,cardWidth);
          card.style.transform=`translate3d(${pose.x}px,${pose.y}px,${pose.z}px) rotateX(${pose.rx}deg) rotateY(${pose.ry}deg) rotateZ(${pose.rz}deg)`;
          card.style.opacity=String(pose.opacity);card.style.zIndex=String(pose.layer);
        });
      }
      currentCard=Math.round(center);counter.textContent=String(currentCard+1).padStart(2,'0');
      previous.disabled=p<.003;next.disabled=p>.997;
    }else cards.forEach(card=>{card.style.opacity='1';});
    document.dispatchEvent(new CustomEvent('barq:frame',{detail:{scroll,viewport,paused,dt}}));
    if(Math.abs(scroll-target)>.06&&!document.hidden)schedule();
  }
  function schedule(){if(!raf&&!document.hidden)raf=requestAnimationFrame(update);}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',()=>{if(innerWidth>900)closeMenu();setMotion();},{passive:true});
  window.addEventListener('load',()=>{needsMeasure=true;schedule();},{once:true});
  new ResizeObserver(()=>{needsMeasure=true;schedule();}).observe(document.querySelector('main'));
  document.fonts?.ready.then(()=>{needsMeasure=true;schedule();});
  document.querySelectorAll('img').forEach(img=>{if(!img.complete)img.addEventListener('load',()=>{needsMeasure=true;schedule();},{once:true});});
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(!document.hidden){needsMeasure=true;schedule();}else if(raf){cancelAnimationFrame(raf);raf=0;}});
  document.querySelectorAll('details').forEach(item=>item.addEventListener('toggle',()=>{needsMeasure=true;schedule();}));
  function goToCard(index,instant=false){
    if(!vault||isPaused()||root.classList.contains('compact-vault'))return;
    measure();const p=clamp(index/(cards.length-1));
    window.scrollTo({top:vaultTop+p*Math.max(1,vaultHeight-viewport),behavior:instant?'instant':'smooth'});
  }
  previous?.addEventListener('click',()=>goToCard(currentCard-1));
  next?.addEventListener('click',()=>goToCard(currentCard+1));
  cards.forEach((card,index)=>card.querySelector('a')?.addEventListener('focus',event=>{if(event.target.matches(':focus-visible'))goToCard(index,true);}));

  document.querySelectorAll('[data-glow],.button,.network-card,.value').forEach(el=>{
    el.addEventListener('pointermove',event=>{
      if(isPaused()||event.pointerType!=='mouse')return;
      const r=el.getBoundingClientRect();el.style.setProperty('--glow-x',`${event.clientX-r.left}px`);el.style.setProperty('--glow-y',`${event.clientY-r.top}px`);
    },{passive:true});
  });
  const marquee=document.querySelector('.footer-marquee'),cursor=document.querySelector('.footer-cursor');
  marquee?.addEventListener('pointermove',event=>{
    if(isPaused()||event.pointerType!=='mouse'||!cursor)return;
    const rect=marquee.getBoundingClientRect();cursor.style.transform=`translate3d(${event.clientX-rect.left-52}px,${event.clientY-rect.top-52}px,0)`;
  },{passive:true});
  // One native, focus-trapping dialog controller for companies and freight details.
  const dialogStates=new WeakMap();
  function openDialog(dialog,trigger=document.activeElement){
    if(!dialog||dialog.open)return;
    document.querySelectorAll('.company-dialog[open]').forEach(other=>closeDialog(other,true));
    const state={trigger,animation:null,closing:false};dialogStates.set(dialog,state);
    dialog.classList.remove('dialog-closing');dialog.showModal();dialog.scrollTop=0;
    document.body.classList.add('dialog-open');
    if(!isPaused())state.animation=dialog.animate([
      {opacity:0,transform:'perspective(1500px) translate3d(0,65px,-130px) rotateX(8deg) scale(.94)'},
      {opacity:1,transform:'perspective(1500px) translate3d(0,0,0) rotateX(0deg) scale(1)'}
    ],{duration:560,easing:'cubic-bezier(.16,1,.3,1)'});
    document.dispatchEvent(new CustomEvent('barq:dialogopen',{detail:{dialog,trigger}}));
  }
  function closeDialog(dialog,instant=false){
    if(!dialog?.open)return;
    const state=dialogStates.get(dialog)||{};
    if(state.closing&&!instant)return;
    state.closing=true;state.animation?.cancel();dialog.classList.add('dialog-closing');
    const finish=()=>{dialog.classList.remove('dialog-closing');dialog.close();};
    if(instant||isPaused()){finish();return;}
    state.animation=dialog.animate([
      {opacity:1,transform:'perspective(1500px) translate3d(0,0,0) rotateX(0deg) scale(1)'},
      {opacity:0,transform:'perspective(1500px) translate3d(0,35px,-90px) rotateX(-4deg) scale(.97)'}
    ],{duration:230,easing:'cubic-bezier(.4,0,1,1)'});
    state.animation.onfinish=finish;
  }
  window.BarqDialogs={open:openDialog,close:closeDialog};
  document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>openDialog(document.getElementById(button.dataset.dialog),button)));
  document.querySelectorAll('.company-dialog').forEach(dialog=>{
    dialog.querySelector('.dialog-close')?.addEventListener('click',()=>closeDialog(dialog));
    dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);}});
    dialog.addEventListener('close',()=>{
      if(!document.querySelector('.company-dialog[open]'))document.body.classList.remove('dialog-open');
      const state=dialogStates.get(dialog);state?.animation?.cancel();
      if(!document.querySelector('.company-dialog[open]'))state?.trigger?.focus({preventScroll:true});
      document.dispatchEvent(new CustomEvent('barq:dialogclose',{detail:{dialog}}));
      needsMeasure=true;schedule();
    });
  });

  const form=document.getElementById('quote-form');
  if(form){
    const service=form.querySelector('#service');const requested=new URLSearchParams(location.search).get('service');
    if(requested&&[...service.options].some(o=>o.value===requested))service.value=requested;
    const result=document.querySelector('#enquiry-result');let preparedBody='';
    form.querySelectorAll('input[required],textarea[required]').forEach(input=>input.addEventListener('input',()=>input.setCustomValidity('')));
    form.addEventListener('submit',event=>{
      event.preventDefault();
      for(const input of form.querySelectorAll('input[required],textarea[required]'))input.setCustomValidity(input.value.trim()?'':'Please complete this field.');
      if(!form.reportValidity())return;
      const data=Object.fromEntries(new FormData(form));for(const key in data)data[key]=String(data[key]).trim();
      preparedBody=`Hello Barq Cargo,\n\nI would like to enquire about ${data.service}.\n\nName: ${data.name}\nCompany: ${data.company||'Not provided'}\nEmail: ${data.email}\nPhone: ${data.phone||'Not provided'}\nOrigin: ${data.origin||'To be discussed'}\nDestination: ${data.destination||'To be discussed'}\n\nCargo requirements:\n${data.message}\n\nThank you,\n${data.name}`;
      document.querySelector('#enquiry-preview').textContent=preparedBody;
      document.querySelector('#send-enquiry').href=`mailto:info@barqcargo.com?subject=${encodeURIComponent('Freight enquiry: '+data.service)}&body=${encodeURIComponent(preparedBody)}`;
      result.hidden=false;document.querySelector('#copy-status').textContent='';result.focus({preventScroll:true});result.scrollIntoView({behavior:isPaused()?'instant':'smooth',block:'center'});
    });
    document.querySelector('.copy-enquiry')?.addEventListener('click',async()=>{
      const status=document.querySelector('#copy-status');
      try{await navigator.clipboard.writeText(preparedBody);status.textContent='Copied. Paste the enquiry into your preferred email service.';}catch{status.textContent='Select and copy the enquiry text above, then email it to info@barqcargo.com.';}
    });
  }
  setMotion();
  intro();
  window.BarqReady=true;
})();
