import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {Portal} from './portal.js';import {ParticleSystem} from './particle-system.js';import {GestureEngine} from './gesture-engine.js';
import {HandTracker} from './hand-tracking.js';import {AudioEngine} from './audio-engine.js';import {DESTINATIONS} from './destinations.js';
import {$,bindUI,msg,setProg,setConf} from './ui.js';

const canvas=$('c');let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});}catch(e){msg('WebGL is not available on this device.',99999);throw e;}
const low=/Android/i.test(navigator.userAgent)&&(navigator.hardwareConcurrency||4)<=8&&(navigator.deviceMemory||4)<=4;
const q={dpr:Math.min(devicePixelRatio||1,low?1.25:1.75),parts:low?220:420,bloom:true};
const scene=new THREE.Scene(),cam=new THREE.OrthographicCamera(0,1,1,0,-1,1);
const portal=new Portal(),parts=new ParticleSystem(450),audio=new AudioEngine();
portal.mesh.renderOrder=0;scene.add(portal.mesh,parts.points);
const composer=new EffectComposer(renderer),bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.9,.7,.55);
composer.addPass(new RenderPass(scene,cam));composer.addPass(bloom);

let W=0,H=0;
function resize(){W=innerWidth;H=innerHeight;renderer.setPixelRatio(q.dpr);renderer.setSize(W,H,false);composer.setPixelRatio(q.dpr);composer.setSize(W,H);bloom.resolution.set(W/2,H/2);
  cam.right=W;cam.top=H;cam.updateProjectionMatrix();parts.mat.uniforms.uDpr.value=q.dpr;parts.limit=q.parts;parts.cur%=q.parts;}
addEventListener('resize',resize);resize();
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;msg('Graphics context lost — restoring…');});
canvas.addEventListener('webglcontextrestored',()=>{paused=false;resize();msg('');});

const S={mode:'idle',prog:0,open:0,flash:0,t:0,cx:0,cy:0,R:0,dir:1,start:0,size:1,rot:0,input:'touch',closing:false};
const baseR=()=>Math.min(W,H)*.36*S.size;
let paused=false;
const eng=new GestureEngine({
  start(){S.mode='drawing';S.closing=false;$('hint').style.opacity=0;audio.init();},
  progress(p,i){S.prog=p;S.dir=i.dir;S.start=i.start;S.cx+=(i.cx-S.cx)*.5;S.cy+=(i.cy-S.cy)*.5;S.R+=(Math.max(i.r,40)-S.R)*.5;setProg(p);audio.setCharge(p);
    for(let k=0;k<4;k++){const a=Math.random()*6.28,s=40+Math.random()*160;parts.emit(i.x,i.y,Math.cos(a)*s,Math.sin(a)*s,.4+Math.random()*.8,3+Math.random()*7);}if(Math.random()<.3)audio.spark();},
  complete(i){S.cx=i.cx;S.cy=i.cy;S.R=Math.min(Math.max(i.r,Math.min(W,H)*.2),Math.min(W,H)*.45)*S.size;S.mode='activating';S.t=0;S.prog=1;setProg(1);audio.activate();
    for(let k=0;k<300;k++){const a=Math.random()*6.28,s=120+Math.random()*520;parts.emit(S.cx+Math.cos(a)*S.R,S.cy+Math.sin(a)*S.R,Math.cos(a)*s,Math.sin(a)*s,.6+Math.random()*1.4,3+Math.random()*9);}
    if(navigator.vibrate)navigator.vibrate(40);},
  cancel(){if(S.mode==='drawing')S.mode='fading';audio.setCharge(0);}
});
eng.sens=.6;

// ---- touch input (GL coords: y up)
let tid=null;
canvas.addEventListener('pointerdown',e=>{if(S.input!=='touch'||S.mode==='open'||S.mode==='activating'||tid!==null)return;tid=e.pointerId;canvas.setPointerCapture(tid);S.cx=e.clientX;S.cy=H-e.clientY;S.R=40;eng.begin(e.clientX,H-e.clientY);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==tid)return;for(const c of(e.getCoalescedEvents?.()||[e]))eng.move(c.clientX,H-c.clientY);});
const up=e=>{if(e.pointerId!==tid)return;tid=null;eng.end();};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);

