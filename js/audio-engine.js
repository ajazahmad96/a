// Fully synthesized (no samples, no copyrighted audio). Created only after a user gesture.
export class AudioEngine{
  constructor(){this.ctx=null;this.muted=true;this.vol=.6;}
  init(){
    if(this.ctx)return;const c=this.ctx=new (window.AudioContext||window.webkitAudioContext)();
    this.master=c.createGain();this.master.gain.value=this.muted?0:this.vol;this.master.connect(c.destination);
    const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=nb;
    this.charge=c.createOscillator();this.charge.type='sawtooth';this.charge.frequency.value=80;
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=600;this.cg=c.createGain();this.cg.gain.value=0;this.charge.connect(lp).connect(this.cg).connect(this.master);this.charge.start();
    this.amb=c.createOscillator();this.amb.type='sine';this.amb.frequency.value=55;this.ag=c.createGain();this.ag.gain.value=0;this.amb.connect(this.ag).connect(this.master);this.amb.start();
    this.fire=c.createBufferSource();this.fire.buffer=nb;this.fire.loop=true;const bp=c.createBiquadFilter();bp.type='highpass';bp.frequency.value=2500;this.fg=c.createGain();this.fg.gain.value=0;this.fire.connect(bp).connect(this.fg).connect(this.master);this.fire.start();
  }
  setMuted(m){this.muted=m;if(this.ctx){this.ctx.resume();this.master.gain.setTargetAtTime(m?0:this.vol,this.ctx.currentTime,.05);}}
  setVol(v){this.vol=v;if(this.ctx&&!this.muted)this.master.gain.setTargetAtTime(v,this.ctx.currentTime,.05);}
  setCharge(p){if(!this.ctx)return;const t=this.ctx.currentTime;this.charge.frequency.setTargetAtTime(80+p*420,t,.08);this.cg.gain.setTargetAtTime(p*.12,t,.08);this.fg.gain.setTargetAtTime(p*.05+(this.open?.04:0),t,.1);}
  spark(){if(!this.ctx||this.muted)return;const c=this.ctx,s=c.createBufferSource();s.buffer=this.nb;const g=c.createGain(),f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=3000+Math.random()*4000;g.gain.setValueAtTime(.15,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.07);s.connect(f).connect(g).connect(this.master);s.start(c.currentTime,Math.random());s.stop(c.currentTime+.08);}
  activate(){if(!this.ctx)return;const c=this.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(30,t+1.4);g.gain.setValueAtTime(.7,t);g.gain.exponentialRampToValueAtTime(.001,t+1.6);o.connect(g).connect(this.master);o.start(t);o.stop(t+1.7);
    const s=c.createBufferSource();s.buffer=this.nb;const ng=c.createGain();ng.gain.setValueAtTime(.5,t);ng.gain.exponentialRampToValueAtTime(.001,t+1.2);s.connect(ng).connect(this.master);s.start(t);s.stop(t+1.3);this.open=true;this.setCharge(0);this.ag.gain.setTargetAtTime(.25,t,1);}
  close(){this.open=false;if(this.ctx){this.ag.gain.setTargetAtTime(0,this.ctx.currentTime,.4);this.setCharge(0);}}
}
