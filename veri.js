/* Bakış Açıları — düzenlenebilir içerik
 *
 * ipucu   : 'Ortak hafıza' bölümünde yeni ziyaretçiye verdiği tavsiye
 * ozet     : finalde kişinin başında çıkan tek cümle
 * aci      : kişinin ürün etrafındaki yeri (derece, 0 = ağız tarafı / +x, saat yönünün tersine)
 * kisi     : modeller/katalog.json içindeki model adı (model/uret.mjs)
 * oturuyor : true ise altına bank konur, kamera daha alçaktan bakar
 * hedef    : kameranın ürün üzerinde baktığı nokta (ürün merkezine göre, metre)
 * palet    : kişinin renkleri (orijinal sitenin renk setlerinden); zemin = o kişideyken arka plan
 */
export const URUN = {
  ad: 'Çaydanlık',
  alt: 'Aynı çaydanlık. Altı bakış.',
  aciklama: 'Kutudan aynı gün çıktılar, aynı rafta satıldılar. Ama her biri başka bir evde, başka bir elde, başka bir tarafından yaşandı.',
};

export const BAKISLAR = [
  {
    aci: 180, kisi: 'zeynep', parca: 'Sap',
    ad: 'Zeynep', ipucu: 'Sapı her zaman duvar tarafına çevir; çocuk eli ulaşamaz.', ozet: 'Hiç ısınmıyor, ona güveniyorum.', yas: 34, rol: 'İki çocuk annesi', sure: '3 yıl · günde 5 kez',
    soz: 'Sap hiç ısınmıyor. Sabah telaşında bir kolumda çocuk, öbüründe çaydanlık; güvendiğim tek şey bu sap.',
    not: 'En çok tuttuğu yer',
    hedef: [-0.32, 0.36, 0], palet: { zemin: ['#6f6eb7', '#8f8ad1'], koyu: '#3236a8', parlak: '#6ea7ff', fresnel: '#e547cd' },
  },
  {
    aci: 0, kisi: 'emre', parca: 'Ağız',
    ad: 'Emre', ipucu: 'Termosa doldururken yarıda bir dur, damla kaçmaz.', ozet: 'Bir damla hep kaçıyor.', yas: 27, rol: 'Kurye', sure: '1 yıl · her gece termos',
    soz: 'Damlatmıyor diye almıştım. Termosa doldururken hep bir damla kaçıyor; artık yavaş döküyorum, o kadar.',
    not: 'Her gece doldurduğu yer',
    hedef: [0.34, 0.4, 0], palet: { zemin: ['#4c597f', '#5f698e'], koyu: '#2f2e72', parlak: '#9baac1', fresnel: '#e06016' },
  },
  {
    aci: 95, kisi: 'selin', parca: 'Su göstergesi', oturuyor: true,
    ad: 'Selin', ipucu: 'Çizgiler silinince bardakla doldurup kendin işaretle.', ozet: 'Çizgileri ezberledim.', yas: 41, rol: 'Çay ocağı işletiyor', sure: '5 yıl · günde 40 bardak',
    soz: 'Göstergedeki çizgilere göre demlerim: iki bardak, dört bardak. Çizgiler silindi, ben ezberledim.',
    not: 'Her demde baktığı yer',
    hedef: [0, 0.22, 0.2], palet: { zemin: ['#366868', '#41726f'], koyu: '#12156b', parlak: '#6dd1aa', fresnel: '#e83145' },
  },
  {
    aci: 250, kisi: 'aylin', parca: 'Kapak',
    ad: 'Aylin', ipucu: 'Kapağı ortadan değil yandan bastır, yay daha uzun dayanır.', ozet: 'Artık iki kez basıyorum.', yas: 58, rol: 'Emekli öğretmen', sure: '6 yıl · günde 3 kez',
    soz: 'Tek tuşla açılır dediler. Bende yayı gevşedi, iki kez basıyorum. Yine de başka birini istemem.',
    not: 'Her sabah açtığı yer',
    hedef: [0, 0.56, 0], palet: { zemin: ['#5c4c7f', '#6b5f8e'], koyu: '#321b77', parlak: '#9baac1', fresnel: '#964a1c' },
  },
  {
    aci: 140, kisi: 'kaan', parca: 'Düğme ve ışık',
    ad: 'Kaan', ipucu: 'Işık titremeye başlarsa tabanı kuru bezle sil.', ozet: 'Gece lambam oldu.', yas: 23, rol: 'Üniversite öğrencisi', sure: '2 yıl · yurt odasında',
    soz: 'Mavi ışığı yurtta gece lambam oldu. Kaynayınca çıkan tık sesi oda arkadaşımı her seferinde uyandırıyor.',
    not: 'Geceleri izlediği yer',
    hedef: [-0.3, 0.1, 0.08], palet: { zemin: ['#384f7c', '#3e587c'], koyu: '#000063', parlak: '#78afce', fresnel: '#f9450c' },
  },
  {
    aci: 305, kisi: 'mert', parca: 'Taban ve kablo', oturuyor: true,
    ad: 'Mert', ipucu: 'Uzatma kablosu değil, masayı prize yaklaştır.', ozet: 'Kablo kısa, masaya yetmiyor.', yas: 30, rol: 'Yazılımcı', sure: '4 yıl · masa başında',
    soz: 'Tabanı her yöne dönüyor, harika. Ama kablo kısa, masama taşıyamıyorum. Kaynamasını ayakta beklemeyi sevdim.',
    not: 'Hiç görünmeyen ama hep dert olan yer',
    hedef: [0.05, -0.02, -0.12], palet: { zemin: ['#060c2b', '#0b1438'], koyu: '#000023', parlak: '#4b5291', fresnel: '#17c49b' },
  },
];

