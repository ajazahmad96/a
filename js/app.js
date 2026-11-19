import {cfg,save} from './config.js';
import {$,toast} from './utils.js';
import * as cam from './camera.js';
import * as trk from './hand-tracker.js';
import {draw} from './landmarks.js';
import {GestureEngine} from './gesture-engine.js';
import {Cursor} from './cursor-controller.js';
import {Interaction} from './interaction-engine.js';
import {Calibration} from './calibration.js';
import {Perf} from './performance.js';
import * as au from './audio.js';
import * as hud from './dashboard.js';
const S=['dashboard','panel','present','calib','settings','about'],video=$('#video'),cv=$('#overlay'),cx=cv.getContext('2d');
const cur=new Cursor($('#cursor')),ia=new Interaction(cur),cal=new Calibration(),perf=new Perf();
let paused=false,locked=false,running=false,lastV=-1,lost=0,warned=false,scr='dashboard',slide=0,clicks=0;
const SL=['<h3>STARK GESTURE INTERFACE</h3>Control a computer with your hands. No touching.','<h3>1. SEE</h3>The webcam captures video frames.','<h3>2. LOCATE</h3>A neural network finds 21 landmarks on each hand.','<h3>3. UNDERSTAND</h3>Our code measures finger distances to recognise gestures.','<h3>4. ACT</h3>Gestures become clicks, drags and navigation. All local, nothing uploaded.'];
const log=m=>{const li=document.createElement('li');li.textContent=m;$('#bootlog').append(li)};
function go(s){scr=s;S.forEach(x=>$('#'+x).classList.toggle('on',x===s));document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.go===s));$('#camBox').classList.toggle('big',s==='dashboard');if(s==='present')showSlide(0)}
function showSlide(i){slide=Math.max(0,Math.min(SL.length-1,i));$('#slide').innerHTML=SL[slide];$('#sNum').textContent=`${slide+1} / ${SL.length}`}
function step(d){au.nav();if(scr==='present'){showSlide(slide+d);return}go(S[(S.indexOf(scr)+d+S.length)%S.length])}
function setPaused(p){paused=p;$('#panicBtn').textContent=p?'▶ RESUME':'⏸ PAUSE';if(p){ia.release();cur.show(false)}toast(p?'Gesture control PAUSED':'Gesture control ACTIVE')}
function setLock(l){locked=l;$('#lockBtn').textContent=l?'🔒 LOCKED':'🔓 LOCK';if(l)ia.release();toast(l?'Interaction locked':'Interaction unlocked')}
const ge=new GestureEngine((k,t,d)=>{
 if(k==='palm'){setPaused(!paused);return}
 if(k==='two'&&cfg.two!=='none')step(cfg.two==='next'?1:-1);
 if(k==='fist'){if(cfg.fist==='pause')setPaused(true);else if(cfg.fist!=='none')step(cfg.fist==='next'?1:-1)}
 if(k==='swipe')step(d>0?-1:1)});
function handsOf(r){const o=[];(r.landmarks||[]).forEach((l,i)=>{const h=r.handedness?.[i]?.[0];if(cfg.hand==='any'||(h&&h.categoryName===cfg.hand))o.push({l,s:h?h.score:.9})});return o}
function frame(now){
 if(!running)return;requestAnimationFrame(frame);
 if(perf.tick(now)){hud.set('hFps',perf.fps);hud.set('hInf',perf.inf.toFixed(1)+' ms');if(perf.degraded()&&perf.skip===1){document.body.classList.add('fxlow');perf.skip=2;toast('Low performance: effects reduced')}}
 if(video.readyState<2||video.currentTime===lastV)return;lastV=video.currentTime;
 if(perf.skip>1&&(++perf.n%perf.skip))return;
 if(cv.width!==video.videoWidth){cv.width=video.videoWidth;cv.height=video.videoHeight}
 const t0=performance.now();let r;try{r=trk.detect(video,t0)}catch(e){return}perf.infer(performance.now()-t0);
 const hs=handsOf(r);hud.set('hHands',hs.length);
 draw(cx,hs.map(h=>h.l),cv.width,cv.height);
 if(!hs.length){if(++lost>10){hud.set('hState','NO HAND');hud.set('hGest','—');hud.set('hConf','0%');cur.el.classList.add('lost');ia.release();if(!warned){warned=true;au.lost()}}return}
 lost=0;warned=false;cur.el.classList.remove('lost');
 const{l,s}=hs[0],tip=l[8],g=ge.update(l,s,now,paused,locked);
 hud.set('hGest',g.g);hud.set('hConf',g.conf+'%');hud.set('hState',paused?'PAUSED':locked?'LOCKED':'ACTIVE');
 if(cal.on){cal.feed(tip,now);return}
 if(paused){cur.show(false);return}
 cur.show(true);if(locked)return;
 cur.update(tip);ia.move();
 if(g.pinch){if(ia.press()==='click')au.select()}else ia.release()}
