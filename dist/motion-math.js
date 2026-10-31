/* Pure, position-based motion: the same scroll position always yields the same pose. */
(function(scope){
  'use strict';
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const progress=(scroll,top,height,viewport)=>clamp((scroll-top)/Math.max(1,height-viewport));
  const smooth=n=>{const p=clamp(n);return p*p*(3-2*p);};
  const segment=(p,start,end)=>smooth((p-start)/(end-start));
  function journeyPose(p){
    p=clamp(p);
    // Two component passes, followed by the title and three company cards.
    const big=clamp((p-.10)/.23),fleet=clamp((p-.38)/.23);
    return {big,fleet,network:clamp((p-.64)/.34),nav:1-segment(p,.58,.64)};
  }
  function shipWipe(p,viewport,width,gap=0){
    const x=-clamp(p)*(viewport+width+gap),front=viewport+x,back=front+width;
    return {x,front,back,before:clamp(front/viewport),after:clamp(back/viewport)};
  }
  function heroPose(p,time,mx=0,my=0){
    p=clamp(p);mx=clamp(mx,-1,1);my=clamp(my,-1,1);
    return {ocean:p*.15,copy:-p*.65,partners:-p*1.2,ship:Math.sin(time)*.009,scale:1+Math.sin(time)*.008,mx:mx*10,my:my*7};
  }
  function networkOffset(p,stops){
    if(stops.length<2)return stops[0]||0;
    const phase=cataloguePosition(p,stops.length),i=Math.min(stops.length-2,Math.floor(phase));
    return stops[i]+(stops[i+1]-stops[i])*(phase-i);
  }
  function kiteFit(width,height,size){
    const [x,y,z]=size,fill=.74,aspect=width/Math.max(1,height);
    return Math.min(fill*width/Math.max(1,x+fill*aspect*z/2),fill*height/Math.max(1,y+fill*z/2));
  }
  function vesselPose(p,time,mx=0,my=0,turn=0,aspect=1,context='story'){
    p=clamp(p);const story=context==='story',angle=(context==='services'?2.55:context==='about'?-.65:.7)+(story?p*4.6:p*.55)+turn+clamp(mx,-1,1)*.18+Math.sin(time*.25)*.035;
    const fit=Math.max(1,.96/Math.max(.3,aspect)),r=(story?22.6:22.2)*fit;
    const elevation=(story?.34+Math.sin(p*Math.PI)*.62:.40)+clamp(my,-1,1)*.045;
    const horizontal=Math.cos(elevation)*r;
    return {eye:[Math.sin(angle)*horizontal,Math.sin(elevation)*r,Math.cos(angle)*horizontal],roll:Math.sin(time*.55)*.006,bob:Math.sin(time*.7)*.022};

  }
  function cataloguePosition(p,count=4){
    if(count<=1)return 0;
    const phase=clamp(p)*(count-1),whole=Math.floor(phase);
    return Math.min(count-1,whole+segment(phase-whole,.15,.85));
  }
  function cardPose(index,center,width){
    const d=index-center,a=Math.abs(d);
    return {x:d*width*.82,y:Math.pow(a,1.4)*17,z:95-a*115,ry:-d*12,rz:d*7,rx:-2+a*1.4,opacity:clamp(1-Math.max(0,a-2.8)*.3,.12,1),layer:100-Math.round(a*10)};
  }
  const damp=(current,target,dt)=>current+(target-current)*(1-Math.exp(-Math.min(dt,64)/85));
  const api={clamp,progress,smooth,segment,journeyPose,shipWipe,heroPose,vesselPose,networkOffset,kiteFit,cataloguePosition,cardPose,damp};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else scope.BarqMath=api;
})(typeof window!=='undefined'?window:globalThis);
