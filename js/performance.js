export class Perf{
 constructor(){this.frames=0;this.t0=performance.now();this.fps=0;this.inf=0;this.slow=0;this.skip=1;this.n=0}
 tick(now){this.frames++;if(now-this.t0>=1000){this.fps=Math.round(this.frames*1000/(now-this.t0));this.frames=0;this.t0=now;
  if(this.fps&&this.fps<15)this.slow++;else this.slow=0;return true}return false}
 infer(ms){this.inf=this.inf?this.inf*.9+ms*.1:ms}
 degraded(){return this.slow>=3}
}
