// Kişi yükleyici + synthetic-humans görünümlü malzeme
import * as THREE from 'three';

const KLASOR = 'modeller/'; // kendi tasarladığımız figürler (model/uret.mjs ile üretilir)
const onbellek = {};
export async function kisiGeo(ad) {
  if (onbellek[ad]) return onbellek[ad];
  const katalog = kisiGeo.katalog ||= await (await fetch(new URL(KLASOR + 'katalog.json', import.meta.url))).json();
  const k = katalog.find(x => x.ad === ad);
  const ab = await (await fetch(new URL(`${KLASOR}${ad}.bin`, import.meta.url))).arrayBuffer();
  const V = k.V, I = k.I; let o = 0;
  const pos = new Float32Array(ab, o, V * 3); o += V * 12;
  const nor = new Int8Array(ab, o, V * 3); o += V * 3;
  const ao = new Uint8Array(ab, o, V); o += V;
  const skin = new Uint8Array(ab, o, V); o += V;
  const idx = new Uint32Array(ab.slice(o, o + I * 4));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3, true));
  g.setAttribute('ao', new THREE.BufferAttribute(ao, 1, true));
  g.setAttribute('skin', new THREE.BufferAttribute(skin, 1, true));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeBoundingBox(); g.computeBoundingSphere();
  return (onbellek[ad] = g);
}

const vert = /* glsl */`
attribute float ao; attribute float skin;
varying float vAo; varying float vSkin; varying vec3 vN; varying vec3 vW; varying vec3 vVN; varying vec3 vInst;
void main(){
  vAo = ao; vSkin = skin;
  vec4 lp = vec4(position, 1.0); vec3 ln = normal;
  #ifdef USE_INSTANCING
    lp = instanceMatrix * lp; ln = mat3(instanceMatrix) * ln;
  #endif
  #ifdef USE_INSTANCING_COLOR
    vInst = instanceColor;   // r: görünürlük (0 = zemine karışır), g: vurgu
  #else
    vInst = vec3(1.0, 0.0, 0.0);
  #endif
  vec4 w = modelMatrix * lp;
  vW = w.xyz; vN = normalize(mat3(modelMatrix) * ln); vVN = normalize(normalMatrix * ln);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const frag = /* glsl */`
uniform vec3 uKoyu; uniform vec3 uParlak; uniform vec3 uFresnel; uniform float uVurgu; uniform float uSolgun; uniform float uAlfa; uniform vec3 uZemin;
varying float vAo; varying float vSkin; varying vec3 vN; varying vec3 vW; varying vec3 vVN; varying vec3 vInst;
vec3 hue(float h){ vec3 r = clamp(abs(mod(fract(h)*6.0+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.); return r*r*(3.-2.*r); }
void main(){
  vec3 N = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 V = normalize(cameraPosition - vW);
  float fr = 1.0 - clamp(abs(dot(N, V)), 0.001, 1.0);
  float ao = vAo;
  vec3 c = mix(uKoyu, uParlak, ao);
  float ust = clamp(dot(N, normalize(vec3(0.3, 1.0, 0.4))), 0.0, 1.0);
  c += uParlak * ust * 0.18 * ao;
  if (vSkin > 0.5) {
    c = mix(c, uParlak * 1.15, 0.35) + hue(normalize(vVN).z) * fr * 0.18 * ao;
  }
  c += uFresnel * pow(fr, 1.6) * (0.35 + ao * 0.65) * 0.9;
  c += uFresnel * uVurgu * (0.25 + pow(fr, 1.2) * 0.8);
  c = mix(c, uKoyu * 0.5, smoothstep(0.05, -0.05, vW.y));
  c = mix(c, vec3(dot(c, vec3(0.33))) * 0.9 + uKoyu * 0.1, uSolgun);
  c += uFresnel * vInst.g * (0.22 + pow(fr, 1.2) * 0.9);
  c = mix(uZemin, c, clamp(vInst.r, 0.0, 1.0));
  gl_FragColor = vec4(c, uAlfa);
}`;

export function kisiMalzeme(p) {
  return new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, side: THREE.DoubleSide,
    uniforms: {
      uKoyu: { value: new THREE.Color(p.koyu) }, uParlak: { value: new THREE.Color(p.parlak) },
      uFresnel: { value: new THREE.Color(p.fresnel) }, uVurgu: { value: 0 }, uSolgun: { value: 0 }, uAlfa: { value: 1 }, uZemin: { value: new THREE.Color('#8f8ad1') },
    },
  });
}
