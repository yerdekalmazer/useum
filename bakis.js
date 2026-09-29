import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { kisiGeo, kisiMalzeme } from './kisi.js';
import { BAKISLAR, TEZ, HIKAYE } from './veri.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = t => t * t * (3 - 2 * t);
const $ = id => document.getElementById(id);
const rad = d => (d * Math.PI) / 180;
const R = 1.75;          // kişilerin çember yarıçapı
const KAIDE = 1.0;       // ana kaide yüksekliği
const SALON_Z = -9.5;    // "Senin salonun" alanı
const cember = (aci, r = R) => V3(Math.cos(rad(aci)) * r, 0, Math.sin(rad(aci)) * r);
const satirlar = s => s.split('\n').map(x => `<span class="satir">${x}</span>`).join('');

/* ================= temel ================= */
const renderer = new THREE.WebGLRenderer({ canvas: $('sahne'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
const bg = new THREE.Color('#8f8ad1');
scene.background = bg;
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0x8f8ad1, 0.9));
const anaIsik = new THREE.DirectionalLight(0xffffff, 1.4); anaIsik.position.set(2, 5, 3); scene.add(anaIsik);
const dolgu = new THREE.DirectionalLight(0xdfe4ff, 0.8); dolgu.position.set(-3, 3, -2); scene.add(dolgu);
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.05, 100);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.35, 0.6, 0.82));
const bokeh = new BokehPass(scene, camera, { focus: 4, aperture: 0.0035, maxblur: 0.009 });
composer.addPass(bokeh);
composer.addPass(new OutputPass());

const golgeDoku = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(20,18,60,.55)'); r.addColorStop(.5, 'rgba(20,18,60,.18)'); r.addColorStop(1, 'rgba(20,18,60,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
function golge(x, z, s, op = 1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: golgeDoku, transparent: true, depthWrite: false, opacity: op }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.002, z); scene.add(m); return m;
}
const halka = new THREE.Mesh(new THREE.RingGeometry(R - 0.004, R + 0.004, 160), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }));
halka.rotation.x = -Math.PI / 2; halka.position.y = 0.003; scene.add(halka);
const kaideMat = new THREE.MeshStandardMaterial({ color: 0xc9c7ee, roughness: 0.55 });

/* ================= çaydanlık ================= */
function caydanlik(kablolu) {
  const grup = new THREE.Group(), P = {};
  const govdeMat = () => new THREE.MeshPhysicalMaterial({ color: 0xf1eee8, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, userData: { tur: 'govde' } });
  const vurgu = () => new THREE.MeshPhysicalMaterial({ color: 0x2438d6, roughness: 0.28, metalness: 0.1, clearcoat: 1, userData: { tur: 'vurgu' } });
  const koyu = () => new THREE.MeshPhysicalMaterial({ color: 0x1b1b27, roughness: 0.45, metalness: 0.2, clearcoat: 0.6, userData: { tur: 'koyu' } });
  const ekle = (parca, mesh) => { grup.add(mesh); if (parca) (P[parca] ||= []).push(mesh); return mesh; };
  const prof = [[0, .05], [.2, .05], [.232, .09], [.246, .2], [.24, .32], [.215, .42], [.17, .49], [.15, .5], [0, .5]].map(([a, b]) => new THREE.Vector2(a, b));
  ekle('Gövde', new THREE.Mesh(new THREE.LatheGeometry(prof, 96), govdeMat()));
  ekle('Kapak', new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.158, 0.035, 64), govdeMat())).position.y = 0.515;
  const kd = ekle('Kapak', new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.05, 6, 16), vurgu())); kd.rotation.z = Math.PI / 2; kd.position.set(-0.11, 0.545, 0);
  const sap = new THREE.CatmullRomCurve3([V3(-.13, .47, 0), V3(-.27, .49, 0), V3(-.335, .40, 0), V3(-.335, .22, 0), V3(-.29, .12, 0), V3(-.22, .1, 0)]);
  ekle('Sap', new THREE.Mesh(new THREE.TubeGeometry(sap, 80, 0.034, 20, false), vurgu()));
  const agiz = new THREE.CatmullRomCurve3([V3(.2, .26, 0), V3(.27, .31, 0), V3(.32, .38, 0), V3(.345, .43, 0)]);
  const ag = new THREE.TubeGeometry(agiz, 40, 0.05, 24, false);
  { const p = ag.attributes.position; for (let i = 0; i <= 40; i++) { const t = i / 40, c = agiz.getPointAt(t), k = 1 - t * 0.55; for (let j = 0; j < 25; j++) { const n = i * 25 + j; p.setXYZ(n, c.x + (p.getX(n) - c.x) * k, c.y + (p.getY(n) - c.y) * k, c.z + (p.getZ(n) - c.z) * k); } } ag.computeVertexNormals(); }
  ekle('Ağız', new THREE.Mesh(ag, govdeMat()));
  const cm = ekle('Su göstergesi', new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.26, 8, 20), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.02, transparent: true, opacity: 0.55 })));
  cm.position.set(0, 0.25, 0.236); cm.scale.z = 0.35;
  const su = ekle('Su göstergesi', new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.13, 6, 16), new THREE.MeshPhysicalMaterial({ color: 0x6ea7ff, roughness: 0.1, emissive: 0x1a3fb0, emissiveIntensity: 0.4 })));
  su.position.set(0, 0.2, 0.238); su.scale.z = 0.3;
  for (let i = 0; i < 4; i++) ekle('Su göstergesi', new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.004, 0.004), koyu())).position.set(0.045, 0.16 + i * 0.06, 0.232);
  const dg = ekle('Düğme ve ışık', new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.05), koyu())); dg.position.set(-0.27, 0.085, 0.045); dg.rotation.y = -0.5;
  const isik = ekle(null, new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 12), new THREE.MeshBasicMaterial({ color: 0x9fd0ff }))); isik.position.set(-0.262, 0.105, 0.075);
  ekle('Taban ve kablo', new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.25, 0.05, 64), koyu())).position.y = 0.025;
  if (kablolu) {
    const k = new THREE.CatmullRomCurve3([V3(.12, .02, -.2), V3(.22, .005, -.33), V3(.26, -.02, -.4), V3(.27, -.25, -.4), V3(.28, -.7, -.39), V3(.33, -.98, -.34), V3(.55, -.995, -.62)]);
    ekle('Taban ve kablo', new THREE.Mesh(new THREE.TubeGeometry(k, 120, 0.011, 10, false), koyu()));
  }
  return { grup, P, isik };
}
// yaşlanma: yeni (0) → eskimiş (1). Kireç rengi, matlaşma, solan mavi
const RENK = { govde: [new THREE.Color(0xf1eee8), new THREE.Color(0xd3c9b5)], vurgu: [new THREE.Color(0x2438d6), new THREE.Color(0x4d5794)] };
function yaslandir(u, yas) {
  for (const ad in u.P) for (const m of u.P[ad]) {
    const mt = m.material, tur = mt.userData.tur; if (!tur) continue;
    if (RENK[tur]) mt.color.copy(RENK[tur][0]).lerp(RENK[tur][1], yas);
    mt.roughness = (mt.userData.r0 ??= mt.roughness) + yas * 0.35;
    mt.clearcoat = 1 - yas * 0.7;
  }
}
const kaide = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, KAIDE, 64), kaideMat); kaide.position.y = KAIDE / 2; scene.add(kaide);
golge(0, 0, 1.9, 0.9);
const ana = caydanlik(true); ana.grup.position.y = KAIDE; scene.add(ana.grup);

