import {cfg} from './config.js';
let ctx;
function tone(f,d=.12,type='sine',v=.08,f2){if(!cfg.sound)return;ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain(),n=ctx.currentTime;o.type=type;o.frequency.setValueAtTime(f,n);if(f2)o.frequency.linearRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g).connect(ctx.destination);o.start();o.stop(n+d)}
export const ready=()=>{tone(440,.15,'sine',.08,880);setTimeout(()=>tone(880,.2),150)};
export const select=()=>tone(660,.08,'square',.04);
export const nav=()=>tone(520,.15,'triangle',.08,780);
export const lost=()=>tone(300,.3,'sawtooth',.05,160);
