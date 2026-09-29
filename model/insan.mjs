// Parametrik insan: iskelet (duruş) + beden + saç + kıyafet + aksesuar → SDF parçaları
import { v, add, sub, mul, lerp, norm, rotX, rotY, rotZ, taban, koni, elips, kutu, simit, dalga, kes } from './sdf.mjs';

const ASAGI = [0, -1, 0];

/* ---------- iskelet ---------- */
export function iskelet(o) {
  const H = o.boy / 1.75;                       // ölçek
  const oturuyor = !!o.oturuyor;
  const pelvisY = oturuyor ? 0.47 : 0.97 * H;
  const pelvis = v(0, pelvisY, oturuyor ? -0.02 : 0);
  const govdeDon = p => add(pelvis, rotY(rotX(sub(p, pelvis), -(o.egilme ?? 0)), o.govdeDonus ?? 0));
  const bel = govdeDon(add(pelvis, v(0, 0.17 * H, 0)));
  const gogus = govdeDon(add(pelvis, v(0, 0.36 * H, 0.005)));
  const boyun = govdeDon(add(pelvis, v(0, 0.52 * H, 0)));
  const omuzY = 0.47 * H, omuzX = (o.omuz ?? 0.19) * H;
  const omuz = s => govdeDon(add(pelvis, v(s * omuzX, omuzY, -0.01)));
  const bas = add(boyun, rotY(rotX(v(0, 0.14 * H, 0.015), -(o.basEgim ?? 0)), (o.basDonus ?? 0) + (o.govdeDonus ?? 0)));
  const basTaban = taban(o.basEgim ?? 0, (o.basDonus ?? 0) + (o.govdeDonus ?? 0), o.basYatik ?? 0);
  const kol = (s, k) => { // s: +1 sol (+x), -1 sağ
    const o1 = omuz(s);
    let ust = rotZ(rotX(ASAGI, -(k.one ?? 0)), s * (k.yana ?? 8));
    ust = rotY(ust, o.govdeDonus ?? 0);
    const dirsek = add(o1, mul(ust, 0.29 * H));
    let alt = rotZ(rotX(ASAGI, -((k.one ?? 0) + (k.dirsek ?? 10))), s * ((k.yana ?? 8) + (k.ice ?? 0)));
    alt = rotY(alt, -s * (k.kivir ?? 0) + (o.govdeDonus ?? 0));
    const bilek = add(dirsek, mul(alt, 0.255 * H));
    const el = add(bilek, mul(norm(alt), 0.07 * H));
    return { omuz: o1, dirsek, bilek, el, yon: norm(alt) };
  };
  const bacak = (s, b) => {
    const kalca = add(pelvis, v(s * 0.092 * H, -0.035, 0));
    let ust = rotZ(rotX(ASAGI, -(b.one ?? 0)), s * (b.yana ?? 2));
    ust = rotY(ust, s * (b.don ?? 0));
    const diz = add(kalca, mul(ust, 0.44 * H));
    let alt = rotZ(rotX(ASAGI, -((b.one ?? 0) - (b.diz ?? 0))), s * (b.altYana ?? 1));
    alt = rotY(alt, s * (b.don ?? 0));
    const bilek = add(diz, mul(alt, 0.43 * H));
    const ayakYon = norm(rotY(v(0, 0, 1), s * (b.ayakDon ?? 6)));
    return { kalca, diz, bilek, ayakYon };
  };
  return {
    H, pelvis, bel, gogus, boyun, bas, basTaban, omuzX,
    kolL: kol(1, o.kolSol ?? {}), kolR: kol(-1, o.kolSag ?? {}),
    bacakL: bacak(1, o.bacakSol ?? {}), bacakR: bacak(-1, o.bacakSag ?? {}),
  };
}

