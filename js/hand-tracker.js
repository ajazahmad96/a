const V='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const M='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
let lm=null;
export async function load(){
 const {FilesetResolver,HandLandmarker}=await import(V+'/vision_bundle.mjs');
 const fs=await FilesetResolver.forVisionTasks(V+'/wasm');
 const mk=d=>HandLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:M,delegate:d},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.5,minHandPresenceConfidence:.5,minTrackingConfidence:.5});
 try{lm=await mk('GPU')}catch{lm=await mk('CPU')}}
export const ready=()=>!!lm;
export function detect(video,ts){return lm.detectForVideo(video,ts)}
export function close(){if(lm){lm.close();lm=null}}
