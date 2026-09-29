// Bakış Açıları için kendi tasarladığımız 6 kişi → ../modeller/<ad>.bin + katalog.json
// Çalıştır: node bakis/model/uret.mjs   (tek kişi: node bakis/model/uret.mjs zeynep)
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import { alan, mesh, v, add, lerp, kutu, koni, simit } from './sdf.mjs';
import { iskelet, beden, sac, giysi, aksesuar } from './insan.mjs';
const HEDEF = path.join(path.dirname(fileURLToPath(import.meta.url)), '../modeller');
fs.mkdirSync(HEDEF, { recursive: true });

export const KISILER = {
  zeynep: { boy: 1.66, cinsiyet: 'k', yapi: 0.95, sac: 'atkuyrugu',
    kolSag: { one: 55, dirsek: 70, yana: 10, kivir: 35 }, kolSol: { one: 5, dirsek: 12, yana: 10 },
    bacakSol: { one: 4, yana: 3 }, bacakSag: { one: -6, yana: 1, ayakDon: 18 }, basEgim: 12, basDonus: -8,
    giysi: S => [...giysi.tisort(S, { yapi: 0.95 }, 0.35), ...giysi.etek(S, {}, 0.95, 46), ...giysi.ayakkabi(S, {}, 'spor')],
    aksesuar: S => aksesuar.telefon(S) },
  emre: { boy: 1.81, cinsiyet: 'e', yapi: 1.05, sac: 'kisa', egilme: 4,
    kolSag: { one: 20, dirsek: 70, yana: 14, kivir: 30 }, kolSol: { one: 20, dirsek: 70, yana: 14, kivir: 30 },
    bacakSol: { one: 3, yana: 5, ayakDon: 12 }, bacakSag: { one: -2, yana: 4, ayakDon: 14 },
    giysi: S => [...giysi.ceket(S, { yapi: 1.05 }), ...giysi.pantolon(S, {}, 1.12), ...giysi.ayakkabi(S, {}, 'spor')],
    aksesuar: S => [...aksesuar.sirtCantasi(S), ...aksesuar.sapka(S)] },
  selin: { boy: 1.64, cinsiyet: 'k', yapi: 1.0, sac: 'topuz', oturuyor: true, egilme: 10, basEgim: 14,
    kolSag: { one: 38, dirsek: 40, yana: 4, kivir: 25 }, kolSol: { one: 38, dirsek: 44, yana: 4, kivir: 28 },
    bacakSol: { one: 92, diz: 100, yana: -6, don: -8, ayakDon: -10 }, bacakSag: { one: 82, diz: 84, yana: 2, altYana: -8, don: 6 },
    giysi: S => [...giysi.ceket(S, { yapi: 1.0 }, true), ...giysi.pantolon(S, {}, 1.05), ...giysi.ayakkabi(S, {}, 'spor')],
    aksesuar: S => [] },
  aylin: { boy: 1.62, cinsiyet: 'k', yapi: 1.1, gobek: 1.1, sac: 'kaküllü', basEgim: -4, basDonus: 10,
    kolSag: { one: 50, dirsek: 60, yana: 18, kivir: 10 }, kolSol: { one: 10, dirsek: 95, yana: 12, kivir: 60 },
    bacakSol: { one: -3, yana: 2 }, bacakSag: { one: 5, yana: 3, ayakDon: 10 },
    giysi: S => [...giysi.tisort(S, { yapi: 1.1, gobek: 1.1 }, 0.7), ...giysi.etek(S, {}, 0.6, 18), ...giysi.ayakkabi(S, {}, 'topuklu')],
    aksesuar: S => [...aksesuar.gozluk(S), ...aksesuar.canta(S)] },
  kaan: { boy: 1.78, cinsiyet: 'e', yapi: 0.92, sac: 'kısa', govdeDonus: 8, basDonus: -6,
    kolSag: { one: 85, dirsek: 25, yana: 22, kivir: 5 }, kolSol: { one: 12, dirsek: 55, yana: 6, kivir: 40 },
    bacakSol: { one: -4, yana: 6, ayakDon: 14 }, bacakSag: { one: 6, yana: 3 },
    giysi: S => [...giysi.kapusonlu(S, { yapi: 0.92 }), ...giysi.pantolon(S, {}, 1.18), ...giysi.ayakkabi(S, {}, 'spor')],
    aksesuar: S => [] },
  mert: { boy: 1.8, cinsiyet: 'e', yapi: 1.08, sac: 'kisa', oturuyor: true, egilme: 16, basEgim: 26,
    kolSag: { one: 42, dirsek: 38, yana: 6, kivir: 30 }, kolSol: { one: 42, dirsek: 38, yana: 6, kivir: 30 },
    bacakSol: { one: 88, diz: 88, yana: 8 }, bacakSag: { one: 88, diz: 88, yana: 8 },
    giysi: S => [...giysi.tisort(S, { yapi: 1.08 }, 0.42), ...giysi.pantolon(S, {}, 1.06), ...giysi.ayakkabi(S, {}, 'spor')],
    aksesuar: S => [...aksesuar.laptop(S), ...aksesuar.kulaklik(S)] },
  ziyaretci: { boy: 1.72, cinsiyet: 'k', yapi: 0.98, sac: 'uzun', basEgim: 8, basDonus: 6,
    kolSag: { one: 30, dirsek: 60, yana: 8, kivir: 40 }, kolSol: { one: 30, dirsek: 60, yana: 8, kivir: 40 },
    bacakSol: { one: 2, yana: 3 }, bacakSag: { one: -3, yana: 3, ayakDon: 10 },
    giysi: S => [...giysi.ceket(S, { yapi: 0.98 }, true), ...giysi.pantolon(S, {}, 1.04), ...giysi.ayakkabi(S, {}, 'spor')],
    aksesuar: S => [{ f: kutu(add(lerp(S.kolL.el, S.kolR.el, 0.5), v(0, 0.02, 0.07)), [0.13, 0.15, 0.1], 0.012), k: 0.01 }] }, // kucağında yeni kutu
  eslesen: { boy: 1.68, cinsiyet: 'k', yapi: 1.0, sac: 'topuz', basEgim: 4, basDonus: -10, govdeDonus: 6,
    kolSag: { one: 48, dirsek: 75, yana: 10, kivir: 38 }, kolSol: { one: 40, dirsek: 80, yana: 10, kivir: 45 },
    bacakSol: { one: 3, yana: 3, ayakDon: 12 }, bacakSag: { one: -4, yana: 2 },
    giysi: S => [...giysi.ceket(S, { yapi: 1.0 }, true), ...giysi.pantolon(S, {}, 1.08), ...giysi.ayakkabi(S, {}, 'spor')],
    aksesuar: S => { const c = add(lerp(S.kolL.el, S.kolR.el, 0.5), v(0, 0.03, 0.05)); return [{ f: koni(c, add(c, v(0, 0.1, 0)), 0.045, 0.05), k: 0.006 }, { f: simit(add(c, v(0.055, 0.05, 0)), 0.026, 0.007, [[1, 0, 0], [0, 0, 1], [0, 1, 0]]), k: 0.004 }]; } },
};