/* ---------- hikâye: sayfanın bütün bölümleri ---------- */
export const TEZ = 'Bir ürün deneyimi tek seferde verilen sabit bir hüküm değil, zaman içinde oluşan ve değişebilen bir ilişkidir.';

export const HIKAYE = {
  giris: {
    kas: 'useum — kişisel deneyim müzesi',
    baslik: 'Bir ürünü en iyi,\nonunla yaşayan anlatır.',
    metin: 'useum, herkesin her gün kullandığı eşyaları ve onlarla geçen zamanı sergileyen bir müze. Vitrinde ürün değil, ilişki var.',
  },
  hukum: {
    kas: '01 — Hüküm',
    baslik: 'Bugün bildiğimiz her şey\nkutunun açıldığı güne ait.',
    metin: 'Yıldızlar, tek cümlelik yorumlar, ilk izlenimler. Hepsi bir anın fotoğrafı. Oysa ürünle ilişki tam o gün başlıyor.',
    kart: { yildiz: 5, soz: 'Harika ürün, çok şık. Tavsiye ederim!', alt: '1. gün · doğrulanmış alıcı' },
  },
  tez: { kas: '02 — useum’un iddiası' },
  zaman: {
    kas: '03 — Zaman',
    baslik: 'Aynı kişi, aynı çaydanlık,\naltı yıl.',
    kisi: 3, // BAKISLAR içindeki sıra (Aylin)
    adimlar: [
      { etiket: '1. gün', his: 'Heves', deger: 0.92, soz: 'Kapağı tek tuşla açılıyor, bayıldım. Mutfağa da çok yakıştı.' },
      { etiket: '3. ay', his: 'Alışkanlık', deger: 0.72, soz: 'Artık sabah ilk iş düğmesine basıyorum, bakmadan bile.' },
      { etiket: '1. yıl', his: 'Kırgınlık', deger: 0.3, soz: 'Kapağın yayı gevşedi. İki kez basmam gerekiyor, sinir oluyorum.' },
      { etiket: '6. yıl', his: 'Bağ', deger: 0.84, soz: 'Yine de başka birini istemem. Ben onun huyunu biliyorum, o da benimkini.' },
    ],
    not: '1. gün verilen beş yıldız, bu hikâyenin sadece ilk noktası.',
  },
  bakislar: {
    kas: '04 — Bakışlar',
    baslik: 'Ve herkes bu ilişkiyi\nbaşka bir yerden kurar.',
    metin: URUN.aciklama,
  },
  salon: {
    kas: '05 — Senin salonun',
    baslik: 'Kullandığın her eşya,\nkendi kaidesinde.',
    metin: 'Kimse sana neyi sevmen gerektiğini söylemez. Her eşyanın yanında kendi zaman çizgin durur: ne zaman sevdin, ne zaman kırıldın, neden hâlâ bırakmadın.',
    eserler: [
      { ad: 'Çaydanlık', sure: '6 yıl · her sabah', seyir: [0.92, 0.72, 0.3, 0.84] },
      { ad: 'Termos', sure: '8 ay · işe giderken', seyir: [0.8, 0.85, 0.9] },
      { ad: 'Kulaklık', sure: '3 yıl · metroda', seyir: [0.95, 0.6, 0.65, 0.7] },
      { ad: 'Koşu ayakkabısı', sure: '1.200 km', seyir: [0.7, 0.9, 0.85, 0.4] },
    ],
  },
  hafiza: {
    kas: '06 — Ortak hafıza',
    baslik: 'Birinin altıncı yılı,\nbaşka birinin ilk günü.',
    metin: 'Uzun süre yaşayanların notları, yeni başlayanın rehberi olur. İpuçları yıldızdan değil, yaşanmış zamandan gelir.',
    ziyaretci: { kisi: 'ziyaretci', aci: 48, ad: 'Deniz', soz: 'Bugün aldım. Neye dikkat etmeliyim?' },
  },
  final: {
    kas: 'useum',
    baslik: 'Ürünler değişmez.\nOnlarla ilişkimiz değişir.',
  },
  arama: {
    sorgu: 'çaydanlık',
    toplam: 12480, deneyim: 38200, aday: 38,
    filtreler: ['İki çocuk', 'Küçük mutfak', 'Sabah 6.30', '3+ yıl kullanım'],
    adimlar: [
      { kas: '07 — Arama', baslik: 'Binlerce hayat,\ntek bir arama.', metin: 'useum’da bir ürünü aradığında karşına bir yıldız ortalaması değil, onu yaşamış insanlar çıkar.' },
      { kas: '07 — Arama', baslik: 'Sonra geriye\nsana benzeyenler kalır.', metin: 'Evin, rutinin, kullanım biçimin. Senin hayatına en yakın deneyimler öne çıkar; gerisi sessizce geri çekilir.' },
      { kas: '07 — Eşleşme', baslik: 'Seninle aynı sabahları\nyaşamış biri.', metin: 'Karar verirken ihtiyacın bir puan değil; senin yerinde olmuş birinin zamanla ne öğrendiği.', dugme: 'Salonunu aç' },
    ],
    eslesen: {
      kisi: 'eslesen', ad: 'Elif', yas: 36, benzerlik: 94,
      rol: 'İki çocuk annesi · 1+1 ev', sure: '4 yıl · her sabah 6.30',
      nedenler: ['İki çocuk', 'Küçük mutfak', 'Sabah 6.30', '4 yıldır aynı çaydanlık'],
      soz: 'İlk yıl kapaktan çıkan buhar elimi yaktı; şimdi hep sapı duvara bakacak şekilde koyuyorum. Dördüncü yılında hâlâ mutfağın en güvendiğim eşyası.',
      palet: { koyu: '#3236a8', parlak: '#6ea7ff', fresnel: '#e547cd' },
    },
  },
};
