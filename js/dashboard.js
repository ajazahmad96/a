import {$} from './utils.js';
const c={};
export const set=(id,v)=>{if(c[id]!==v){c[id]=v;$('#'+id).textContent=v}};
