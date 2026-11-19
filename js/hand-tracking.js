// MediaPipe Hands (CDN). Pinch = thumb tip(4) + index tip(8). Needs HTTPS (or localhost) for camera.
const BASE='https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/';
const load=u=>new Promise((res,rej)=>{if(window.Hands)return res();const s=document.createElement('script');s.src=u;s.crossOrigin='anonymous';s.onload=res;s.onerror=()=>rej(new Error('Could not load hand-tracking library'));document.head.appendChild(s);});
export class HandTracker{
  constructor(video){this.v=video;this.running=false;this.down=false;}
  async start(cb){
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera API unavailable (HTTPS required)');
    this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:480,height:360},audio:false});
    this.v.srcObject=this.stream;await this.v.play();await load(BASE+'hands.js');
    this.hands=new window.Hands({locateFile:f=>BASE+f});
    this.hands.setOptions({maxNumHands:1,modelComplexity:0,minDetectionConfidence:.6,minTrackingConfidence:.5});
    this.hands.onResults(r=>{
      const lm=r.multiHandLandmarks&&r.multiHandLandmarks[0];if(!lm){this.down=false;return cb({lost:true,conf:0,down:false});}
      const i=lm[8],t=lm[4],d=Math.hypot(i.x-t.x,i.y-t.y);
      if(!this.down&&d<.055)this.down=true;else if(this.down&&d>.075)this.down=false;
      cb({x:(1-i.x)*innerWidth,y:i.y*innerHeight,down:this.down,conf:r.multiHandedness?.[0]?.score??.8});
    });
    this.running=true;this.busy=false;
    const loop=async()=>{if(!this.running)return;if(!this.busy&&this.v.readyState>=2){this.busy=true;try{await this.hands.send({image:this.v});}catch(e){}this.busy=false;}requestAnimationFrame(loop);};loop();
  }
  stop(){this.running=false;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;}
}
