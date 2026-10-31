'use strict';
const assert=require('node:assert/strict');
const {vesselPose,heroPose}=require('../dist/motion-math.js');
for(const page of ['story','about','services']){
 const samples=Array.from({length:401},(_,i)=>vesselPose(i/400,2.5,.4,-.2,0,1.2,page));
 for(let i=400;i>=0;i--)assert.deepEqual(vesselPose(i/400,2.5,.4,-.2,0,1.2,page),samples[i]);
 assert.notDeepEqual(vesselPose(0,0,0,0,0,1,page),vesselPose(0,2,0,0,0,1,page));
 assert.notDeepEqual(vesselPose(0,2,-1,-1,0,1,page),vesselPose(0,2,1,1,0,1,page));
 for(const aspect of [.35,.6,1.2,2.3])for(const p of [0,.25,.5,.75,1]){
  const result=vesselPose(p,5,1,-1,3,aspect,page);
  assert.ok(Object.values(result).flat().every(Number.isFinite));assert.ok(result.eye[1]>0);
 }
}
const a=vesselPose(0,0).eye,b=vesselPose(.5,0).eye,c=vesselPose(1,0).eye;
assert.ok(Math.hypot(a[0]-b[0],a[2]-b[2])>30);assert.ok(Math.hypot(b[0]-c[0],b[2]-c[2])>30);assert.ok(b[1]>a[1]+9);
assert.ok(Math.abs(Math.hypot(...a)-Math.hypot(...b))<1e-8,'Orbiting keeps a stable camera distance instead of shrinking the ship');
for(let i=0;i<=1000;i++){
 const p=i/1000,pose=heroPose(p,4,.5,.5);assert.deepEqual(pose,heroPose(p,4,.5,.5));
 assert.ok(pose.ocean>=0&&pose.copy<=0&&pose.partners<=0,'Background and type travel in opposing directions');
}
assert.notEqual(heroPose(0,0).ship,heroPose(0,2).ship,'The vessel moves while the hero stands still');
console.log('Passed: reversible vessel orbit, pointer and keyboard-turn poses, idle motion and hero underlap parallax.');
