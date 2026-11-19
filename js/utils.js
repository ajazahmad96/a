export const $=s=>document.querySelector(s);
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
let tt;export function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1800)}