/* ================= salon ================= */
const salon = new THREE.Group(); salon.position.z = SALON_Z; scene.add(salon);
const parlak = (c, r = 0.25, m = 0.1) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: m, clearcoat: 1 });
const ESERLER = [
  () => { const u = caydanlik(false); u.grup.scale.setScalar(0.55); yaslandir(u, 1); return u.grup; },
  () => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.36, 40), parlak(0x3f7d5a, 0.3, 0.3)); b.position.y = 0.18; g.add(b); const k = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.07, 40), parlak(0x1b1b27, 0.4)); k.position.y = 0.395; g.add(k); return g; },
  () => { const g = new THREE.Group(); const bant = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 12, 40, Math.PI), parlak(0x1b1b27, 0.35)); bant.position.y = 0.16; g.add(bant); for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 32), parlak(0xefebe3, 0.3)); c.rotation.z = Math.PI / 2; c.position.set(s * 0.15, 0.14, 0); g.add(c); } return g; },
  () => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.035, 0.34), parlak(0xf4f2ee, 0.5, 0)); t.position.y = 0.02; g.add(t); const u = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.2, 8, 20), parlak(0xe2572b, 0.35)); u.rotation.x = Math.PI / 2; u.scale.set(1, 1, 0.9); u.position.set(0, 0.09, -0.01); g.add(u); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 24), parlak(0xe2572b, 0.35)); b.position.set(0, 0.14, -0.11); g.add(b); return g; },
];
const salonKaideleri = HIKAYE.salon.eserler.map((e, i) => {
  const x = -2.25 + i * 1.5, h = 0.95;
  const k = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, h, 48), kaideMat); k.position.set(x, h / 2, 0); salon.add(k);
  const urun = ESERLER[i](); urun.position.set(x, h, 0); salon.add(urun);
  golge(x, SALON_Z, 1.2, 0.8);
  return { urun, ust: V3(x, h + 0.62, SALON_Z) };
});
const salonCizgi = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.008), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }));
salonCizgi.rotation.x = -Math.PI / 2; salonCizgi.position.set(0, 0.003, 0.7); salon.add(salonCizgi);

