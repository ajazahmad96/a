export const $=id=>document.getElementById(id);
export function bindUI(h){
  const on=(id,ev,fn)=>$(id).addEventListener(ev,fn);
  on('bMode','click',h.mode);on('bSnd','click',h.sound);on('bReset','click',h.reset);on('bClose','click',h.close);
  on('bFs','click',()=>{const d=document;if(d.fullscreenElement)d.exitFullscreen();else d.documentElement.requestFullscreen?.().catch(()=>msg('Fullscreen not supported'));});
  on('bSet','click',()=>{$('panel').hidden=!$('panel').hidden;});
  for(const k of['sSize','sRot','sSens','sVol','sDest'])on(k,'input',e=>h[k](parseFloat(e.target.value)));
}
let mt;export function msg(t,ms=3500){const m=$('msg');m.textContent=t;clearTimeout(mt);if(t)mt=setTimeout(()=>m.textContent='',ms);}
export const setProg=p=>$('prog').style.setProperty('--p',(100.5*(1-p)).toFixed(1));
export function setConf(v,show){const c=$('conf');c.style.display=show?'flex':'none';c.firstElementChild.style.setProperty('--c',Math.round(v*100)+'%');}
