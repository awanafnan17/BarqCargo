/* Original BarqCargo WebGL scene. No external models or rendering dependencies. */
(() => {
  'use strict';
  const canvas = document.querySelector('#cargo-canvas');
  if (!canvas) return;
  const scene = document.querySelector('.cargo-story');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) { scene.classList.add('webgl-unavailable'); return; }
  const vertex = `attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColor; attribute vec2 aUv;
    uniform mat4 uProjection; uniform mat4 uView; uniform mat4 uModel;
    varying vec3 vNormal; varying vec3 vColor; varying vec3 vWorld; varying vec2 vUv;
    void main(){vec4 w=uModel*vec4(aPosition,1.0);vWorld=w.xyz;vNormal=mat3(uModel)*aNormal;vColor=aColor;vUv=aUv;gl_Position=uProjection*uView*w;}`;
  const fragment = `precision mediump float; varying vec3 vNormal; varying vec3 vColor; varying vec3 vWorld; varying vec2 vUv;
    uniform float uTextured; uniform sampler2D uTexture; uniform vec3 uEye;
    void main(){vec3 n=normalize(vNormal);vec3 l=normalize(vec3(-3.0,7.0,6.0));vec3 fill=normalize(vec3(5.0,2.0,-4.0));
    float diffuse=max(dot(n,l),0.0);float secondary=max(dot(n,fill),0.0);vec3 halfDir=normalize(l+normalize(uEye-vWorld));
    float spec=pow(max(dot(n,halfDir),0.0),40.0)*0.16;vec4 tex=texture2D(uTexture,vUv);vec3 base=mix(vColor,tex.rgb,uTextured);
    float light=0.48+diffuse*0.48+secondary*0.21;gl_FragColor=vec4(base*light+vec3(spec),mix(1.0,tex.a,uTextured));}`;
  function shader(type, source) { const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader compilation failed');return s; }
  let program;
  try { program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader linking failed'); }
  catch { scene.classList.add('webgl-unavailable');return; }
  gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  const loc={};for(const key of ['aPosition','aNormal','aColor','aUv'])loc[key]=gl.getAttribLocation(program,key);
  for(const key of ['uProjection','uView','uModel','uTextured','uTexture','uEye'])loc[key]=gl.getUniformLocation(program,key);
  const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
  function translate(x,y,z){const m=I();m[12]=x;m[13]=y;m[14]=z;return m;}
  function rotateY(a){const m=I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m;}
  function rotateX(a){const m=I(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m;}
  function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=(2*far*near)/(near-far);return m;}
  const normalize=a=>{const d=Math.hypot(...a);return a.map(v=>v/d);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function lookAt(eye,target){const z=normalize(eye.map((v,i)=>v-target[i])),x=normalize(cross([0,1,0],z)),y=cross(z,x),m=I();for(let i=0;i<3;i++){m[i*4]=x[i];m[i*4+1]=y[i];m[i*4+2]=z[i];}m[12]=-x.reduce((s,v,i)=>s+v*eye[i],0);m[13]=-y.reduce((s,v,i)=>s+v*eye[i],0);m[14]=-z.reduce((s,v,i)=>s+v*eye[i],0);return m;}
  const blue=[.035,.28,.53],ribBlue=[.055,.34,.63],darkBlue=[.018,.17,.32],gold=[1,.63,.09],steel=[.54,.63,.70],paper=[.84,.78,.62];
  function face(v,points,n,color){const uv=[[0,0],[1,0],[1,1],[0,1]];for(const i of [0,1,2,0,2,3])v.push(...points[i],...n,...color,...uv[i]);}
  function box(v,x,y,z,w,h,d,color){const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,f=z-d/2,g=z+d/2;
    face(v,[[a,c,g],[b,c,g],[b,e,g],[a,e,g]],[0,0,1],color);face(v,[[b,c,f],[a,c,f],[a,e,f],[b,e,f]],[0,0,-1],color);
    face(v,[[b,c,g],[b,c,f],[b,e,f],[b,e,g]],[1,0,0],color);face(v,[[a,c,f],[a,c,g],[a,e,g],[a,e,f]],[-1,0,0],color);
    face(v,[[a,e,g],[b,e,g],[b,e,f],[a,e,f]],[0,1,0],color);face(v,[[a,c,f],[b,c,f],[b,c,g],[a,c,g]],[0,-1,0],color);}
  function mesh(data){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return {buffer,count:data.length/11};}
  const shell=[];
  // Hollow container with individually modelled corrugations and corner castings.
  box(shell,0,-1.08,0,6.1,.15,2.3,darkBlue);box(shell,0,1.08,0,6.1,.12,2.3,blue);
  for(const z of [-1.1,1.1]){box(shell,0,0,z,6,2.15,.08,blue);for(let x=-2.88;x<3;x+=.22)box(shell,x,0,z, .08,2.04,.14,ribBlue);for(const y of [-1.06,1.06])box(shell,0,y,z,6.15,.10,.14,darkBlue);}
  box(shell,-3,0,0,.1,2.13,2.2,blue);for(let z=-1;z<1.1;z+=.2)box(shell,-3.06,0,z,.12,2.03,.07,ribBlue);
  for(let x=-2.9;x<3;x+=.23)box(shell,x,1.14,0,.08,.045,2.08,ribBlue);
  for(const x of [-3,3])for(const y of [-1.05,1.05])for(const z of [-1.1,1.1])box(shell,x,y,z,.21,.21,.21,gold);
  for(const x of [-2.98,2.98])for(const z of [-1.11,1.11])box(shell,x,0,z,.12,2.04,.13,darkBlue);
  // Cargo is visible when the paired doors swing open.
  for(const x of [1.3,2.25])for(const z of [-.48,.48])for(const y of [-.68,.05]){box(shell,x,y,z,.82,.65,.79,paper);box(shell,x,y+.329,z,.17,.008,.8,[.66,.53,.31]);}
  const doors=[];for(let side=0;side<2;side++){const v=[],sign=side===0?1:-1;box(v,0,0,sign*.52,.12,2.03,1.04,blue);for(let z=.13;z<1.04;z+=.18)box(v,.09,0,sign*z,.06,1.93,.08,ribBlue);for(const z of [.22,.80]){box(v,.14,0,sign*z,.055,1.95,.04,steel);box(v,.185,-.2,sign*z,.11,.08,.23,steel);}for(const y of [-.72,.72])box(v,.07,y,0,.16,.2,.12,steel);doors.push(mesh(v));}
  const shellMesh=mesh(shell);
  const label=[];face(label,[[-1.65,-.40,1.185],[1.6,-.40,1.185],[1.6,.47,1.185],[-1.65,.47,1.185]],[0,0,1],[1,1,1]);const labelMesh=mesh(label);
  const texCanvas=document.createElement('canvas');texCanvas.width=1024;texCanvas.height=256;const ctx=texCanvas.getContext('2d');
  ctx.fillStyle='#075095';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#ffffff';ctx.font='bold 136px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('BARQ CARGO',512,111);ctx.fillStyle='#ffb125';ctx.font='24px Arial';ctx.fillText('WHERE SPEED MEETS RELIABILITY',512,215);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,texCanvas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(loc.uTexture,0);
  function draw(m,model,textured=0){gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);const stride=44;for(const [k,size,offset] of [['aPosition',3,0],['aNormal',3,12],['aColor',3,24],['aUv',2,36]]){gl.enableVertexAttribArray(loc[k]);gl.vertexAttribPointer(loc[k],size,gl.FLOAT,false,stride,offset);}gl.uniformMatrix4fv(loc.uModel,false,model);gl.uniform1f(loc.uTextured,textured);gl.drawArrays(gl.TRIANGLES,0,m.count);}
  let w=0,h=0,active=true,raf=0,current=0,target=0,pointerX=0,pointerY=0,contextLost=false;
  const clamp=x=>Math.min(1,Math.max(0,x));
  const smooth=x=>x*x*(3-2*x);
  function size(){const r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.7);if(!r.width||!r.height)return;w=r.width;h=r.height;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);gl.viewport(0,0,canvas.width,canvas.height);request();}
  function scroll(){const r=scene.getBoundingClientRect();const span=Math.max(1,scene.offsetHeight-window.innerHeight);target=clamp(-r.top/span);request();}
  function paused(){return reduced.matches||document.documentElement.classList.contains('motion-paused');}
  function render(){raf=0;if(contextLost||!active||document.hidden||!w||!h)return;current=paused()?0.2:current+(target-current)*.095;const p=current,open=smooth(clamp((p-.4)/.5));
    const eye=w/h<.95?[9,6.5,13.5]:[7.7,5.2,10.7];gl.uniform3fv(loc.uEye,eye);gl.uniformMatrix4fv(loc.uProjection,false,perspective(35*Math.PI/180,w/h,.1,70));gl.uniformMatrix4fv(loc.uView,false,lookAt(eye,[0,0,0]));gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const angle=paused()?-.15:-.48+p*1.02+pointerX*.10;const model=mul(translate(0,.12+Math.sin(p*Math.PI)*.15,0),mul(rotateY(angle),rotateX(paused()?0:pointerY*.04)));
    draw(shellMesh,model);draw(labelMesh,model,1);
    for(let side=0;side<2;side++){const sign=side===0?1:-1;const hinge=mul(model,mul(translate(3.04,0,-sign*1.05),rotateY(sign*open*1.32)));draw(doors[side],hinge);}
    scene.style.setProperty('--cargo-progress',p.toFixed(4));
    const chapter=p<.34?0:p<.68?1:2;document.querySelectorAll('.cargo-chapter').forEach((el,i)=>el.classList.toggle('is-active',i===chapter));
    if(!paused()&&Math.abs(target-current)>.0006)request();
  }
  function request(){if(!raf&&active&&!document.hidden)raf=requestAnimationFrame(render);}
  canvas.addEventListener('pointermove',e=>{if(paused()||e.pointerType!=='mouse')return;const r=canvas.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;request();},{passive:true});canvas.addEventListener('pointerleave',()=>{pointerX=pointerY=0;request();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;scene.classList.remove('webgl-ready');scene.classList.add('webgl-unavailable');});
  const observer=new IntersectionObserver(([e])=>{active=e.isIntersecting;if(active){scroll();request();}},{rootMargin:'150px'});observer.observe(scene);
  new ResizeObserver(size).observe(canvas);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll,{passive:true});document.addEventListener('visibilitychange',request);document.addEventListener('barq:motionchange',()=>{scroll();request();});reduced.addEventListener('change',()=>{scroll();request();});
  scene.classList.add('webgl-ready');size();scroll();
})();
