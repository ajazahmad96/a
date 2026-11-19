import * as THREE from 'three';
import {vert,frag} from './portal-shaders.js';
export class Portal{
  constructor(){
    const u=this.u={uCen:{value:new THREE.Vector2()},uR:{value:200},uTime:{value:0},uProg:{value:0},uOpen:{value:0},uFlash:{value:0},uDir:{value:1},uStart:{value:0},uRot:{value:0},uDest:{value:0},uFill:{value:0}};
    this.mat=new THREE.ShaderMaterial({uniforms:u,vertexShader:vert,fragmentShader:frag,depthTest:false,depthWrite:false});
    this.mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.mat);this.mesh.frustumCulled=false;
  }
  set(o){for(const k in o){const t=this.u[k];if(!t)continue;if(k==='uCen')t.value.set(o[k][0],o[k][1]);else t.value=o[k];}}
  dispose(){this.mesh.geometry.dispose();this.mat.dispose();}
}
