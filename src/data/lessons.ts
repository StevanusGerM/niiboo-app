import type { VocabItem } from "../types/content";
import type { Lesson } from "../types/database";

const v = (hanzi: string, pinyin: string, meaning: string): VocabItem => ({ hanzi, pinyin, meaning });
const CREATED = "2026-01-01T00:00:00.000Z";

let n = 100;
function lesson(hsk_level: number, title: string, category: string, intro: string, vocab: VocabItem[], grammar_tip?: string): Lesson {
  n += 1;
  return {
    id: `00000000-0000-4000-8000-000000000${n}`,
    hsk_level,
    title,
    category,
    created_at: CREATED,
    content_json: { intro, vocab, grammar_tip },
  };
}

export const sampleLessons: Lesson[] = [
  lesson(1, "Salam & Perkenalan", "greetings", "Sapaan dasar untuk memulai percakapan pertamamu.", [
    v("你好", "nǐ hǎo", "halo"), v("谢谢", "xièxie", "terima kasih"), v("再见", "zàijiàn", "sampai jumpa"),
    v("我", "wǒ", "saya"), v("是", "shì", "adalah"), v("不", "bù", "tidak"),
  ], "Dua nada ke-3 berurutan: nada pertama berubah jadi nada ke-2 → nǐ hǎo dibaca ní hǎo."),
  lesson(1, "Angka & Waktu", "numbers", "Hitung dari satu sampai sepuluh dan sebutkan jam.", [
    v("一", "yī", "satu"), v("二", "èr", "dua"), v("三", "sān", "tiga"),
    v("十", "shí", "sepuluh"), v("今天", "jīntiān", "hari ini"), v("点", "diǎn", "jam; pukul"),
  ], "Jam ditulis angka + 点: 三点 = jam tiga."),
  lesson(1, "Makanan & Minuman", "food", "Pesan makanan dan minuman favoritmu.", [
    v("吃", "chī", "makan"), v("喝", "hē", "minum"), v("茶", "chá", "teh"),
    v("米饭", "mǐfàn", "nasi"), v("水", "shuǐ", "air"), v("菜", "cài", "masakan; sayur"),
  ]),
  lesson(2, "Transportasi", "travel", "Bicara tentang cara pergi ke suatu tempat.", [
    v("坐", "zuò", "naik (kendaraan)"), v("飞机", "fēijī", "pesawat"), v("火车站", "huǒchēzhàn", "stasiun kereta"),
    v("出租车", "chūzūchē", "taksi"), v("远", "yuǎn", "jauh"), v("近", "jìn", "dekat"),
  ], "Pola: S + 坐 + kendaraan + 去 + tempat → 我坐飞机去北京。"),
  lesson(2, "Cuaca", "daily", "Ceritakan cuaca hari ini.", [
    v("天气", "tiānqì", "cuaca"), v("下雨", "xià yǔ", "hujan"), v("冷", "lěng", "dingin"),
    v("热", "rè", "panas"), v("晴", "qíng", "cerah"), v("雪", "xuě", "salju"),
  ]),
  lesson(3, "Berwisata", "travel", "Kosakata penting untuk liburanmu ke Tiongkok.", [
    v("旅游", "lǚyóu", "berwisata"), v("护照", "hùzhào", "paspor"), v("地图", "dìtú", "peta"),
    v("参观", "cānguān", "mengunjungi"), v("照片", "zhàopiàn", "foto"), v("行李", "xíngli", "bagasi"),
  ], "把 memindahkan objek ke depan kata kerja: 请把护照给我。"),
  lesson(4, "Dunia Kerja", "career", "Persiapan wawancara kerja berbahasa Mandarin.", [
    v("面试", "miànshì", "wawancara"), v("经验", "jīngyàn", "pengalaman"), v("负责", "fùzé", "bertanggung jawab"),
    v("工资", "gōngzī", "gaji"), v("招聘", "zhāopìn", "merekrut"), v("应聘", "yìngpìn", "melamar kerja"),
  ]),
  lesson(5, "Lingkungan Hidup", "society", "Diskusikan isu lingkungan dengan kosakata tingkat lanjut.", [
    v("环境", "huánjìng", "lingkungan"), v("污染", "wūrǎn", "polusi"), v("保护", "bǎohù", "melindungi"),
    v("资源", "zīyuán", "sumber daya"), v("节约", "jiéyuē", "menghemat"), v("气候", "qìhòu", "iklim"),
  ]),
  lesson(6, "Masyarakat & Pembangunan", "society", "Bahasa formal untuk berita dan esai.", [
    v("繁荣", "fánróng", "makmur"), v("倡导", "chàngdǎo", "menganjurkan"), v("可持续", "kě chíxù", "berkelanjutan"),
    v("贯彻", "guànchè", "melaksanakan sepenuhnya"), v("弘扬", "hóngyáng", "menggalakkan"), v("举世瞩目", "jǔshì zhǔmù", "menarik perhatian dunia"),
  ]),
];
