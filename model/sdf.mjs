// SDF araçları: ilkel şekiller, yumuşak birleşim, surface nets ile mesh çıkarma, AO
// Koordinatlar metre; y yukarı, +z kişinin önü, +x kişinin solu.

export const v = (x, y, z) => [x, y, z];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const len = a => Math.hypot(a[0], a[1], a[2]);
export const norm = a => mul(a, 1 / (len(a) || 1));
export const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
const R = Math.PI / 180;
export function rotX(p, d) { const a = d * R, c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
export function rotY(p, d) { const a = d * R, c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
export function rotZ(p, d) { const a = d * R, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }

// dönüş tabanı: önce x (eğme), sonra y (dönme), sonra z — sütunlar yerel eksenlerin dünya yönü
export function taban(ex = 0, ey = 0, ez = 0) {
  const f = p => rotZ(rotY(rotX(p, ex), ey), ez);
  return [f([1, 0, 0]), f([0, 1, 0]), f([0, 0, 1])];
}
const yerel = (B, c, x, y, z) => {
  const px = x - c[0], py = y - c[1], pz = z - c[2];
  return [px * B[0][0] + py * B[0][1] + pz * B[0][2], px * B[1][0] + py * B[1][1] + pz * B[1][2], px * B[2][0] + py * B[2][1] + pz * B[2][2]];
};

/* ---- ilkel şekiller: her biri (x,y,z) → uzaklık fonksiyonu + sınır küresi ---- */
export function koni(a, b, r1, r2) { // iq sdRoundCone
  const ba = sub(b, a), l2 = ba[0] * ba[0] + ba[1] * ba[1] + ba[2] * ba[2], rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const f = (x, y, z) => {
    const pax = x - a[0], pay = y - a[1], paz = z - a[2];
    const yy = pax * ba[0] + pay * ba[1] + paz * ba[2], zz = yy - l2;
    const qx = pax * l2 - ba[0] * yy, qy = pay * l2 - ba[1] * yy, qz = paz * l2 - ba[2] * yy;
    const x2 = qx * qx + qy * qy + qz * qz, y2 = yy * yy * l2, z2 = zz * zz * l2;
    const k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
  };
  f.kure = [lerp(a, b, 0.5), len(ba) / 2 + Math.max(r1, r2)];
  return f;
}
export function elips(c, r, B = null) {
  const f = (x, y, z) => {
    let px = x - c[0], py = y - c[1], pz = z - c[2];
    if (B) [px, py, pz] = yerel(B, c, x, y, z);
    const k0 = Math.hypot(px / r[0], py / r[1], pz / r[2]), k1 = Math.hypot(px / (r[0] * r[0]), py / (r[1] * r[1]), pz / (r[2] * r[2]));
    return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
  };
  f.kure = [c, Math.max(...r)];
  return f;
}
export function kutu(c, b, r, B = null) { // yuvarlatılmış kutu, b = yarı boyutlar
  const f = (x, y, z) => {
    const p = B ? yerel(B, c, x, y, z) : [x - c[0], y - c[1], z - c[2]];
    const qx = Math.abs(p[0]) - b[0] + r, qy = Math.abs(p[1]) - b[1] + r, qz = Math.abs(p[2]) - b[2] + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
  };
  f.kure = [c, Math.hypot(...b) + r];
  return f;
}
export function simit(c, R1, r2, B = null) { // torus, yerel xz düzleminde
  const f = (x, y, z) => {
    const p = B ? yerel(B, c, x, y, z) : [x - c[0], y - c[1], z - c[2]];
    return Math.hypot(Math.hypot(p[0], p[2]) - R1, p[1]) - r2;
  };
  f.kure = [c, R1 + r2];
  return f;
}
// bir şekli sinüs dalgasıyla kabart (pile, saç teli): eksen etrafındaki açıya göre
export function dalga(f, merkez, sayi, genlik, agirlik = () => 1) {
  const g = (x, y, z) => f(x, y, z) - Math.sin(Math.atan2(x - merkez[0], z - merkez[2]) * sayi) * genlik * agirlik(y);
  g.kure = [f.kure[0], f.kure[1] + genlik];
  return g;
}
export function kes(f, n, d) { // düzlemle kes: n·p > d tarafı kalır
  const g = (x, y, z) => Math.max(f(x, y, z), d - (n[0] * x + n[1] * y + n[2] * z));
  g.kure = f.kure; return g;
}

const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };

/* ---- figür: parçalar listesi ---- */
// parca: { f, k (birleşim yumuşaklığı), ten (bool), oncelik }
export function alan(parcalar) {
  const n = parcalar.length;
  const cx = new Float64Array(n), cy = new Float64Array(n), cz = new Float64Array(n), cr = new Float64Array(n);
  parcalar.forEach((p, i) => { [cx[i], cy[i], cz[i]] = p.f.kure[0]; cr[i] = p.f.kure[1]; });
  const d = (x, y, z) => {
    let s = 1e9;
    for (let i = 0; i < n; i++) {
      const kaba = Math.hypot(x - cx[i], y - cy[i], z - cz[i]) - cr[i];
      if (kaba > s + 0.08) continue; // uzaktaki parçayı atla
      s = smin(s, parcalar[i].f(x, y, z), parcalar[i].k ?? 0.02);
    }
    return s;
  };
  const malzeme = (x, y, z) => { // en yakın parça: kıyafet teni hafifçe örter
    let en = 1e9, ten = 0;
    for (let i = 0; i < n; i++) {
      const p = parcalar[i]; const di = p.f(x, y, z) + (p.ten ? 0.004 : 0);
      if (di < en) { en = di; ten = p.ten ? 1 : 0; }
    }
    return ten;
  };
  return { d, malzeme };
}

/* ---- surface nets ---- */
export function mesh(A, kutuMin, kutuMax, h) {
  const nx = Math.ceil((kutuMax[0] - kutuMin[0]) / h) + 1, ny = Math.ceil((kutuMax[1] - kutuMin[1]) / h) + 1, nz = Math.ceil((kutuMax[2] - kutuMin[2]) / h) + 1;
  const V = new Float32Array(nx * ny * nz), id = (i, j, k) => i + nx * (j + ny * k);
  // kaba geçiş: 4h ızgarada, yüzeyden uzak blokları atla
  const B = 4;
  for (let k = 0; k < nz; k += B) for (let j = 0; j < ny; j += B) for (let i = 0; i < nx; i += B) {
    const x0 = kutuMin[0] + (i + B / 2) * h, y0 = kutuMin[1] + (j + B / 2) * h, z0 = kutuMin[2] + (k + B / 2) * h;
    const dk = A.d(x0, y0, z0), yak = Math.abs(dk) < B * h * 1.2;
    for (let kk = k; kk < Math.min(k + B + 1, nz); kk++) for (let jj = j; jj < Math.min(j + B + 1, ny); jj++) for (let ii = i; ii < Math.min(i + B + 1, nx); ii++) {
      const q = id(ii, jj, kk);
      if (V[q] !== 0) continue;
      V[q] = yak ? A.d(kutuMin[0] + ii * h, kutuMin[1] + jj * h, kutuMin[2] + kk * h) || 1e-6 : dk;
    }
  }
  const hucre = new Int32Array(nx * ny * nz).fill(-1), P = [];
  const kose = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const kenar = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const g = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let m = 0;
    for (let c = 0; c < 8; c++) { g[c] = V[id(i + kose[c][0], j + kose[c][1], k + kose[c][2])]; if (g[c] < 0) m |= 1 << c; }
    if (m === 0 || m === 255) continue;
    let sx = 0, sy = 0, sz = 0, say = 0;
    for (const [a, b] of kenar) {
      if ((g[a] < 0) === (g[b] < 0)) continue;
      const t = g[a] / (g[a] - g[b]);
      sx += kose[a][0] + (kose[b][0] - kose[a][0]) * t; sy += kose[a][1] + (kose[b][1] - kose[a][1]) * t; sz += kose[a][2] + (kose[b][2] - kose[a][2]) * t; say++;
    }
    hucre[id(i, j, k)] = P.length / 3;
    P.push(kutuMin[0] + (i + sx / say) * h, kutuMin[1] + (j + sy / say) * h, kutuMin[2] + (k + sz / say) * h);
  }
  const I = [];
  const dortgen = (a, b, c, d, ters) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (ters) I.push(a, c, b, a, d, c); else I.push(a, b, c, a, c, d); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const v0 = V[id(i, j, k)] < 0;
    if (v0 !== (V[id(i + 1, j, k)] < 0)) dortgen(hucre[id(i, j - 1, k - 1)], hucre[id(i, j, k - 1)], hucre[id(i, j, k)], hucre[id(i, j - 1, k)], !v0);
    if (v0 !== (V[id(i, j + 1, k)] < 0)) dortgen(hucre[id(i - 1, j, k - 1)], hucre[id(i - 1, j, k)], hucre[id(i, j, k)], hucre[id(i, j, k - 1)], !v0);
    if (v0 !== (V[id(i, j, k + 1)] < 0)) dortgen(hucre[id(i - 1, j - 1, k)], hucre[id(i, j - 1, k)], hucre[id(i, j, k)], hucre[id(i - 1, j, k)], !v0);
  }
  // yüzeye izdüşür + normal + AO + malzeme
  const Vn = P.length / 3, N = new Float32Array(Vn * 3), AO = new Uint8Array(Vn), SK = new Uint8Array(Vn), Pos = new Float32Array(P);
  const e = h * 0.5;
  const grad = (x, y, z) => norm([A.d(x + e, y, z) - A.d(x - e, y, z), A.d(x, y + e, z) - A.d(x, y - e, z), A.d(x, y, z + e) - A.d(x, y, z - e)]);
  for (let q = 0; q < Vn; q++) {
    let x = Pos[q * 3], y = Pos[q * 3 + 1], z = Pos[q * 3 + 2];
    for (let it = 0; it < 2; it++) { const n = grad(x, y, z), d = A.d(x, y, z); x -= n[0] * d; y -= n[1] * d; z -= n[2] * d; }
    const n = grad(x, y, z);
    Pos[q * 3] = x; Pos[q * 3 + 1] = y; Pos[q * 3 + 2] = z;
    N[q * 3] = n[0]; N[q * 3 + 1] = n[1]; N[q * 3 + 2] = n[2];
    let o = 0, w = 1;
    for (let s = 1; s <= 6; s++) { const t = s * 0.018; o += w * (t - A.d(x + n[0] * t, y + n[1] * t, z + n[2] * t)); w *= 0.62; }
    const zemin = Math.min(1, 0.55 + y * 1.6); // ayak dibi kararır
    AO[q] = Math.round(Math.max(0, Math.min(1, (1 - o * 9) * zemin)) * 255);
    SK[q] = A.malzeme(x, y, z);
  }
  return { Pos, N, AO, SK, I: new Uint32Array(I) };
}
