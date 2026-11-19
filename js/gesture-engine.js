// Works in GL coords (y up): positive angle = anticlockwise. Tracks signed swept angle around the path centroid.
export class GestureEngine{
  constructor(cb){this.cb=cb;this.sens=.6;this.reset();}
  reset(){this.pts=[];this.sum=0;this.active=false;this.done=false;this.sm=null;this.sx=0;this.sy=0;this.mx=0;this.my=0;}
  begin(x,y){this.reset();this.active=true;this.sm=[x,y];this.pts.push([x,y]);this.sx=x;this.sy=y;this.mx=x;this.my=y;this.cb.start();}
  move(x,y){
    if(!this.active||this.done)return;const s=this.sm;s[0]+=(x-s[0])*.45;s[1]+=(y-s[1])*.45;
    const L=this.pts[this.pts.length-1];if(Math.hypot(s[0]-L[0],s[1]-L[1])<4)return;
    this.mx+=s[0];this.my+=s[1];this.pts.push([s[0],s[1]]);const n=this.pts.length;if(n>500)return this.finish();
    const cx=this.mx/n,cy=this.my/n;let d=Math.atan2(s[1]-cy,s[0]-cx)-Math.atan2(L[1]-cy,L[0]-cx);
    if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;this.sum+=d;
    let r=0;for(const p of this.pts)r+=Math.hypot(p[0]-cx,p[1]-cy);r/=n;
    const p=r<28?0:Math.min(1,Math.abs(this.sum)/6.2832);
    const info={cx,cy,r,dir:this.sum>=0?1:-1,start:Math.atan2(this.sy-cy,this.sx-cx),x:s[0],y:s[1]};
    this.cb.progress(p,info);
    if(p>=1.08-this.sens*.3){this.done=true;this.active=false;this.cb.complete(info);}
  }
  finish(){this.active=false;this.cb.cancel();}
  end(){if(this.active)this.finish();this.active=false;}
}