/* ================= kişiler ================= */
const kisiler = [];
async function kisiKur(ad, aci, palet, oturuyor) {
  const g = await kisiGeo(ad), mat = kisiMalzeme(palet);
  const grup = new THREE.Group(); grup.add(new THREE.Mesh(g, mat));
  const p = cember(aci); grup.position.copy(p); grup.rotation.y = Math.atan2(-p.x, -p.z);
  if (oturuyor) {
    const kk = kisiGeo.katalog.find(x => x.ad === ad);
    const bank = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.44, 0.46), kaideMat);
    bank.position.set(0, 0.22, kk?.bank ?? -0.07); grup.add(bank);
  }
  scene.add(grup);
  const golgeM = golge(p.x, p.z, 1.1, 0.8);
  return { grup, mat, golgeM, bas: g.boundingBox.max.y + 0.08, faz: Math.random() * 10 };
}
let ziyaretci = null;

/* ================= kalabalık (arama) ================= */
const AR = HIKAYE.arama;
const KALABALIK_M = V3(0, 0, 28);           // kalabalığın merkezi
const ESLESEN_P = V3(1.6, 0, 26.4);         // en benzer kişinin yeri
const KALABALIK_MODELLER = ['zeynep_dusuk', 'emre_dusuk', 'aylin_dusuk', 'kaan_dusuk', 'ziyaretci_dusuk', 'eslesen_dusuk'];
const kalabalik = new THREE.Group(); kalabalik.visible = false; scene.add(kalabalik);
const uyeler = [], kalabalikMat = [];
let eslesen = null;
async function kalabalikKur() {
  const noktalar = [], ad = 0.8;
  for (let x = -17; x <= 17; x += ad) for (let z = -17; z <= 17; z += ad) {
    const p = V3(x + (Math.random() - 0.5) * 0.4, 0, z + (Math.random() - 0.5) * 0.4);
    if (p.length() > 17 || p.clone().add(KALABALIK_M).distanceTo(ESLESEN_P) < 1.3) continue;
    noktalar.push(p.add(KALABALIK_M));
  }
  const gruplar = KALABALIK_MODELLER.map(() => []);
  noktalar.forEach(p => gruplar[Math.floor(Math.random() * gruplar.length)].push(p));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), beyaz = new THREE.Color(1, 0, 0);
  for (let gi = 0; gi < gruplar.length; gi++) {
    const g = await kisiGeo(KALABALIK_MODELLER[gi]);
    const mat = kisiMalzeme({ koyu: '#3236a8', parlak: '#9aa7ff', fresnel: '#e547cd' });
    const im = new THREE.InstancedMesh(g, mat, gruplar[gi].length);
    gruplar[gi].forEach((p, i) => {
      q.setFromAxisAngle(V3(0, 1, 0), Math.random() * Math.PI * 2); const s = 0.93 + Math.random() * 0.12;
      m4.compose(p, q, sc.set(s, s, s)); im.setMatrixAt(i, m4); im.setColorAt(i, beyaz);
      uyeler.push({ im, i, r: 1, g: 0, hiz: 0.02 + Math.random() * 0.07, eslesme: false });
    });
    im.computeBoundingSphere(); kalabalik.add(im); kalabalikMat.push(mat);
  }
  // sana benzeyenler: kalabalığın içine dağılmış küçük bir grup
  const karisik = [...uyeler].sort(() => Math.random() - 0.5);
  karisik.slice(0, AR.aday - 1).forEach(u => { u.eslesme = true; });
  // en benzer kişi: tam çözünürlük, kameraya dönük
  const E = AR.eslesen, g = await kisiGeo(E.kisi), mat = kisiMalzeme(E.palet);
  const grup = new THREE.Group(); grup.add(new THREE.Mesh(g, mat)); grup.position.copy(ESLESEN_P);
  grup.rotation.y = Math.atan2(1.25, 2.7); kalabalik.add(grup);
  eslesen = { grup, mat, bas: g.boundingBox.max.y + 0.08 };
}

