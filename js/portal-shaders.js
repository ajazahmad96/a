export const vert='void main(){gl_Position=vec4(position.xy,0.,1.);}';
export const frag=`precision highp float;
uniform vec2 uCen;uniform float uR,uTime,uProg,uOpen,uFlash,uDir,uStart,uRot,uDest,uFill;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vn(p);p=p*2.03+7.1;a*=.5;}return v;}
vec3 world(vec2 p){
  float t=uTime;
  vec3 top=uDest<.5?vec3(.18,.13,.38):vec3(.12,.03,.3);vec3 hor=uDest<.5?vec3(1.,.62,.22):vec3(.75,.3,.95);
  vec3 c=mix(hor,top,smoothstep(-.25,.95,p.y));
  vec2 sp=p-vec2(.12,.18);c+=hor*exp(-length(sp)*3.2)*.9;
  float ray=pow(max(0.,sin(atan(sp.y,sp.x)*9.+t*.15)),6.)*vn(vec2(atan(sp.y,sp.x)*3.,t*.2));c+=hor*ray*.35*exp(-length(sp)*1.2);
  float cl=fbm(p*vec2(1.4,3.2)+vec2(t*.05,0.));c=mix(c,hor*1.15+.15,smoothstep(.42,.8,cl)*.55*smoothstep(-.35,.25,p.y));
  float m=-.22+.32*fbm(vec2(p.x*1.5+3.,1.));float m2=-.33+.2*fbm(vec2(p.x*2.6+9.+t*.002,4.));
  c=mix(c,vec3(.25,.15,.3)*(hor+.3),step(p.y,m)*.8);c=mix(c,vec3(.1,.06,.16)*(hor+.2),step(p.y,m2));
  float x=abs(p.x);float H=-.12+.1*step(x,.62)+.16*step(x,.42)+.18*step(x,.24)+max(0.,.34-x*3.4)*step(x,.1)+.3*step(abs(x-.5),.035)+.16*step(abs(x-.34),.03);
  float pm=step(p.y,H)*step(-.4,p.y);vec3 gold=vec3(1.,.78,.35)*(.65+.5*vn(p*28.));
  float win=step(.72,h(floor(p*vec2(42.,34.))))*step(-.12,p.y);
  c=mix(c,gold*mix(.45,1.25,smoothstep(-.1,.5,p.y)),pm);c+=pm*win*vec3(1.,.9,.5)*.9;
  c+=hor*.35*smoothstep(-.1,-.55,p.y)*(.5+fbm(p*3.+t*.1)); return c;}
void main(){
  vec2 p=(gl_FragCoord.xy-uCen)/uR;float r=length(p),a=atan(p.y,p.x),t=uTime;
  vec3 col=vec3(.012,.008,.006)*(1.-.4*length((gl_FragCoord.xy-uCen)/(uR*4.)));
  // vortex (depth layers) + dimensional reveal
  float sw=(1.-r)*(3.-2.*min(uOpen,1.))+t*.3;vec2 pw=mat2(cos(sw),-sin(sw),sin(sw),cos(sw))*p;
  float v1=fbm(vec2(atan(pw.y,pw.x)*2.+t*.5,r*4.-t*.8)),v2=fbm(vec2(atan(pw.y,pw.x)*3.-t*.4,r*7.+t*.6));
  vec3 vor=vec3(.95,.3,.05)*(v1*v1*1.3+v2*.5)*(1.+2.*(1.-r))*uFill+vec3(.02,.008,0.);
  vec2 wp=p+.05*vec2(sin(t*.7+r*6.),cos(t*.6+r*6.))*(1.-.5*min(uOpen,1.));
  float rev=1.-smoothstep(uOpen-.3,uOpen,r*1.05);
  col+=mix(vor,world(wp),rev)*(1.-smoothstep(.96,1.,r));
  // energy ring
  float n=fbm(vec2(a*2.+t*.6*uDir,r*3.-t*1.2));float rr=r-1.+(n-.5)*.13*(1.+uFlash*2.);
  float core=exp(-rr*rr*700.),glow=exp(-abs(rr)*7.)*.4;
  float d=mod((a-uStart)*uDir,6.28318),front=uProg*6.28318;float arc=uProg>.999?1.:1.-smoothstep(front-.3,front,d);
  float flame=smoothstep(.4,0.,rr)*step(0.,rr)*pow(fbm(vec2(a*6.+t*2.*uDir,r*8.-t*3.)),2.)*1.6;
  float fil=pow(vn(vec2(a*10.-t*3.*uDir,r*26.)),5.)*smoothstep(.3,0.,abs(rr))*4.;
  float head=uProg<.999?exp(-pow(d-front,2.)*40.)*exp(-abs(rr)*12.)*2.:0.;
  vec3 fc=mix(vec3(1.,.3,.04),vec3(1.,.78,.3),clamp(core+flame*.5,0.,1.));fc=mix(fc,vec3(1.),core*core*.7);
  col+=(fc*(core*1.7+glow+flame+fil)+vec3(1.,.8,.5)*head)*arc*(1.+uFlash*1.5);
  // runes: two counter-rotating glyph rings
  float u1=(a+uRot)*16./6.28318+t*.1,c1=floor(u1);float g1=step(.45,h(vec2(c1,3.)))*step(.15,fract(u1))*step(fract(u1),.85)*step(.35,h(vec2(c1,8.)+floor(t*.2)));
  col+=vec3(1.,.6,.15)*(g1*exp(-pow(r-1.2,2.)*3500.)+exp(-pow(r-1.14,2.)*9000.)*.6)*min(uOpen,1.)*1.3;
  float u2=(a-uRot)*24./6.28318-t*.15,c2=floor(u2);float g2=step(.5,h(vec2(c2,5.)))*step(.2,fract(u2))*step(fract(u2),.8);
  col+=vec3(1.,.5,.1)*g2*exp(-pow(r-1.3,2.)*5000.)*min(uOpen,1.)*.8;
  // atmosphere + light rays
  float ray=pow(max(0.,sin(a*14.+t*.3))*vn(vec2(a*5.,t*.2)),2.);float out_=exp(-max(r-1.,0.)*1.6);
  col+=vec3(.5,.2,.04)*exp(-max(r-1.,0.)*2.5)*.3*(uProg*.5+min(uOpen,1.))+vec3(1.,.55,.15)*ray*out_*.22*min(uOpen,1.)+vec3(1.,.8,.5)*uFlash*exp(-r*r*1.2)*.9;
  gl_FragColor=vec4(col,1.);}`;
