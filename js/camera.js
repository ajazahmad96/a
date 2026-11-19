let stream=null;
export const supported=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
export function explain(e){const n=e&&e.name;return n==='NotAllowedError'?'Camera permission denied. Allow camera access in the browser address bar and retry.':n==='NotFoundError'?'No camera detected.':n==='NotReadableError'?'Camera is in use by another app. Close it and retry.':(e&&e.message)||String(e)}
export async function start(video,deviceId,w=640){
 stop(video);const h=Math.round(w*3/4);
 stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{width:{ideal:w},height:{ideal:h},...(deviceId?{deviceId:{exact:deviceId}}:{facingMode:'user'})}});
 video.srcObject=stream;await video.play();return stream}
export function stop(video){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;if(video)video.srcObject=null}
export const active=()=>!!stream;
export async function list(){const d=await navigator.mediaDevices.enumerateDevices();return d.filter(x=>x.kind==='videoinput')}