/* ================= duraklar (bölümler) ================= */
const NOTR = '#8f8ad1';
const hedefDunya = b => V3(...b.hedef).add(ana.grup.position);
const hk = (aci, r, y) => ({ halka: true, aci, r, y });
const Z = HIKAYE.zaman, aylin = BAKISLAR[Z.kisi];
const aylinOrta = cember(aylin.aci, R * 0.5).add(V3(0, 1.3, 0));
const D = [];
D.push({ bolum: 'Giriş', panel: 'giris', kam: hk(38, 6.2, 3.4), t: V3(0, 1.05, 0), ofs: 0.17, odak: 'hepsi', zemin: NOTR, yas: 0 });
D.push({ bolum: 'Hüküm', panel: 'hukum', kam: hk(72, 2.05, 1.62), t: V3(0, 1.3, 0), ofs: 0.14, odak: 'yok', zemin: '#7f7cc0', yas: 0, kart: true });
D.push({ bolum: 'İddia', panel: 'tez', kam: hk(125, 4.8, 3.1), t: V3(0, 0.9, 0), ofs: 0, odak: 'yok', zemin: '#4b4987', yas: 0.3 });
Z.adimlar.forEach((a, i) => D.push({ bolum: 'Zaman', panel: 'zaman', zamanAdim: i, kam: hk(aylin.aci - 58 + i * 11, 3.35, 2.0 - i * 0.08), t: aylinOrta, ofs: 0.15, odak: Z.kisi, zemin: aylin.palet.zemin[1], yas: [0, 0.25, 0.65, 1][i] }));
D.push({ bolum: 'Bakışlar', panel: 'bakislar', kam: hk(200, 5.4, 2.8), t: V3(0, 1.0, 0), ofs: 0.15, odak: 'hepsi', zemin: NOTR, yas: 0.45 });
BAKISLAR.forEach((b, i) => D.push({ bolum: 'Bakışlar', panel: 'kisi', kisi: i, kam: hk(b.aci + 13, R + 1.45, b.oturuyor ? 1.2 : 1.78), t: hedefDunya(b), ofs: 0.1, odak: i, zemin: b.palet.zemin[1], yas: 0.45 }));
D.push({ bolum: 'Salon', panel: 'salon', kam: { p: V3(0.2, 1.9, SALON_Z + 4.4) }, t: V3(0, 1.05, SALON_Z), ofs: 0.12, odak: 'yok', zemin: '#8a93c9', yas: 0.45, salon: true });
D.push({ bolum: 'Hafıza', panel: 'hafiza', kam: hk(HIKAYE.hafiza.ziyaretci.aci + 16, R + 1.6, 1.9), t: V3(-0.3, 1.25, -0.2), ofs: 0.12, odak: 'hepsi', zemin: '#7e86c2', yas: 0.45, ziyaretci: true });
D.push({ bolum: 'useum', panel: 'final', kam: hk(38 + 360, 5.4, 5.0), t: V3(0, 0.5, 0), ofs: 0.17, odak: 'hepsi', zemin: NOTR, yas: 0.45, ziyaretci: true });
const FINAL_I = D.length - 1;
D.push({ bolum: 'Arama', panel: 'arama0', arama: 0, kam: { p: V3(0, 15, 44) }, t: V3(0, 0, 27), ofs: 0.12, odak: 'yok', zemin: '#5d5a9e', yas: 0.45 });
D.push({ bolum: 'Arama', panel: 'arama1', arama: 1, kam: { p: V3(7, 8.5, 37) }, t: V3(0.6, 0.4, 26.6), ofs: 0.12, odak: 'yok', zemin: '#4a4886', yas: 0.45 });
D.push({ bolum: 'Arama', panel: 'arama2', arama: 2, kam: { p: ESLESEN_P.clone().add(V3(1.25, 1.7, 2.7)) }, t: ESLESEN_P.clone().add(V3(0.15, 1.3, 0)), ofs: 0.14, odak: 'yok', zemin: '#4a4886', yas: 0.45 });
const N = D.length;
let onceki = null; // halka açılarını ardışık yap (kısa yoldan dön)
for (const d of D) if (d.kam.halka) { if (onceki !== null) { while (d.kam.aci - onceki > 180) d.kam.aci -= 360; while (d.kam.aci - onceki < -180) d.kam.aci += 360; } onceki = d.kam.aci; }
const kamPos = k => k.halka ? V3(Math.cos(rad(k.aci)) * k.r, k.y, Math.sin(rad(k.aci)) * k.r) : k.p.clone();
$('uzunluk').style.height = ((N - 1) * 110 + 100) + 'vh';

/* ================= paneller ================= */
const pk = $('paneller');
const panel = (id, html, sinif = '') => { const s = document.createElement('section'); s.className = 'panel ' + sinif; s.id = 'p-' + id; s.innerHTML = html; pk.append(s); return s; };
const metinPanel = (id, h, tag = 'h2') => panel(id, `<p class="kas">${h.kas}</p><${tag}>${satirlar(h.baslik)}</${tag}>${h.metin ? `<p class="acik">${h.metin}</p>` : ''}`);
metinPanel('giris', HIKAYE.giris, 'h1');
metinPanel('hukum', HIKAYE.hukum);
panel('tez', `<p class="kas">${HIKAYE.tez.kas}</p><blockquote>${TEZ.replace('değil,', 'değil,<br>')}</blockquote>`, 'tez');
// zaman: kesikli çizgi = sabit "1. gün hükmü", beyaz çizgi = yaşayan ilişki
const GW = 440, GH = 150, gx = i => 20 + i * ((GW - 40) / (Z.adimlar.length - 1)), gy = v => 18 + (1 - v) * (GH - 58);
const yol = Z.adimlar.map((a, i) => `${i ? 'L' : 'M'}${gx(i)},${gy(a.deger)}`).join(' ');
panel('zaman', `<p class="kas">${Z.kas}</p><h2>${satirlar(Z.baslik)}</h2>
  <div class="grafik"><svg viewBox="0 0 ${GW} ${GH}">
    <line class="hukum-cizgi" x1="${gx(0)}" x2="${gx(Z.adimlar.length - 1)}" y1="${gy(Z.adimlar[0].deger)}" y2="${gy(Z.adimlar[0].deger)}"/>
    <text class="hukum-yazi" x="${gx(Z.adimlar.length - 1)}" y="${gy(Z.adimlar[0].deger) - 8}" text-anchor="end">★★★★★ 1. gün hükmü</text>
    <path class="iliski" id="z-yol" d="${yol}"/>
    ${Z.adimlar.map((a, i) => `<circle class="nokta" id="z-n${i}" cx="${gx(i)}" cy="${gy(a.deger)}" r="5"/><text class="his" id="z-h${i}" x="${gx(i)}" y="${gy(a.deger) + 22}">${a.his}</text><text class="etk" id="z-e${i}" x="${gx(i)}" y="${GH - 4}">${a.etiket}</text>`).join('')}
  </svg></div><p class="grafik-not">${Z.not}</p>`);