/* ---------- beden ---------- */
export function beden(S, o) {
  const H = S.H, P = [], ekle = (f, k = 0.03, ten = true) => P.push({ f, k, ten });
  const kad = o.cinsiyet === 'k', gen = o.yapi ?? 1;       // yapi: 0.9 ince … 1.2 iri
  const govdeB = taban(-(o.egilme ?? 0), o.govdeDonus ?? 0);
  // gövde
  ekle(elips(S.pelvis, [0.16 * gen * (kad ? 1.08 : 1), 0.11, 0.11 * gen], govdeB), 0.06);
  ekle(elips(S.bel, [0.135 * gen * (kad ? 0.9 : 1), 0.12, 0.1 * gen * (o.gobek ?? 1)], govdeB), 0.07);
  ekle(elips(S.gogus, [0.165 * gen * (kad ? 0.92 : 1.05), 0.14, 0.11 * gen], govdeB), 0.07);
  if (kad) for (const s of [-1, 1]) ekle(elips(add(S.gogus, rotY(v(s * 0.065, -0.035, 0.07 * gen), o.govdeDonus ?? 0)), [0.065, 0.06, 0.055]), 0.05);
  ekle(koni(S.gogus, S.boyun, 0.08, 0.055), 0.05);
  // baş: yüzsüz manken — kafatası, çene, burun, kaş, kulak
  const B = S.basTaban, bp = (x, y, z) => add(S.bas, [x * B[0][0] + y * B[1][0] + z * B[2][0], x * B[0][1] + y * B[1][1] + z * B[2][1], x * B[0][2] + y * B[1][2] + z * B[2][2]]);
  ekle(koni(S.boyun, bp(0, -0.04, -0.01), 0.05, 0.048), 0.03);
  ekle(elips(bp(0, 0.02, -0.005), [0.078, 0.1, 0.092], B), 0.03);
  ekle(elips(bp(0, -0.045, 0.03), [0.058, 0.055, 0.06], B), 0.04);          // çene
  ekle(elips(bp(0, -0.005, 0.088), [0.012, 0.026, 0.02], B), 0.012);        // burun
  ekle(elips(bp(0, 0.04, 0.072), [0.05, 0.012, 0.02], B), 0.02);            // kaş çıkıntısı
  for (const s of [-1, 1]) ekle(elips(bp(s * 0.078, 0.0, 0.0), [0.012, 0.026, 0.018], B), 0.01);
  // kollar
  for (const K of [S.kolL, S.kolR]) {
    ekle(elips(K.omuz, [0.06, 0.055, 0.06]), 0.04);
    ekle(koni(K.omuz, K.dirsek, 0.052 * gen, 0.04), 0.03);
    ekle(koni(K.dirsek, K.bilek, 0.04, 0.03), 0.02);
    // el: eldiven gövdesi + başparmak
    const yan = norm(sub(K.el, K.bilek));
    ekle(koni(K.bilek, add(K.bilek, mul(yan, 0.075 * S.H)), 0.034, 0.028), 0.015);
    ekle(koni(add(K.bilek, mul(yan, 0.02)), add(K.bilek, add(mul(yan, 0.05), v(0, 0, 0.03))), 0.014, 0.01), 0.01);
  }
  // bacaklar
  for (const L of [S.bacakL, S.bacakR]) {
    ekle(koni(L.kalca, L.diz, 0.088 * gen, 0.056), 0.04);
    ekle(koni(L.diz, L.bilek, 0.055, 0.037), 0.02);
  }
  return P;
}

/* ---------- saç ---------- */
export function sac(S, tur) {
  const B = S.basTaban, bp = (x, y, z) => add(S.bas, [x * B[0][0] + y * B[1][0] + z * B[2][0], x * B[0][1] + y * B[1][1] + z * B[2][1], x * B[0][2] + y * B[1][2] + z * B[2][2]]);
  const P = [], ekle = (f, k = 0.02) => P.push({ f, k, ten: false });
  const kafa = dalga(elips(bp(0, 0.035, -0.012), [0.086, 0.1, 0.1], B), S.bas, 28, 0.0025);
  const kesikKafa = (() => { // alın ve yüz açık kalsın: kafanın ön-alt kısmını kes
    const n = norm(sub(bp(0, 1, -0.9), bp(0, 0, 0))); const d = n[0] * S.bas[0] + n[1] * S.bas[1] + n[2] * S.bas[2] - 0.02;
    return kes(kafa, n, d);
  })();
  if (tur === 'topuz') { ekle(kesikKafa); ekle(elips(bp(0, 0.1, -0.07), [0.048, 0.045, 0.045], B), 0.025); }
  if (tur === 'atkuyrugu') { ekle(kesikKafa); ekle(dalga(koni(bp(0, 0.04, -0.1), bp(0, -0.26, -0.15), 0.035, 0.018), bp(0, 0, -0.12), 14, 0.003), 0.03); }
  if (tur === 'kisa') ekle(kes(dalga(elips(bp(0, 0.045, -0.01), [0.084, 0.09, 0.098], B), S.bas, 40, 0.002), norm(sub(bp(0, 1, -0.5), bp(0, 0, 0))), (() => { const n = norm(sub(bp(0, 1, -0.5), bp(0, 0, 0))); return n[0] * S.bas[0] + n[1] * S.bas[1] + n[2] * S.bas[2] - 0.005; })()));
  if (tur === 'kaküllü') { ekle(kesikKafa); ekle(dalga(koni(bp(0, 0.02, -0.03), bp(0, -0.09, -0.02), 0.098, 0.1), bp(0, 0, 0), 60, 0.003), 0.02); }
  if (tur === 'uzun') { ekle(kesikKafa); ekle(dalga(koni(bp(0, 0.02, -0.05), bp(0, -0.3, -0.07), 0.095, 0.075), bp(0, 0, -0.05), 50, 0.004), 0.03); }
  return P;
}

