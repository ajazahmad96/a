import {cfg} from './config.js';
import {clamp} from './utils.js';
export class Cursor{
 constructor(el){this.el=el;this.x=innerWidth/2;this.y=innerHeight/2;this.vis=false}
 map(p){const [x0,y0,x1,y1]=cfg.area;let u=((1-p.x)-x0)/(x1-x0),v=(p.y-y0)/(y1-y0);
  u=clamp(.5+(u-.5)*cfg.sens,0,1);v=clamp(.5+(v-.5)*cfg.sens,0,1);return{x:u*innerWidth,y:v*innerHeight}}
 update(p){const t=this.map(p),d=Math.hypot(t.x-this.x,t.y-this.y);
  if(d<cfg.dead*innerWidth)return;
  const a=clamp(cfg.smooth+cfg.accel*d/innerWidth*4,.05,1);
  this.x+=(t.x-this.x)*a;this.y+=(t.y-this.y)*a;this.draw()}
 draw(){this.el.style.transform=`translate(${this.x}px,${this.y}px)`}
 show(v){if(v!==this.vis){this.el.style.display=v?'block':'none';this.vis=v;if(v)this.draw()}}
}