metinPanel('bakislar', HIKAYE.bakislar);
panel('kisi', `<p class="kas"><span id="k-no"></span> — <span id="k-not"></span></p><h2 id="k-parca"></h2>
  <div class="kim"><div class="kim-ad" id="k-ad"></div><div class="kim-rol" id="k-rol"></div><div class="kim-sure" id="k-sure"></div></div>`);
metinPanel('salon', HIKAYE.salon);
metinPanel('hafiza', HIKAYE.hafiza);
panel('final', `<p class="kas">${HIKAYE.final.kas}</p><h2>${satirlar(HIKAYE.final.baslik)}</h2><p class="tez-kucuk">${TEZ}</p>`);
AR.adimlar.forEach((a, i) => panel('arama' + i, `<p class="kas">${a.kas}</p><h2>${satirlar(a.baslik)}</h2><p class="acik">${a.metin}</p>${a.dugme ? `<a class="dugme" href="mailto:tyerdekalmazer01@gmail.com?subject=useum">${a.dugme}</a>` : ''}`));

// arama çubuğu
const aramaEl = document.createElement('div'); aramaEl.className = 'arama';
aramaEl.innerHTML = `<form class="arama-kutu"><svg viewBox="0 0 24 24" class="buyutec"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
  <input id="arama-girdi" autocomplete="off" spellcheck="false" placeholder="Bir ürün ara"><button type="submit">Ara</button></form>
  <div class="filtreler">${AR.filtreler.map(f => `<span class="filtre">${f}</span>`).join('')}</div>
  <div class="arama-sonuc"><i></i><span id="arama-sonuc"></span></div>`;
document.body.append(aramaEl);
const girdi = $('arama-girdi'); let elleYazildi = false;
girdi.addEventListener('input', () => { elleYazildi = true; });
aramaEl.querySelector('form').addEventListener('submit', e => { e.preventDefault(); scrollTo({ top: (FINAL_I + 2) * innerHeight * 1.1, behavior: 'smooth' }); });
// eşleşme kartı
const E = AR.eslesen;
const eslesmeEl = document.createElement('div'); eslesmeEl.className = 'eslesme';
eslesmeEl.innerHTML = `<div class="es-ust"><b>%${E.benzerlik}</b><span>senin gibi</span></div>
  <div class="es-kim">${E.ad}, ${E.yas}</div><div class="es-rol">${E.rol}<br>${E.sure}</div>
  <div class="es-neden">${E.nedenler.map(n => `<span>✓ ${n}</span>`).join('')}</div>
  <p class="es-soz">“${E.soz}”</p>`;
$('parcalar').append(eslesmeEl);
const yolUzun = $('z-yol').getTotalLength();
$('z-yol').style.strokeDasharray = yolUzun;

// bölüm gezgini
const bolumIlk = {}; D.forEach((d, i) => { if (!(d.bolum in bolumIlk)) bolumIlk[d.bolum] = i; });
for (const b of Object.keys(bolumIlk).filter(b => b !== 'Giriş')) {
  const d = document.createElement('button'); d.textContent = b; d.dataset.b = b;
  d.onclick = () => scrollTo({ top: bolumIlk[b] * innerHeight * 1.1, behavior: 'smooth' });
  $('bolumler').append(d);
}

/* ================= sahneye iliştirilen HTML ================= */
const katman = $('balonlar');
const havuz = [];
function balon() {
  let b = havuz.find(x => !x.acik);
  if (!b) {
    const el = document.createElement('div'); el.className = 'balon';
    el.innerHTML = '<div class="b-kim"></div><div class="b-soz"></div>'; katman.append(el);
    b = { el, kim: el.firstChild, soz: el.lastChild, zaman: [], acik: false }; havuz.push(b);
  }
  return b;
}
function balonAc(spec) {
  const b = balon(); b.acik = true; b.spec = spec;
  b.el.className = 'balon acik' + (spec.kucuk ? ' kucuk' : '');
  b.kim.textContent = spec.kim; b.soz.innerHTML = '<span class="yaziyor"><i></i><i></i><i></i></span>';
  b.zaman.push(setTimeout(() => {
    let i = 0; const adim = () => { b.soz.textContent = spec.soz.slice(0, ++i); if (i < spec.soz.length) b.zaman.push(setTimeout(adim, 14 + Math.random() * 20)); };
    adim();
  }, 1000 + (spec.gecikme || 0)));
}
function balonlariKapa() { for (const b of havuz) { b.zaman.forEach(clearTimeout); b.zaman = []; b.acik = false; b.el.classList.remove('acik'); } }

