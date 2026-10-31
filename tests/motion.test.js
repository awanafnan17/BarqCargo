'use strict';
const assert=require('node:assert/strict');
const {progress,journeyPose,shipWipe,networkOffset,cataloguePosition,cardPose,damp}=require('../dist/motion-math.js');
// Endpoint clamping and chapter holds are navigation contracts, not time effects.
assert.equal(progress(0,400,2000,800),0);
assert.equal(progress(3000,400,2000,800),1);
assert.deepEqual(journeyPose(-1),journeyPose(0));
assert.deepEqual(journeyPose(2),journeyPose(1));
assert.equal(journeyPose(.09).big,0);
assert.equal(journeyPose(.34).big,1);
assert.equal(journeyPose(.37).fleet,0);
assert.equal(journeyPose(.62).fleet,1);
assert.equal(journeyPose(.64).network,0);
assert.equal(journeyPose(.99).network,1);
assert.equal(journeyPose(1).nav,0);
// Fleet and text geometry across representative mobile and desktop widths.
for(const width of [320,390,768,1440,1920])for(let i=0;i<=1000;i++){
 const pose=journeyPose(i/1000),fleetWidth=width*(width<=600?2.67:1.208);
 const right=width-pose.fleet*(width+fleetWidth+70)+fleetWidth;
 const textX=Math.max(0,right+45);
 if(pose.network>0){assert.equal(pose.big,1);assert.equal(pose.fleet,1);assert.ok(right<0);assert.equal(textX,0);}
 if(pose.big<1)assert.equal(pose.fleet,0);
}
// A letter beneath any part of the opaque ship track cannot be revealed.
for(const width of [320,390,768,1440,1920])for(const track of [width*.8,width*1.516,width*2.306]){
 for(let i=0;i<=1000;i++){
  const p=i/1000,result=shipWipe(p,width,track,70);
  assert.deepEqual(result,shipWipe(p,width,track,70),'Reverse scrolling has the identical mask edges');
  for(let letter=0;letter<=width;letter+=Math.max(1,width/37)){
   if(letter>result.front&&letter<result.back){
    assert.ok(letter>=result.before*width-1e-8,'Outgoing text is hidden beneath the solid track');
    assert.ok(letter<=result.after*width+1e-8,'Incoming text stays hidden until the trailing edge clears it');
   }
  }
 }
}
for(let i=0;i<4;i++)assert.equal(cataloguePosition(i/3,4),i);
assert.equal(cataloguePosition(.5,1),0);
const positions=Array.from({length:1001},(_,i)=>i/1000);
const forward=positions.map(p=>({journey:journeyPose(p),catalog:cataloguePosition(p),card:cardPose(2,p*5,300)}));
positions.slice().reverse().forEach((p,index)=>{
  const expected=forward[1000-index];
  assert.deepEqual(journeyPose(p),expected.journey,'Up-scroll must retrace the same chapter position');
  assert.equal(cataloguePosition(p),expected.catalog);
  assert.deepEqual(cardPose(2,p*5,300),expected.card);
});
for(let i=1;i<forward.length;i++){
  for(const key of ['big','fleet','network'])assert.ok(forward[i].journey[key]>=forward[i-1].journey[key]);
  assert.ok(forward[i].catalog>=forward[i-1].catalog);
  assert.ok(forward[i].journey.fleet-forward[i-1].journey.fleet<.005,'No jump at chapter boundaries');
}
// Unequal title/card widths still land every complete company card on its navigation stop.
for(const stops of [[0,320,650,975],[0,980,1420,1860],[0,1240,1830,2420]]){
 for(let i=0;i<stops.length;i++)assert.equal(networkOffset(i/(stops.length-1),stops),stops[i]);
 let last=0;const poses=positions.map(p=>networkOffset(p,stops));
 poses.forEach(x=>{assert.ok(x>=last&&x<=stops.at(-1));last=x;});
 positions.slice().reverse().forEach((p,i)=>assert.equal(networkOffset(p,stops),poses[1000-i]));
}
for(const dt of [8,16,32,64]){
  let down=0,up=1;
  for(let t=0;t<1500;t+=dt){down=damp(down,1,dt);up=damp(up,0,dt);assert.ok(down<=1&&up>=0);assert.ok(Math.abs(down+up-1)<1e-12);}
  assert.ok(down>.999&&up<.001);
}
console.log('Passed: 1,001 forward/reverse poses, two ship passes, trailing text, sequential title/company-card stops, service navigation and damping.');