/* ---------- kıyafet parçaları ---------- */
export const giysi = {
  tisort(S, o, kolBoy = 0.4) { // gövdeyi saran ince kabuk + kısa kol
    const P = [], gen = o.yapi ?? 1, B = taban(-(o.egilme ?? 0), o.govdeDonus ?? 0);
    P.push({ f: elips(S.gogus, [0.172 * gen, 0.15, 0.118 * gen], B), k: 0.07 });
    P.push({ f: elips(S.bel, [0.145 * gen, 0.13, 0.108 * gen * (o.gobek ?? 1)], B), k: 0.07 });
    P.push({ f: simit(add(S.boyun, v(0, -0.035, 0)), 0.058, 0.012), k: 0.02 }); // yaka
    for (const K of [S.kolL, S.kolR]) P.push({ f: koni(K.omuz, lerp(K.omuz, K.dirsek, kolBoy), 0.065 * gen, 0.052), k: 0.03 });
    return P;
  },
  ceket(S, o, uzun = false) {
    const P = giysi.tisort(S, o, 1.0), gen = o.yapi ?? 1, B = taban(-(o.egilme ?? 0), o.govdeDonus ?? 0);
    P.push({ f: elips(S.pelvis, [0.18 * gen, uzun ? 0.2 : 0.13, 0.13 * gen], B), k: 0.06 });
    for (const K of [S.kolL, S.kolR]) {
      P.push({ f: koni(K.dirsek, lerp(K.dirsek, K.bilek, 0.92), 0.05, 0.042), k: 0.02 });
      P.push({ f: simit(lerp(K.dirsek, K.bilek, 0.9), 0.036, 0.009, taban(0, 0, 0)), k: 0.01 });
    }
    for (const s of [-1, 1]) P.push({ f: koni(add(S.boyun, rotY(v(s * 0.05, -0.04, 0.05), o.govdeDonus ?? 0)), add(S.gogus, rotY(v(s * 0.075, -0.1, 0.115 * gen), o.govdeDonus ?? 0)), 0.018, 0.012), k: 0.015 }); // yaka
    return P;
  },
  kapusonlu(S, o) {
    const P = giysi.ceket(S, o);
    P.push({ f: elips(add(S.boyun, v(0, 0.02, -0.08)), [0.11, 0.07, 0.06]), k: 0.05 }); // arkada toplanan kapüşon
    for (const s of [-1, 1]) P.push({ f: koni(add(S.boyun, v(s * 0.035, -0.02, 0.06)), add(S.gogus, v(s * 0.04, -0.12, 0.13)), 0.006, 0.006), k: 0 }); // bağcık
    P.push({ f: elips(add(S.bel, v(0, -0.06, 0.1)), [0.1, 0.05, 0.03]), k: 0.03 }); // kanguru cep
    return P;
  },
  pantolon(S, o, bol = 1) {
    const P = [];
    for (const L of [S.bacakL, S.bacakR]) {
      P.push({ f: koni(L.kalca, L.diz, 0.095 * bol, 0.066 * bol), k: 0.03 });
      P.push({ f: koni(L.diz, add(L.bilek, v(0, 0.02, 0)), 0.064 * bol, 0.055 * bol), k: 0.02 });
    }
    P.push({ f: elips(S.pelvis, [0.17, 0.1, 0.12]), k: 0.05 });
    return P;
  },
  etek(S, o, uzunluk, pile = 0) { // bel → uzunluk (0..1 bel-bilek arası)
    const ust = add(S.bel, v(0, -0.04, 0)), altY = ust[1] - uzunluk * (ust[1] - 0.06);
    const alt = v(0, altY, 0.01), r2 = 0.17 + uzunluk * 0.12;
    let f = koni(ust, alt, 0.14, r2);
    if (pile) f = dalga(f, [0, 0, 0], pile, 0.006, y => Math.min(1, Math.max(0, (ust[1] - y) / (ust[1] - altY))));
    return [{ f, k: 0.04 }];
  },
  ayakkabi(S, o, tur = 'spor') {
    const P = [];
    for (const L of [S.bacakL, S.bacakR]) {
      const Y = L.ayakYon, B = taban(0, Math.atan2(Y[0], Y[2]) * 180 / Math.PI, 0);
      const zemin = Math.max(0.035, L.bilek[1] - 0.06);
      const merkez = add(v(L.bilek[0], zemin, L.bilek[2]), mul(Y, 0.06));
      if (tur === 'topuklu') {
        P.push({ f: kutu(add(merkez, v(0, 0.01, 0.01)), [0.035, 0.025, 0.1], 0.025, B), k: 0.02 });
        P.push({ f: koni(add(merkez, mul(Y, -0.08)), add(v(L.bilek[0], 0, L.bilek[2]), mul(Y, -0.03)), 0.012, 0.008), k: 0.005 });
      } else {
        P.push({ f: kutu(merkez, [0.045, 0.035, 0.125], 0.035, B), k: 0.025 });
        P.push({ f: kutu(add(merkez, v(0, -0.028, 0)), [0.05, 0.012, 0.132], 0.01, B), k: 0.01 }); // taban
      }
    }
    return P;
  },
};