function uret(ad, h = 0.008, ek = '') {
  const o = KISILER[ad], t0 = Date.now();
  if (o.sac === 'kısa') o.sac = 'kisa';
  const S = iskelet(o);
  const parca = [...beden(S, o), ...sac(S, o.sac), ...o.giysi(S), ...o.aksesuar(S)];
  const A = alan(parca);
  const m = mesh(A, v(-0.6, -0.01, -0.55), v(0.6, 2.0, 0.8), h);
  const buf = Buffer.concat([
    Buffer.from(m.Pos.buffer),
    Buffer.from(Int8Array.from(m.N, x => Math.round(x * 127)).buffer),
    Buffer.from(m.AO.buffer), Buffer.from(m.SK.buffer), Buffer.from(m.I.buffer),
  ]);
  fs.writeFileSync(path.join(HEDEF, ad + ek + '.bin'), buf);
  const kayit = { ad: ad + ek, V: m.Pos.length / 3, I: m.I.length, oturuyor: !!o.oturuyor, bank: o.oturuyor ? S.pelvis[2] - 0.05 : null };
  console.log((ad + ek).padEnd(18), kayit.V, 'vertex', kayit.I / 3, 'üçgen', ((Date.now() - t0) / 1000).toFixed(1) + ' sn');
  return kayit;
}

const arg = process.argv.slice(2), dusuk = arg.includes('--dusuk');
const secim = arg.filter(x => !x.startsWith('--'));
// --dusuk: kalabalık sahnesi için kaba (≈1/8 vertex) kopyalar → <ad>_dusuk.bin
const DUSUK = ['zeynep', 'emre', 'aylin', 'kaan', 'ziyaretci', 'eslesen'];
const katYol = path.join(HEDEF, 'katalog.json');
const katalog = fs.existsSync(katYol) ? JSON.parse(fs.readFileSync(katYol)) : [];
for (const ad of secim.length ? secim : dusuk ? DUSUK : Object.keys(KISILER)) {
  const k = dusuk ? uret(ad, 0.021, '_dusuk') : uret(ad); const i = katalog.findIndex(x => x.ad === k.ad);
  if (i >= 0) katalog[i] = k; else katalog.push(k);
}
fs.writeFileSync(katYol, JSON.stringify(katalog, null, 1));
