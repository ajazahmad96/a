import {cfg,save,DEF} from './config.js';
import {$} from './utils.js';
const N=['TOP-LEFT','BOTTOM-RIGHT'];
export class Calibration{
 constructor(){this.on=false;this.pts=[];this.s=null}
 start(){this.on=true;this.pts=[];this.s=null;this.msg()}
 msg(){$('#cMsg').textContent=this.on?`Point at your ${N[this.pts.length]} comfortable reach and hold still…`:'Calibration complete. Area saved.';$('#cFill').style.width=this.pts.length*50+'%'}
 reset(){cfg.area=[...DEF.area];save();this.on=false;$('#cMsg').textContent='Area reset to default.';$('#cFill').style.width='0'}
 feed(p,t){if(!this.on)return;const q={x:1-p.x,y:p.y};
  if(!this.s||Math.hypot(q.x-this.s.x,q.y-this.s.y)>.02)this.s={x:q.x,y:q.y,t};
  $('#cFill').style.width=(this.pts.length*50+Math.min(50,(t-this.s.t)/20))+'%';
  if(t-this.s.t>1000){this.pts.push(q);this.s=null;if(this.pts.length===2){const[a,b]=this.pts,x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),y0=Math.min(a.y,b.y),y1=Math.max(a.y,b.y);
   if(x1-x0>.1&&y1-y0>.1){cfg.area=[x0,y0,x1,y1];save();this.on=false}else{this.pts=[];$('#cMsg').textContent='Area too small — try again.';return}}this.msg()}}
}
