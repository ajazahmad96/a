import {dist} from './utils.js';
const C=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
export const size=l=>dist(l[0],l[9])||1e-3;
export const center=l=>{let x=0,y=0;for(const i of [0,5,9,13,17]){x+=l[i].x;y+=l[i].y}return{x:x/5,y:y/5}};
export const ext=(l,t,p)=>dist(l[t],l[0])>dist(l[p],l[0])*1.1;
export function fingers(l){return{index:ext(l,8,6),middle:ext(l,12,10),ring:ext(l,16,14),pinky:ext(l,20,18)}}
export function draw(ctx,hands,w,h){
 ctx.clearRect(0,0,w,h);ctx.lineWidth=2;
 hands.forEach(l=>{ctx.strokeStyle='#19e3ff';ctx.beginPath();C.forEach(([a,b])=>{ctx.moveTo(l[a].x*w,l[a].y*h);ctx.lineTo(l[b].x*w,l[b].y*h)});ctx.stroke();
 l.forEach((p,i)=>{ctx.fillStyle=[4,8,12,16,20].includes(i)?'#ff0':i===0?'#f55':'#fff';ctx.beginPath();ctx.arc(p.x*w,p.y*h,[4,8,12,16,20,0].includes(i)?4:2.5,0,7);ctx.fill()})})}
