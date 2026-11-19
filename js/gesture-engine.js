import {cfg} from './config.js';
import {dist} from './utils.js';
import {size,fingers,center} from './landmarks.js';
export class GestureEngine{
 constructor(on){this.on=on;this.cur='NONE';this.cand='NONE';this.candT=0;this.pinch=false;this.last={};this.hist=[];this.palmT=0;this.palmDone=false;this.conf=0}
 cool(k,t){if(t-(this.last[k]||-1e9)<cfg.cool)return false;this.last[k]=t;return true}
 update(l,score,t,paused,locked){
  const f=fingers(l),r=dist(l[4],l[8])/size(l);
  this.pinch=this.pinch?r<cfg.pinchOff:r<cfg.pinchOn;
  const n=+f.index+ +f.middle+ +f.ring+ +f.pinky;
  const raw=this.pinch?'PINCH':(f.index&&!f.middle&&!f.ring&&!f.pinky)?'POINT':(f.index&&f.middle&&!f.ring&&!f.pinky)?'TWO':n===4?'PALM':n===0?'FIST':'NONE';
  if(raw!==this.cand){this.cand=raw;this.candT=t}
  const stable=t-this.candT>=cfg.hold,prev=this.cur;if(stable)this.cur=raw;
  this.conf=Math.round(score*100*(stable?1:.6));
  const c=center(l);this.hist.push({x:1-c.x,t});while(this.hist.length&&t-this.hist[0].t>400)this.hist.shift();
  const dx=this.hist.length>3?this.hist.at(-1).x-this.hist[0].x:0,speedy=Math.abs(dx)>.12;
  if(this.cur==='PALM'&&!speedy){if(!this.palmT)this.palmT=t;if(!this.palmDone&&t-this.palmT>900){this.palmDone=true;this.on('palm',t)}}else{this.palmT=0;if(this.cur!=='PALM')this.palmDone=false}
  if(paused||locked)return{g:this.cur,pinch:false,conf:this.conf};
  if(this.cur!==prev){if(this.cur==='TWO'&&this.cool('two',t))this.on('two',t);if(this.cur==='FIST'&&this.cool('fist',t))this.on('fist',t)}
  if(Math.abs(dx)>.3&&(this.cur==='PALM'||this.cur==='NONE')&&this.cool('swipe',t)){this.on('swipe',t,dx>0?1:-1);this.hist=[];this.palmT=0}
  return{g:this.cur,pinch:this.pinch&&(this.cur==='PINCH'||this.cur==='POINT'),conf:this.conf}}
}