async function boot(){
 $('#startBtn').disabled=true;$('#bootErr').textContent='';
 try{
  if(!cam.supported())throw new Error('Unsupported browser or insecure page: camera API unavailable (use HTTPS or localhost).');
  log('Browser support OK');
  const c=document.createElement('canvas');if(!(c.getContext('webgl2')||c.getContext('webgl')))log('WebGL unavailable: using CPU fallback');
  log('Loading hand model…');try{await trk.load()}catch(e){throw new Error('Model loading failed (check internet connection): '+e.message)}
  log('Model ready');log('Starting camera…');await startCam();log('Camera active');
  au.ready();$('#boot').classList.remove('on');$('#top').hidden=false;$('#app').hidden=false;go('dashboard');
 }catch(e){$('#bootErr').textContent=cam.explain(e);$('#startBtn').disabled=false;$('#startBtn').textContent='RETRY'}}
async function startCam(){
 await cam.start(video,$('#camSel').value||undefined,cfg.res);
 const d=await cam.list(),sel=$('#camSel'),v=sel.value;sel.innerHTML=d.map((x,i)=>`<option value="${x.deviceId}">${x.label||'Camera '+(i+1)}</option>`).join('');if(v)sel.value=v;
 $('#camBox').classList.add('show');$('#camDot').textContent='● CAM ON';$('#camDot').classList.add('on');running=true;requestAnimationFrame(frame)}
function stopCam(){running=false;cam.stop(video);$('#camBox').classList.remove('show');$('#camDot').textContent='● CAM OFF';$('#camDot').classList.remove('on');cur.show(false);ia.release();toast('Camera stopped')}
$('#startBtn').onclick=boot;
$('#nav').innerHTML=S.map(s=>`<button class="btn sm gc" data-go="${s}">${s.toUpperCase()}</button>`).join('');
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go)});
$('#stopBtn').onclick=()=>running?stopCam():startCam().catch(e=>toast(cam.explain(e)));
$('#panicBtn').onclick=()=>setPaused(!paused);$('#lockBtn').onclick=()=>setLock(!locked);
$('#camSel').onchange=()=>startCam().catch(e=>toast(cam.explain(e)));
$('#prev').onclick=()=>showSlide(slide-1);$('#next').onclick=()=>showSlide(slide+1);
$('#fs').onclick=()=>$('#present').requestFullscreen?.();
$('#cStart').onclick=()=>cal.start();$('#cReset').onclick=()=>cal.reset();
let on=false;$('#b1').onclick=e=>{on=!on;e.target.textContent='ARC REACTOR: '+(on?'ON':'OFF');e.target.classList.toggle('active',on)};
$('#b2').onclick=e=>{e.target.textContent='CLICKS: '+(++clicks)};$('#b3').onclick=()=>step(1);
document.querySelectorAll('[data-cfg]').forEach(el=>{const k=el.dataset.cfg;el.value=String(cfg[k]);el.oninput=()=>{let v=el.value;if('num' in el.dataset||el.type==='range')v=+v;if('bool' in el.dataset)v=v==='true';cfg[k]=v;save();if(k==='fx')document.body.classList.toggle('fxlow',v==='low');if(k==='res'&&running)startCam()}});
document.body.classList.toggle('fxlow',cfg.fx==='low'||matchMedia('(max-width:700px)').matches);
document.querySelectorAll('.drag').forEach(el=>{el.onpointerdown=e=>{if(running&&cur.vis)return;const st=el.parentElement.getBoundingClientRect(),r=el.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;el.setPointerCapture(e.pointerId);el.onpointermove=m=>{el.style.left=m.clientX-st.left-ox+'px';el.style.top=m.clientY-st.top-oy+'px'};el.onpointerup=()=>{el.onpointermove=el.onpointerup=null}}});
addEventListener('pagehide',()=>{cam.stop(video);trk.close()});
