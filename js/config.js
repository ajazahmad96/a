export const DEF={sens:1,smooth:.35,dead:.004,accel:.3,hand:'any',sound:true,fx:'high',fist:'pause',two:'next',res:640,area:[.15,.1,.85,.8],pinchOn:.3,pinchOff:.45,hold:120,cool:1200};
export const cfg={...DEF};
try{Object.assign(cfg,JSON.parse(localStorage.getItem('sgi')||'{}'))}catch{}
export const save=()=>{try{localStorage.setItem('sgi',JSON.stringify(cfg))}catch{}};