const parcaEl = document.createElement('div'); parcaEl.className = 'parca';
parcaEl.innerHTML = '<span class="halka"></span><span class="cizgi"></span><span class="ad"></span>'; $('parcalar').append(parcaEl);
const kart = document.createElement('div'); kart.className = 'yorum';
const K = HIKAYE.hukum.kart;
kart.innerHTML = `<div class="yildiz">${'★'.repeat(K.yildiz)}</div><div class="ys">${K.soz}</div><div class="ya">${K.alt}</div>`; $('parcalar').append(kart);
const eserEl = HIKAYE.salon.eserler.map(e => {
  const el = document.createElement('div'); el.className = 'eser';
  const n = e.seyir.length, d = e.seyir.map((v, i) => `${i ? 'L' : 'M'}${4 + i * (132 / (n - 1))},${4 + (1 - v) * 20}`).join(' ');
  el.innerHTML = `<b>${e.ad}</b><span>${e.sure}</span><svg viewBox="0 0 140 28"><path d="${d}"/></svg>`;
  $('parcalar').append(el); return el;
});

const _p = new THREE.Vector3();
function konumla(el, v, dx = 0, dy = 0, tx = '0', ty = '-100%') {
  _p.copy(v).project(camera);
  el.style.visibility = _p.z < 1 ? '' : 'hidden';
  let x = (_p.x * 0.5 + 0.5) * innerWidth + dx, y = (-_p.y * 0.5 + 0.5) * innerHeight + dy;
  if (tx === '0') x = Math.min(x, innerWidth - el.offsetWidth - 16);
  if (ty === '-100%') y = Math.max(y, el.offsetHeight + 76);
  el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(${tx},${ty})`;
}
const basUstu = k => V3(k.grup.position.x, k.bas, k.grup.position.z);

/* ================= durak değişimi ================= */
let aktif = -2;
function aktifDegis(i) {
  aktif = i; const d = D[i];
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('goster', !!d && p.id === 'p-' + d.panel));
  if (d) $('bolum-ad').textContent = d.bolum;
  $('sayac').textContent = d && d.kisi != null ? `${String(d.kisi + 1).padStart(2, '0')} / ${String(BAKISLAR.length).padStart(2, '0')}` : '';
  if (d) [...$('bolumler').children].forEach(b => b.classList.toggle('aktif', b.dataset.b === d.bolum));
  balonlariKapa();
  parcaEl.classList.toggle('acik', !!d && d.kisi != null);
  kart.classList.toggle('acik', !!d && !!d.kart);
  eserEl.forEach(e => e.classList.toggle('acik', !!d && !!d.salon));
  if (!d) return;
  if (d.kisi != null) {
    const b = BAKISLAR[d.kisi];
    $('k-no').textContent = String(d.kisi + 1).padStart(2, '0'); $('k-not').textContent = b.not; $('k-parca').textContent = b.parca;
    $('k-ad').textContent = `${b.ad}, ${b.yas}`; $('k-rol').textContent = b.rol; $('k-sure').textContent = b.sure;
    parcaEl.querySelector('.ad').textContent = b.parca;
    balonAc({ kisi: d.kisi, kim: `${b.ad} · ${b.parca}`, soz: b.soz });
  }
  if (d.zamanAdim != null) {
    const a = Z.adimlar[d.zamanAdim];
    balonAc({ kisi: Z.kisi, kim: `${aylin.ad} · ${a.etiket}`, soz: a.soz });
    $('z-yol').style.strokeDashoffset = yolUzun * (1 - d.zamanAdim / (Z.adimlar.length - 1));
    Z.adimlar.forEach((_, k) => {
      $('z-n' + k).style.opacity = k <= d.zamanAdim ? 1 : 0.2; $('z-n' + k).setAttribute('r', k === d.zamanAdim ? 7 : 5);
      $('z-h' + k).style.opacity = k === d.zamanAdim ? 1 : 0; $('z-e' + k).classList.toggle('aktif', k === d.zamanAdim);
    });
  }
  if (d.panel === 'hafiza') {
    const zv = HIKAYE.hafiza.ziyaretci;
    balonAc({ ziyaretci: true, kim: `${zv.ad} · yeni ziyaretçi`, soz: zv.soz });
    BAKISLAR.forEach((b, k) => balonAc({ kisi: k, kucuk: true, kim: `${b.ad} · ${b.sure.split(' · ')[0]}`, soz: b.ipucu, gecikme: 1800 + k * 450 }));
  }
  aramaEl.classList.toggle('acik', d.arama != null);
  aramaEl.querySelectorAll('.filtre').forEach((f, k) => { clearTimeout(f._z); f.classList.remove('acik'); if (d.arama >= 1) f._z = setTimeout(() => f.classList.add('acik'), d.arama === 1 ? 300 + k * 350 : 0); });
  eslesmeEl.classList.toggle('acik', d.arama === 2);
  if (d.arama === 0 && !elleYazildi) { // sorguyu kendiliğinden yaz
    clearInterval(girdi._z); girdi.value = ''; let k = 0;
    girdi._z = setInterval(() => { girdi.value = AR.sorgu.slice(0, ++k); if (k >= AR.sorgu.length) clearInterval(girdi._z); }, 110);
  } else if (d.arama > 0 && !elleYazildi) { clearInterval(girdi._z); girdi.value = AR.sorgu; }
  if (d.panel === 'final') BAKISLAR.forEach((b, k) => balonAc({ kisi: k, kucuk: true, kim: `${b.ad} · ${b.parca}`, soz: b.ozet, gecikme: k * 260 }));
}

/* ================= döngü ================= */
let ilerleme = 0, hedef = 0, yas = 0, sayacDeger = 0;
const fare = { x: 0, y: 0, hx: 0, hy: 0 };
addEventListener('pointermove', e => { fare.hx = e.clientX / innerWidth - 0.5; fare.hy = e.clientY / innerHeight - 0.5; });
const olcek = () => innerHeight * 1.1;
addEventListener('scroll', () => { hedef = clamp(scrollY / olcek(), 0, N - 1); }, { passive: true });
function boyut() {
  camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth < 812 ? 52 : 38; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', boyut); boyut();
const _d = new URLSearchParams(location.search).get('durak');
if (_d !== null) hedef = ilerleme = +_d; else hedef = clamp(scrollY / olcek(), 0, N - 1);

const kamT = new THREE.Vector3(), kamP = new THREE.Vector3(), c1 = new THREE.Color(), c2 = new THREE.Color();
const saat = new THREE.Clock();
function kare() {
  const t = saat.getElapsedTime();
  ilerleme += (hedef - ilerleme) * 0.07;
  const seg = Math.min(Math.floor(ilerleme), N - 2), f = ilerleme - seg, e = smooth(clamp((f - 0.2) / 0.8));
  const a = D[seg], b = D[seg + 1];
  if (a.kam.halka && b.kam.halka) {
    const aci = a.kam.aci + (b.kam.aci - a.kam.aci) * e, r = a.kam.r + (b.kam.r - a.kam.r) * e + Math.sin(e * Math.PI) * 0.8;
    kamP.set(Math.cos(rad(aci)) * r, a.kam.y + (b.kam.y - a.kam.y) * e + Math.sin(e * Math.PI) * 0.35, Math.sin(rad(aci)) * r);
  } else { kamP.lerpVectors(kamPos(a.kam), kamPos(b.kam), e); kamP.y += Math.sin(e * Math.PI) * 1.4; }
  kamT.lerpVectors(a.t, b.t, e);
  fare.x += (fare.hx - fare.x) * 0.05; fare.y += (fare.hy - fare.y) * 0.05;
  camera.position.copy(kamP); camera.lookAt(kamT);
  camera.translateX(fare.x * 0.18); camera.translateY(-fare.y * 0.1);
  const ofs = a.ofs + (b.ofs - a.ofs) * e;
  if (innerWidth > 812) camera.setViewOffset(innerWidth, innerHeight, -innerWidth * ofs, 0, innerWidth, innerHeight); else camera.clearViewOffset();

  const etkin = seg + e, yakin = Math.round(etkin), netlik = 1 - Math.abs(etkin - yakin) * 2;
  const durak = netlik > 0.6 ? yakin : -1;
  if (durak !== aktif) aktifDegis(durak);
  const d = D[yakin];
  bokeh.uniforms.focus.value = camera.position.distanceTo(kamT);
  bokeh.uniforms.aperture.value = 0.0035 * (1 - Math.sin(e * Math.PI) * 0.5) * ((d.kam.r ?? 3) > 4 ? 0.45 : 1);

  kisiler.forEach((k, i) => {
    const odak = d.odak, hedefSol = odak === 'hepsi' ? 0 : odak === 'yok' ? 0.75 : i !== odak ? 0.62 : 0;
    const hedefVur = odak === i ? 0.12 + Math.sin(t * 2) * 0.04 : 0;
    k.mat.uniforms.uSolgun.value += (hedefSol * netlik - k.mat.uniforms.uSolgun.value) * 0.08;
    k.mat.uniforms.uVurgu.value += (hedefVur * netlik - k.mat.uniforms.uVurgu.value) * 0.08;
    k.grup.children[0].scale.y = 1 + Math.sin(t * 1.3 + k.faz) * 0.004;
  });
  if (ziyaretci) {
    const u = ziyaretci.mat.uniforms.uAlfa;
    u.value += ((d.ziyaretci ? 1 : 0) - u.value) * 0.05; ziyaretci.grup.visible = u.value > 0.01;
    ziyaretci.golgeM.material.opacity = u.value * 0.8;
  }
  c1.set(d.zemin); bg.lerp(c1, 0.04); document.body.style.background = '#' + bg.getHexString();

  yas += (d.yas - yas) * 0.06; yaslandir(ana, yas);
  const aktifParca = d.kisi != null ? BAKISLAR[d.kisi].parca : null;
  for (const ad in ana.P) for (const m of ana.P[ad]) if (m.material.emissive) {
    const h = ad === aktifParca ? (0.35 + Math.sin(t * 3) * 0.15) * netlik : 0;
    c2.set(ad === 'Su göstergesi' ? 0x1a3fb0 : 0x6f8cff).multiplyScalar(h); m.material.emissive.lerp(c2, 0.1);
  }
  ana.isik.material.color.setHSL(0.58, 1, 0.72 + Math.sin(t * 2.4) * 0.12);
  salonKaideleri.forEach((s, i) => { s.urun.rotation.y = t * 0.3 + i; });

  // kalabalık: aramanın adımına göre solar ya da öne çıkar
  kalabalik.visible = etkin > FINAL_I - 0.4;
  if (kalabalik.visible) {
    const ad = d.arama ?? -1;
    for (const u of uyeler) {
      const hr = ad < 1 ? 1 : ad === 1 ? (u.eslesme ? 1 : 0.1) : (u.eslesme ? 0.4 : 0.06);
      const hg = ad === 1 && u.eslesme ? 0.9 : ad === 2 && u.eslesme ? 0.15 : 0;
      u.r += (hr - u.r) * u.hiz; u.g += (hg - u.g) * u.hiz;
      c2.setRGB(u.r, u.g, 0); u.im.setColorAt(u.i, c2);
    }
    for (const m of kalabalik.children) if (m.isInstancedMesh) m.instanceColor.needsUpdate = true;
    for (const m of kalabalikMat) m.uniforms.uZemin.value.copy(bg);
    if (eslesen) {
      const v = ad === 2 ? 0.14 + Math.sin(t * 2) * 0.04 : ad === 1 ? 0.1 : 0;
      eslesen.mat.uniforms.uVurgu.value += (v - eslesen.mat.uniforms.uVurgu.value) * 0.06;
      eslesen.mat.uniforms.uZemin.value.copy(bg);
    }
    // sayaç
    const hedefSay = ad < 1 ? AR.toplam : AR.aday;
    sayacDeger += (hedefSay - sayacDeger) * (ad === 1 ? 0.035 : 0.2);
    const sy = Math.round(sayacDeger).toLocaleString('tr-TR');
    $('arama-sonuc').textContent = ad < 1 ? `${sy} kişi · ${AR.deneyim.toLocaleString('tr-TR')} deneyim` : ad === 1 ? `${sy} kişi sana benziyor` : `En yakın deneyim: ${E.ad} · %${E.benzerlik} benzer`;
  }
  composer.render();

  for (const bl of havuz) if (bl.acik) {
    const k = bl.spec.ziyaretci ? ziyaretci : kisiler[bl.spec.kisi];
    if (k) konumla(bl.el, basUstu(k), 12, -8);
  }
  if (d.kisi != null && netlik > 0.6) konumla(parcaEl, hedefDunya(BAKISLAR[d.kisi]), 0, 0, '0', '-50%');
  if (d.kart) konumla(kart, V3(0.1, KAIDE + 0.72, 0), 24, 0);
  if (d.arama === 2 && eslesen) konumla(eslesmeEl, V3(ESLESEN_P.x, eslesen.bas - 0.1, ESLESEN_P.z), 46, 0, '0', '-40%');
  if (d.salon) salonKaideleri.forEach((s, i) => konumla(eserEl[i], s.ust, 0, 0, '-50%'));
  $('kaydir').style.opacity = ilerleme > 0.15 ? 0 : 0.7;
  requestAnimationFrame(kare);
}

/* ================= yükleme ================= */
const yuzde = v => { $('yk-yuzde').textContent = Math.round(v * 100) + '%'; $('yk-cubuk').style.width = v * 100 + '%'; };
await document.fonts.ready;
let n = 0; const toplam = BAKISLAR.length + 1;
for (const b of BAKISLAR) { kisiler.push(await kisiKur(b.kisi, b.aci, b.palet, b.oturuyor)); yuzde(++n / toplam); }
const zv = HIKAYE.hafiza.ziyaretci;
ziyaretci = await kisiKur(zv.kisi, zv.aci, { koyu: '#1b1b27', parlak: '#dfe3ff', fresnel: '#ffffff' });
ziyaretci.mat.transparent = true; ziyaretci.mat.uniforms.uAlfa.value = 0; ziyaretci.grup.visible = false;
await kalabalikKur(); yuzde(1);
renderer.compile(scene, camera);
kare();
setTimeout(() => $('yukleme').classList.add('bitti'), 350);
window.HAZIR = 1;
