'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class Events{constructor(){this.handlers={};}addEventListener(name,fn){(this.handlers[name]??=[]).push(fn);}fire(name,detail={}){for(const fn of this.handlers[name]||[])fn(detail);}}
class Classes{constructor(){this.values=new Set();}add(v){this.values.add(v);}remove(v){this.values.delete(v);}contains(v){return this.values.has(v);}}
const style=()=>({setProperty(k,v){this[k]=v;}});
async function run(){
 let paused=false,reduced=false,observer,plays=0,pauses=0;
 const video=new Events();Object.assign(video,{paused:true,muted:false,play(){plays++;this.paused=false;return Promise.resolve();},pause(){pauses++;this.paused=true;}});
 const label={textContent:''},toggle=new Events();Object.assign(toggle,{firstElementChild:{},querySelector:()=>label,setAttribute(){}});
 const media={style:style()},copy={style:style(),offsetTop:135,offsetHeight:500},progress={style:style()};
 const hero=new Events();Object.assign(hero,{offsetTop:0,offsetHeight:800,offsetParent:null,parentElement:{offsetTop:0,offsetParent:null},style:style(),classList:new Classes(),querySelector:s=>({'video':video,'.cinema-media':media,'.cinema-content':copy,'.cinema-toggle':toggle,'.cinema-progress>span':progress}[s]),getBoundingClientRect:()=>({left:0,top:0,width:1280,height:800})});
 const document=new Events();Object.assign(document,{hidden:false,querySelectorAll:()=>[],documentElement:{classList:new Classes()},querySelector:s=>s==='.cinema-hero'?hero:s==='.motion-toggle'?{click(){paused=!paused;document.fire('barq:motionchange');}}:null});
 const window=new Events();Object.assign(window,{scrollY:0,BarqMath:require('../dist/motion-math.js'),BarqMotion:{isPaused:()=>paused||reduced,refresh(){}}});
 const context={window,document,innerHeight:800,innerWidth:1280,matchMedia:()=>({matches:reduced}),IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}},requestAnimationFrame:()=>1,console};
 vm.runInNewContext(fs.readFileSync('dist/hero-experience.js','utf8'),context);
 await Promise.resolve();assert.equal(plays,1);assert.equal(video.muted,true);assert.equal(video.paused,false);
 observer([{isIntersecting:false}]);assert.equal(video.paused,true,'Offscreen films must stop');
 observer([{isIntersecting:true}]);await Promise.resolve();assert.equal(video.paused,false);
 document.hidden=true;document.fire('visibilitychange');assert.equal(video.paused,true);
 document.hidden=false;document.fire('visibilitychange');await Promise.resolve();assert.equal(video.paused,false);
 toggle.fire('click');assert.equal(paused,true);assert.equal(video.paused,true);assert.equal(label.textContent,'Resume motion');
 toggle.fire('click');await Promise.resolve();assert.equal(video.paused,false);
 reduced=true;document.fire('barq:motionchange');assert.equal(video.paused,true);assert.equal(toggle.disabled,true);assert.equal(label.textContent,'Reduced motion');
 reduced=false;video.play=function(){plays++;return Promise.reject(Object.assign(new Error('Blocked'),{name:'NotAllowedError'}));};
 document.fire('barq:motionchange');await Promise.resolve();await Promise.resolve();assert.equal(label.textContent,'Play background');
 video.play=function(){plays++;this.paused=false;return Promise.resolve();};toggle.fire('click');await Promise.resolve();assert.equal(video.paused,false);
 assert.ok(pauses>=4);
 console.log('Passed: silent autoplay, offscreen/hidden pause, resume, reduced motion and blocked-autoplay recovery.');
}
run().catch(e=>{console.error(e);process.exit(1);});
