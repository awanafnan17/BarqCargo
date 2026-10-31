/* Ocean playback, archived hero parallax and the reversible vessel narrative. */
(() => {
 'use strict';
 const motion=window.BarqMotion,{clamp,progress,damp}=window.BarqMath;
 const root=document.documentElement,hero=document.querySelector('.cinema-hero'),intro=document.querySelector('.intro-orbit');
 const top=el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y;};
 let heroTop=0,heroHeight=1,introTop=0,introHeight=1,viewport=innerHeight;
 let visible=true,blocked=false,tx=0,ty=0,mx=0,my=0,raf=0,last=0,scroll=window.scrollY,playPending=false,time=0;
 const video=hero?.querySelector('video'),media=hero?.querySelector('.cinema-media'),copy=hero?.querySelector('.cinema-content'),toggle=hero?.querySelector('.cinema-toggle'),partners=hero?.querySelector('.cinema-partners'),scene=hero?.querySelector('.cinema-scene'),ship=hero?.querySelector('.cinema-water-vessel');
 function measure(){viewport=innerHeight;if(hero){heroTop=top(hero.parentElement);heroHeight=hero.offsetHeight;hero.style.setProperty('--flight-top',`${copy.offsetTop+copy.offsetHeight+18}px`);}if(intro){introTop=top(intro);introHeight=intro.offsetHeight;}}
 function label(){
  if(!toggle)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,paused=motion.isPaused();
  toggle.disabled=reduced;
  const text=reduced?'Reduced motion':paused?'Resume motion':blocked?'Play background':'Pause motion';
  toggle.querySelector('.cinema-toggle-label').textContent=text;
  toggle.firstElementChild.textContent=paused||blocked?'▷':'Ⅱ';
  toggle.setAttribute('aria-label',text);toggle.setAttribute('aria-pressed',String(!paused&&!blocked));
 }
 function playback(){
  if(!video)return;
  video.muted=true;
  if(motion.isPaused()||!visible||document.hidden){video.pause();label();return;}
  if(!blocked&&!playPending&&video.paused){
   playPending=true;
   const attempt=video.play();
   if(attempt?.then)attempt.then(()=>{playPending=false;if(motion.isPaused()||!visible||document.hidden)video.pause();else hero.classList.add('is-playing');}).catch(error=>{playPending=false;if(error.name!=='AbortError')blocked=true;label();});
   else playPending=false;
  }
  label();
 }
 function paint(now){
  raf=0;const dt=last?Math.min(64,now-last):16;last=now;
  const paused=motion.isPaused();mx=paused?0:damp(mx,tx,dt);my=paused?0:damp(my,ty,dt);
  if(!paused)time+=dt/1000;
  if(hero){
   const p=paused?0:clamp((scroll-heroTop)/Math.max(1,heroHeight));
   const pose=window.BarqMath.heroPose(p,time,mx,my);
   media.style.transform=`translate3d(${-pose.mx}px,${pose.ocean*heroHeight-pose.my}px,0) scale(1.035)`;
   const stacked=innerWidth<=850;
   copy.style.transform=`translate3d(0,${pose.copy*copy.offsetHeight*(stacked?.18:1)}px,0)`;
   if(partners)partners.style.transform=`translate3d(0,${pose.partners*partners.offsetHeight*(stacked?.15:1)}px,0)`;
   if(ship)ship.style.transform=`translate3d(0,${pose.ship*heroHeight}px,0) scale(${pose.scale})`;
   if(scene){scene.barqProgress=p;scene.style.transform=`translate3d(0,${pose.ocean*heroHeight*(stacked?.12:1)}px,0)`;}
   hero.querySelector('.cinema-progress>span').style.transform=`scaleX(${p})`;
  }
  if(!paused&&visible&&!document.hidden)request();

 }
 function request(){if(!raf&&!document.hidden)raf=requestAnimationFrame(paint);}
 if(hero){
  hero.addEventListener('pointermove',event=>{
   if(event.pointerType!=='mouse'||motion.isPaused())return;
   const r=hero.getBoundingClientRect();tx=clamp((event.clientX-r.left)/r.width*2-1,-1,1);ty=clamp((event.clientY-r.top)/r.height*2-1,-1,1);
   request();
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{tx=ty=0;request();});
  toggle.addEventListener('click',()=>{
   if(blocked&&!motion.isPaused()){blocked=false;playback();}
   else document.querySelector('.motion-toggle')?.click();
  });
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;playback();if(visible)request();},{threshold:0}).observe(hero);
  video.addEventListener('playing',()=>{hero.classList.add('is-playing');blocked=false;label();});
  video.addEventListener('error',()=>{blocked=true;hero.classList.remove('is-playing');toggle.hidden=true;});
 }
 document.addEventListener('barq:layout',measure);
 document.addEventListener('barq:motionchange',()=>{measure();playback();request();});
 document.addEventListener('visibilitychange',()=>{playback();if(!document.hidden)request();});
 window.addEventListener('pageshow',playback);
 document.addEventListener('barq:frame',({detail})=>{
  scroll=detail.scroll;request();
  if(intro){
   const p=motion.isPaused()||root.classList.contains('compact-vault')?0:progress(scroll,introTop,introHeight,viewport);
   intro.querySelector('[data-archive-scene]').barqProgress=p;
   intro.querySelector('.intro-orbit-copy').style.transform=`translate3d(${-p*12}px,${-p*18}px,0)`;
   const caption=intro.querySelector('.intro-orbit-caption'),part=Math.min(2,Math.floor(p*3));
   caption.querySelector('span').textContent=`0${part+1} /`;
   caption.querySelector('strong').textContent=['Care in every detail.','Connected, from every angle.','Ready for what comes next.'][part];
   intro.querySelector('.intro-orbit-progress>span').style.transform=`scaleX(${p})`;
  }
 });
 document.querySelectorAll('.cinema-partners li').forEach((item,i)=>{
  item.style.setProperty('--partner-i',i);const img=item.querySelector('img');
  const loaded=()=>{if(img.naturalWidth>0)item.classList.add('logo-ready');};img.addEventListener('load',loaded);img.addEventListener('error',()=>item.classList.remove('logo-ready'));if(img.complete)loaded();
 });
 measure();playback();motion.refresh();
})();