// ---- camera input
const hand=new HandTracker($('cam'));
function onHand(r){
  setConf(r.conf||0,true);if(r.lost){if(eng.active)eng.end();return;}
  if(S.mode==='open'||S.mode==='activating')return;
  if(r.down){if(!eng.active&&!eng.done){S.cx=r.x;S.cy=H-r.y;S.R=40;eng.begin(r.x,H-r.y);}else eng.move(r.x,H-r.y);}else if(eng.active)eng.end();
}
async function setMode(m){
  if(m==='camera'){msg('Requesting camera… pinch thumb + index to draw in the air',5000);
    try{await hand.start(onHand);S.input='camera';$('bMode').textContent='CAMERA';$('cam').style.display='block';}
    catch(e){S.input='touch';$('bMode').textContent='TOUCH';msg('Camera unavailable: '+(e.name==='NotAllowedError'?'permission denied':e.message)+'. Touch mode active.',6000);}
  }else{hand.stop();S.input='touch';$('bMode').textContent='TOUCH';$('cam').style.display='none';setConf(0,false);}
}
function reset(){eng.reset();hand.down=false;Object.assign(S,{mode:'idle',prog:0,open:0,flash:0,closing:false});setProg(0);audio.close();$('hint').style.opacity=.55;}
bindUI({
  mode:()=>setMode(S.input==='touch'?'camera':'touch'),
  sound:()=>{audio.init();audio.setMuted(!audio.muted);$('bSnd').textContent=audio.muted?'SOUND OFF':'SOUND ON';},
  reset,close:()=>{if(S.mode==='open'||S.mode==='activating'){S.mode='closing';audio.close();}},
  sSize:v=>{S.size=v;if(S.mode==='open')S.R=baseR();},sRot:v=>S.rot=v,sSens:v=>eng.sens=v,sVol:v=>audio.setVol(v),
  sDest:v=>{portal.set({uDest:v});$('dest').textContent='DESTINATION: '+DESTINATIONS[v].name;}
});

// ---- loop
const ease=x=>1-Math.pow(1-Math.min(Math.max(x,0),1),3);let last=performance.now(),acc=0,frames=0,time=0,sparkT=0;
function frame(now){
  requestAnimationFrame(frame);if(paused)return;
  const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;
  // adaptive quality: sample 90 frames, step down if slow
  acc+=dt;if(++frames===90){const avg=acc/90;if(avg>.034){if(q.bloom){q.bloom=false;}else if(q.dpr>.8){q.dpr=Math.max(.8,q.dpr-.25);q.parts=Math.max(120,q.parts*.7|0);resize();}}acc=0;frames=0;}
  if(S.mode==='activating'){S.t+=dt;S.open=ease(S.t/2.6)*1.3;S.flash=Math.max(0,1-S.t/.9);if(S.t>2.6){S.mode='open';S.open=1.3;S.flash=0;}}
  else if(S.mode==='closing'){S.open-=dt*1.1;S.prog=Math.max(0,S.prog-dt*.5);if(S.open<=0){reset();}}
  else if(S.mode==='fading'){S.prog-=dt*1.2;setProg(Math.max(S.prog,0));if(S.prog<=0){reset();}}
  else if(S.mode==='drawing'&&!eng.active&&!eng.done){}
  const act=S.mode==='open'||S.mode==='activating'||S.mode==='closing';
  // ring sparks travel tangentially
  if(act||S.mode==='drawing'&&S.prog>.2){sparkT+=dt*(act?180:80*S.prog);while(sparkT>1){sparkT--;const a=Math.random()*6.28,R=S.R*(.97+Math.random()*.08),tx=-Math.sin(a)*S.dir,ty=Math.cos(a)*S.dir,s=60+Math.random()*220,o=Math.random()*60-10;
    parts.emit(S.cx+Math.cos(a)*R,S.cy+Math.sin(a)*R,tx*s+Math.cos(a)*o,ty*s+Math.sin(a)*o,.5+Math.random()*1.3,2+Math.random()*(Math.random()<.1?10:5));}}
  parts.update(dt);
  const R=(S.mode==='drawing'||S.mode==='fading'?Math.max(S.R,40):S.R)*(1+.12*S.flash)*(S.mode==='closing'?.6+.4*Math.min(S.open,1):1);
  portal.set({uCen:[S.cx*q.dpr,S.cy*q.dpr],uR:Math.max(R,1)*q.dpr,uTime:time,uProg:S.prog,uOpen:Math.max(S.open,0),uFlash:S.flash,uDir:S.dir,uStart:S.start,uRot:S.rot+time*.12,uFill:Math.min(S.prog*S.prog,1)});
  bloom.enabled=q.bloom;bloom.strength=.7+S.flash*1.6;
  composer.render(dt);
}
S.cx=innerWidth/2;S.cy=innerHeight/2;S.R=baseR();requestAnimationFrame(frame);
