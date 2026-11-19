import {$} from './utils.js';
export class Interaction{
 constructor(cur){this.cur=cur;this.hover=null;this.drag=null;this.down=false;this.py=0;this.sc=null}
 at(){this.cur.el.style.display='none';const e=document.elementFromPoint(this.cur.x,this.cur.y);this.cur.el.style.display=this.cur.vis?'block':'none';return e}
 move(){const e=this.at(),h=e&&e.closest('.gc,.drag,button');
  if(h!==this.hover){this.hover?.classList.remove('hover');h?.classList.add('hover');this.hover=h}
  if(this.drag){const s=this.drag;s.el.style.left=s.ox+(this.cur.x-s.sx)+'px';s.el.style.top=s.oy+(this.cur.y-s.sy)+'px'}
  else if(this.down&&this.sc){this.sc.scrollTop-=this.cur.y-this.py}
  this.py=this.cur.y}
 press(){if(this.down)return 'held';this.down=true;this.py=this.cur.y;this.cur.el.classList.add('pinch');
  const e=this.at(),d=e&&e.closest('.drag'),b=e&&e.closest('button,select');this.sc=e&&e.closest('.scrollable');
  if(d){const st=d.parentElement.getBoundingClientRect(),r=d.getBoundingClientRect();d.classList.add('dragging');this.drag={el:d,sx:this.cur.x,sy:this.cur.y,ox:r.left-st.left,oy:r.top-st.top};return 'drag'}
  if(b){b.click();return 'click'}return 'none'}
 release(){if(!this.down)return;this.down=false;this.cur.el.classList.remove('pinch');
  if(this.drag){const el=this.drag.el,z=$('#zone');el.classList.remove('dragging');if(z){const a=el.getBoundingClientRect(),b=z.getBoundingClientRect();z.classList.toggle('has',a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)}this.drag=null}this.sc=null}
}