/* ---------- aksesuarlar ---------- */
export const aksesuar = {
  telefon(S, K = S.kolR) { const B = taban(-60, 0, 0); return [{ f: kutu(add(K.el, v(0.0, 0.02, 0.02)), [0.036, 0.075, 0.005], 0.006, B), k: 0.004 }]; },
  sirtCantasi(S) { // kurye çantası: büyük kutu + askılar
    const P = [{ f: kutu(add(S.gogus, v(0, -0.02, -0.25)), [0.2, 0.22, 0.13], 0.035), k: 0.01 }];
    for (const s of [-1, 1]) P.push({ f: koni(add(S.gogus, v(s * 0.11, 0.12, -0.02)), add(S.gogus, v(s * 0.12, -0.2, 0.1)), 0.022, 0.02), k: 0.02 });
    return P;
  },
  sapka(S) {
    const B = S.basTaban, bp = (x, y, z) => add(S.bas, [x * B[0][0] + y * B[1][0] + z * B[2][0], x * B[0][1] + y * B[1][1] + z * B[2][1], x * B[0][2] + y * B[1][2] + z * B[2][2]]);
    return [
      { f: kes(elips(bp(0, 0.04, -0.005), [0.092, 0.1, 0.1], B), norm(sub(bp(0, 1, 0), S.bas)), (() => { const n = norm(sub(bp(0, 1, 0), S.bas)); return n[0] * S.bas[0] + n[1] * S.bas[1] + n[2] * S.bas[2] + 0.03; })()), k: 0.01 },
      { f: kutu(bp(0, 0.035, 0.1), [0.07, 0.006, 0.055], 0.006, B), k: 0.01 },
    ];
  },
  gozluk(S) {
    const B = S.basTaban, bp = (x, y, z) => add(S.bas, [x * B[0][0] + y * B[1][0] + z * B[2][0], x * B[0][1] + y * B[1][1] + z * B[2][1], x * B[0][2] + y * B[1][2] + z * B[2][2]]);
    const Bc = [B[0], B[2], B[1]]; // simidin ekseni başın önüne baksın
    const P = [];
    for (const s of [-1, 1]) P.push({ f: simit(bp(s * 0.036, 0.018, 0.088), 0.022, 0.004, Bc), k: 0.004 });
    P.push({ f: koni(bp(-0.014, 0.02, 0.092), bp(0.014, 0.02, 0.092), 0.004, 0.004), k: 0.004 });
    for (const s of [-1, 1]) P.push({ f: koni(bp(s * 0.058, 0.02, 0.08), bp(s * 0.08, 0.02, 0.0), 0.004, 0.004), k: 0.004 });
    return P;
  },
  canta(S, K = S.kolL) { // dirsekte asılı el çantası
    return [{ f: kutu(add(K.dirsek, v(0.07, -0.13, 0.02)), [0.03, 0.09, 0.12], 0.025), k: 0.01 },
      { f: simit(add(K.dirsek, v(0.07, -0.03, 0.02)), 0.06, 0.007, taban(0, 0, 90)), k: 0.005 }];
  },
  laptop(S) {
    const kucak = lerp(S.bacakL.diz, S.bacakR.diz, 0.5), c = add(lerp(S.pelvis, kucak, 0.6), v(0, 0.09, 0));
    return [{ f: kutu(c, [0.17, 0.009, 0.115], 0.006), k: 0.004 },
      { f: kutu(add(c, v(0, 0.1, 0.13)), [0.17, 0.115, 0.006], 0.006, taban(-20, 0, 0)), k: 0.004 }];
  },
  kulaklik(S) { // boyunda asılı
    return [{ f: simit(add(S.boyun, v(0, -0.04, 0.02)), 0.075, 0.012, taban(15, 0, 0)), k: 0.01 },
      ...[-1, 1].map(s => ({ f: elips(add(S.boyun, v(s * 0.075, -0.06, 0.06)), [0.02, 0.035, 0.035]), k: 0.01 }))];
  },
};
