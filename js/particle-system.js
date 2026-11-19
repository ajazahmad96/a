import * as THREE from 'three';
// CPU-simulated ring buffer rendered as one GPU Points draw call (additive). Pixel-space coords, y up.
export class ParticleSystem{
  constructor(max){
    this.max=max;this.limit=max;this.cur=0;
    this.pos=new Float32Array(max*3);this.size=new Float32Array(max);this.life=new Float32Array(max);
    this.vx=new Float32Array(max);this.vy=new Float32Array(max);this.age=new Float32Array(max).fill(9);this.ttl=new Float32Array(max).fill(1);this.sz=new Float32Array(max);
    const g=this.geo=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(this.pos,3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize',new THREE.BufferAttribute(this.size,1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aLife',new THREE.BufferAttribute(this.life,1).setUsage(THREE.DynamicDrawUsage));
    this.mat=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uDpr:{value:1}},
      vertexShader:'attribute float aSize;attribute float aLife;varying float vL;uniform float uDpr;void main(){vL=aLife;gl_PointSize=aSize*uDpr*(.4+aLife);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying float vL;void main(){float d=length(gl_PointCoord-.5)*2.;float a=smoothstep(1.,0.,d);a*=a;vec3 c=mix(vec3(1.,.25,.03),vec3(1.,.85,.5),vL);c=mix(c,vec3(1.),a*a*vL*.6);gl_FragColor=vec4(c*a*(.4+vL*1.4),a);}'});
    this.points=new THREE.Points(g,this.mat);this.points.frustumCulled=false;this.points.renderOrder=2;
  }
  emit(x,y,vx,vy,ttl,size){const i=this.cur;this.cur=(this.cur+1)%this.limit;this.pos[i*3]=x;this.pos[i*3+1]=y;this.vx[i]=vx;this.vy[i]=vy;this.age[i]=0;this.ttl[i]=ttl;this.sz[i]=size;}
  update(dt){
    for(let i=0;i<this.max;i++){
      const a=this.age[i]+=dt;if(a>=this.ttl[i]){this.size[i]=0;this.life[i]=0;continue;}
      const l=1-a/this.ttl[i];this.vx[i]*=1-dt*.8;this.vy[i]*=1-dt*.8;this.vy[i]+=22*dt;// embers drift up
      this.pos[i*3]+=this.vx[i]*dt+Math.sin(a*9+i)*10*dt;this.pos[i*3+1]+=this.vy[i]*dt;this.life[i]=l;this.size[i]=this.sz[i]*(.3+l);
    }
    const g=this.geo.attributes;g.position.needsUpdate=g.aSize.needsUpdate=g.aLife.needsUpdate=true;
  }
  dispose(){this.geo.dispose();this.mat.dispose();}
}
