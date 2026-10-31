/* Archived vessel geometry, local dependencies and Barq materials. No source-site application code. */
(() => {
 'use strict';
 const nodes=[...document.querySelectorAll('[data-archive-scene]')];if(!nodes.length)return;
 const motion=window.BarqMotion,M=window.BarqMath,models=new Map(),scenes=[];
 let vendor,loader,draco,environment,containerPositions,branding,last=0,time=0,raf=0;
 function library(){
  if(!vendor)vendor=new Promise((resolve,reject)=>{
   if(window.BarqThree){resolve(window.BarqThree);return;}
   const script=document.createElement('script');script.src='/vendor/three-archive.js';script.onload=()=>resolve(window.BarqThree);script.onerror=reject;document.head.append(script);
  });return vendor;
 }
 function getModel(kind,T){
  if(!loader){draco=new T.DRACOLoader().setDecoderPath('/vendor/draco/').setDecoderConfig({type:'js'}).setWorkerLimit(1);loader=new T.GLTFLoader().setDRACOLoader(draco);}
  if(!models.has(kind))models.set(kind,loader.loadAsync(`/assets/vessels/${kind==='kite'?'hero-kite':'cargo-vessel-barq'}.glb`));return models.get(kind);
 }
 function backdrop(T){if(!environment)environment=new T.CubeTextureLoader().load(['px','nx','py','ny','pz','nz'].map(n=>`/assets/vessels/${n}.png`));return environment;}
 function hullBranding(T){if(!branding)branding=new T.TextureLoader().loadAsync('/assets/vessels/barqcargo-hull.svg').then(texture=>{texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;});return branding;}
 function positions(){if(!containerPositions)containerPositions=fetch('/assets/vessels/container-positions.json').then(r=>{if(!r.ok)throw Error('Container data unavailable');return r.json();});return containerPositions;}
 function paint(now){
  raf=0;if(document.hidden)return;const dt=last?Math.min(70,now-last):16;last=now;if(!motion.isPaused())time+=dt/1000;
  let running=false;
  for(const s of scenes){
   if(!s.ready||!s.visible||s.lost)continue;
   const paused=motion.isPaused(),p=paused?0:s.el.barqProgress||0;s.mx=M.damp(s.mx,paused?0:s.tx,dt);s.my=M.damp(s.my,paused?0:s.ty,dt);
   if(paused&&!s.dirty)continue;
   if(s.kind==='kite'){
    const bone=s.kiteRig.children[0],child=bone?.children[0];
    if(bone){bone.rotation.x=1.57-Math.abs(Math.sin(.8*time))*Math.PI/36;bone.rotation.y=-s.mx*.32+Math.cos(time*.4)*.10;bone.rotation.z=-s.mx*.22+Math.cos(time*.4)*.05;}
    if(child){child.rotation.x=-1.1400032464213996+Math.sin(4*time)*Math.PI/180;child.rotation.y=Math.sin(2*time)*Math.PI/45;child.rotation.z=Math.cos(2*time)*Math.PI/90;}
    fitKite(s);s.model.position.x=s.mx*s.width*.035;s.model.position.y=Math.sin(time)*s.height*.009+s.my*s.height*.012;
   }else{
    const pose=M.vesselPose(p,time,s.mx,s.my,s.turn,s.width/s.height,s.context);
    s.camera.position.set(...pose.eye);s.camera.lookAt(0,0,0);s.model.rotation.z=pose.roll;s.model.position.y=pose.bob;
    if(s.propellers)for(const prop of s.propellers)prop.rotation.x=time*2;
   }
   s.renderer.render(s.scene,s.camera);s.dirty=false;if(!paused)running=true;
  }
  if(running)raf=requestAnimationFrame(paint);
 }
 function request(){if(!raf&&!document.hidden)raf=requestAnimationFrame(paint);}
 function fitKite(s){
  // Recenter the full animated rig, then fit its nearest depth plane inside the canvas.
  s.model.position.set(0,0,0);s.model.scale.setScalar(1);s.kitePivot.position.set(0,0,0);s.model.updateMatrixWorld(true);
  s.kiteBounds.setFromObject(s.kiteRig);s.kiteBounds.getCenter(s.kiteCenter);s.kiteBounds.getSize(s.kiteSize);
  s.kitePivot.position.copy(s.kiteCenter).multiplyScalar(-1);
  s.model.scale.setScalar(M.kiteFit(s.width,s.height,s.kiteSize.toArray()));
 }
 function measure(s){
  s.width=s.el.clientWidth;s.height=s.el.clientHeight;if(!s.width||!s.height)return;
  s.renderer.setSize(s.width,s.height,false);s.camera.aspect=s.width/s.height;
  if(s.kind==='kite'){
   s.camera.fov=360*Math.atan(.5)/Math.PI;s.camera.position.set(0,0,s.height);s.camera.lookAt(0,0,0);
   fitKite(s);
  }
  s.camera.updateProjectionMatrix();s.dirty=true;request();
 }
 function createVessel(model,T,coords,brandTexture){
  const painted=(color,roughness=.32,metalness=.3)=>new T.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.32,clearcoatRoughness:.27,envMapIntensity:.8,side:T.DoubleSide});
  const shipMaterials={navy:painted('#062b51',.3,.4),white:painted('#e8f1f8',.42,.22),gold:painted('#efa921',.34,.26),blue:painted('#1365a1',.34,.36),dark:painted('#233a4b',.38,.65)};
  const bases={},props=[];
  model.traverse(mesh=>{
   const n=mesh.name;
   if(/logo/i.test(n)||n.startsWith('Ship_Anten')||n.startsWith('Ship-wire')){mesh.visible=false;return;}
   if(!mesh.isMesh)return;
   if(n==='Ship_Logo'||n==='Ship_Wire'||n==='Parachute'||n.startsWith('PipeTe')||n.startsWith('Tech-')){mesh.visible=false;return;}
   if(n.includes('Container')){bases[n.includes('Large')?'big':'small']=mesh;mesh.visible=false;return;}
   mesh.material=n==='Ship_3'?shipMaterials.gold:n==='Ship_1'||n==='Ship_Tower'?shipMaterials.white:n==='Ship_Blue'?shipMaterials.blue:n==='Ship_2'?shipMaterials.navy:shipMaterials.dark;
   mesh.castShadow=true;mesh.receiveShadow=true;
   if(n==='PropellerL'||n==='PropellerR')props.push(mesh);
  });
  for(const [kind,points] of Object.entries(coords)){
   const base=bases[kind];if(!base)continue;
   const instance=new T.InstancedMesh(base.geometry,shipMaterials.white,points.length),matrix=new T.Matrix4(),color=new T.Color();
   points.forEach((pos,i)=>{matrix.compose(new T.Vector3(pos.x,pos.y,pos.z),base.quaternion,base.scale);instance.setMatrixAt(i,matrix);instance.setColorAt(i,color.set(['#dbe7ef','#0e4c80','#efa921','#146bad','#dbe7ef','#0e4c80','#6792b3'][((i%8)*3+Math.floor(i/24)*2)%7]));});
   instance.castShadow=true;instance.receiveShadow=true;instance.instanceMatrix.needsUpdate=true;instance.instanceColor.needsUpdate=true;model.add(instance);
  }
  // Opaque painted plates fill the source hull's lettering cut-outs on both sides.
  // Matching paint and outward-facing normals make each plate part of the hull.
  const labelMaterial=shipMaterials.gold.clone();labelMaterial.color.set('#ffffff');labelMaterial.map=brandTexture;labelMaterial.side=T.FrontSide;labelMaterial.polygonOffset=true;labelMaterial.polygonOffsetFactor=-2;labelMaterial.polygonOffsetUnits=-2;
  for(const side of [-1,1]){
   const label=new T.Mesh(new T.PlaneGeometry(10.2,2.1),labelMaterial);label.name=side>0?'BarqCargo_Port':'BarqCargo_Starboard';label.position.set(11.1,7.04,side*7.245);label.rotation.y=side>0?0:Math.PI;label.receiveShadow=true;label.renderOrder=2;model.add(label);
  }
  model.updateMatrixWorld(true);const bounds=new T.Box3();model.traverse(o=>{if(o.isMesh&&o.visible)bounds.expandByObject(o);});
  const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3()),outer=new T.Group();model.position.sub(center);outer.add(model);outer.scale.setScalar(12/Math.max(size.x,size.z));return {model:outer,props,floor:(bounds.min.y-center.y)*outer.scale.x-.025};
 }
 async function start(s){
  if(s.started)return;s.started=true;
  try{
   const T=await library();if(!T)throw Error('Scene engine unavailable');
   s.renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});s.renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<=600?1.5:2));s.renderer.setClearColor(0x000000,0);s.renderer.toneMapping=T.ACESFilmicToneMapping;s.renderer.toneMappingExposure=1.04;s.renderer.useLegacyLights=false;s.renderer.shadowMap.enabled=true;s.renderer.shadowMap.type=T.PCFSoftShadowMap;s.renderer.outputColorSpace=T.SRGBColorSpace;
   const gltf=await getModel(s.kind,T);s.model=gltf.scene.clone(true);s.scene=new T.Scene();s.scene.environment=backdrop(T);
   s.scene.add(new T.HemisphereLight(0xe5f3ff,0x233c52,.8));const key=new T.DirectionalLight(0xfff5e5,3.6);key.position.set(-8,16,11);key.castShadow=s.kind==='vessel';key.shadow.mapSize.set(innerWidth<=600?1024:2048,innerWidth<=600?1024:2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:8,bottom:-8,near:.5,far:60});key.shadow.bias=-.00025;key.shadow.normalBias=.025;key.shadow.radius=3;s.scene.add(key);const rim=new T.DirectionalLight(0xd2e8ff,2);rim.position.set(14,7,-14);s.scene.add(rim);const fill=new T.DirectionalLight(0xffffff,.55);fill.position.set(-14,3,-9);s.scene.add(fill);
   if(s.kind==='kite'){
    const gold=new T.MeshPhysicalMaterial({color:'#f7b526',roughness:.4,metalness:.12,clearcoat:.15,side:T.DoubleSide}),line=new T.MeshStandardMaterial({color:'#a5becf',roughness:.5,metalness:.65});
    s.model.traverse(o=>{if(o.isMesh)o.material=o.name==='kite'||o.name==='chamfer'?gold:line;});
    s.kiteRig=s.model;s.kitePivot=new T.Group();s.kitePivot.add(s.kiteRig);s.model=new T.Group();s.model.add(s.kitePivot);s.kiteBounds=new T.Box3();s.kiteCenter=new T.Vector3();s.kiteSize=new T.Vector3();
   }else{const [coords,brand]=await Promise.all([positions(),hullBranding(T)]);const ship=createVessel(s.model,T,coords,brand);s.model=ship.model;s.propellers=ship.props;const ground=new T.Mesh(new T.PlaneGeometry(38,38),new T.ShadowMaterial({color:0x063456,opacity:s.context==='story'?.22:.3}));ground.name='VesselShadowSurface';ground.rotation.x=-Math.PI/2;ground.position.y=ship.floor;ground.receiveShadow=true;ground.userData.sceneSurface=true;s.scene.add(ground);}
   s.scene.add(s.model);s.camera=new T.PerspectiveCamera(s.kind==='kite'?53:34,1,.1,10000);
   s.el.append(s.renderer.domElement);s.renderer.domElement.setAttribute('aria-hidden','true');s.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();s.lost=true;s.el.classList.remove('scene-ready');});s.renderer.domElement.addEventListener('webglcontextrestored',()=>{s.lost=false;s.dirty=true;s.el.classList.add('scene-ready');request();});
   measure(s);s.ready=true;s.dirty=true;s.el.classList.add('scene-ready');request();
  }catch(error){s.el.classList.add('scene-unavailable');s.renderer?.dispose();}
 }
 for(const el of nodes){
  const s={el,kind:el.dataset.archiveScene,context:el.dataset.scenePage,visible:false,started:false,ready:false,dirty:true,tx:0,ty:0,mx:0,my:0,turn:0};scenes.push(s);
  const area=el.closest('.cinema-hero')||el;let drag=false,dragX=0;
  area.addEventListener('pointermove',e=>{if(motion.isPaused())return;const r=area.getBoundingClientRect();s.tx=M.clamp((e.clientX-r.left)/r.width*2-1,-1,1);s.ty=M.clamp((e.clientY-r.top)/r.height*2-1,-1,1);if(drag){s.turn+=(e.clientX-dragX)*.006;dragX=e.clientX;}s.dirty=true;request();},{passive:true});
  area.addEventListener('pointerleave',()=>{s.tx=s.ty=0;drag=false;s.dirty=true;request();});
  if(s.context==='story'){
   el.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;drag=true;dragX=e.clientX;el.setPointerCapture(e.pointerId);});el.addEventListener('pointerup',()=>{drag=false;});el.addEventListener('pointercancel',()=>{drag=false;});
   el.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();s.turn+=(e.key==='ArrowLeft'?-1:1)*.35;s.dirty=true;request();}});
  }
  new IntersectionObserver(([entry])=>{s.visible=entry.isIntersecting;if(s.visible){start(s);s.dirty=true;request();}},{rootMargin:'140px'}).observe(el);
 }
 document.addEventListener('barq:layout',()=>{scenes.filter(s=>s.ready).forEach(measure);});
 document.addEventListener('barq:frame',()=>{scenes.forEach(s=>{s.dirty=true;});request();});
 document.addEventListener('barq:motionchange',()=>{last=0;scenes.forEach(s=>{s.dirty=true;});request();});
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else request();});
})();
