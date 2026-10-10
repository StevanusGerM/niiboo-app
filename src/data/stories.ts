import type { GlossToken, StoryPair } from "../types/content";
import type { ParallelStory } from "../types/database";

const t = (w: string, py: string, id: string): GlossToken => ({ w, py, id });
const p = (w: string): GlossToken => ({ w });

function pair(pinyin: string, id: string, tokens: GlossToken[]): StoryPair {
  return { zh: tokens.map((x) => x.w).join(""), pinyin, id, tokens };
}

const CREATED = "2026-01-01T00:00:00.000Z";

export const sampleStories: ParallelStory[] = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    title_zh: "我的一天",
    title_id: "Hariku",
    hsk_level: 1,
    audio_url: null,
    created_at: CREATED,
    content_pairs: [
      pair("Wǒ jiào Xiǎo Míng.", "Nama saya Xiao Ming.", [
        t("我", "wǒ", "saya"), t("叫", "jiào", "bernama; dipanggil"), t("小明", "Xiǎo Míng", "Xiao Ming (nama orang)"), p("。"),
      ]),
      pair("Wǒ jīntiān zǎoshang qī diǎn qǐchuáng.", "Hari ini saya bangun jam tujuh pagi.", [
        t("我", "wǒ", "saya"), t("今天", "jīntiān", "hari ini"), t("早上", "zǎoshang", "pagi"),
        t("七", "qī", "tujuh"), t("点", "diǎn", "jam; pukul"), t("起床", "qǐchuáng", "bangun tidur"), p("。"),
      ]),
      pair("Wǒ hē yì bēi chá, chī yí ge bāozi.", "Saya minum secangkir teh dan makan satu bakpao.", [
        t("我", "wǒ", "saya"), t("喝", "hē", "minum"), t("一", "yì", "satu"), t("杯", "bēi", "cangkir; gelas (kata bantu bilangan)"),
        t("茶", "chá", "teh"), p("，"), t("吃", "chī", "makan"), t("一", "yí", "satu"), t("个", "ge", "kata bantu bilangan umum"),
        t("包子", "bāozi", "bakpao"), p("。"),
      ]),
      pair("Ránhòu wǒ zuò gōnggòng qìchē qù xuéxiào.", "Lalu saya naik bus ke sekolah.", [
        t("然后", "ránhòu", "lalu; kemudian"), t("我", "wǒ", "saya"), t("坐", "zuò", "naik (kendaraan); duduk"),
        t("公共汽车", "gōnggòng qìchē", "bus"), t("去", "qù", "pergi"), t("学校", "xuéxiào", "sekolah"), p("。"),
      ]),
      pair("Wǒ hěn xǐhuan xuéxí Zhōngwén!", "Saya sangat suka belajar bahasa Mandarin!", [
        t("我", "wǒ", "saya"), t("很", "hěn", "sangat"), t("喜欢", "xǐhuan", "suka"), t("学习", "xuéxí", "belajar"),
        t("中文", "Zhōngwén", "bahasa Mandarin"), p("！"),
      ]),
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    title_zh: "在饭馆",
    title_id: "Di Restoran",
    hsk_level: 2,
    audio_url: null,
    created_at: CREATED,
    content_pairs: [
      pair("Jīntiān shì wǒ péngyou de shēngrì.", "Hari ini ulang tahun teman saya.", [
        t("今天", "jīntiān", "hari ini"), t("是", "shì", "adalah"), t("我", "wǒ", "saya"), t("朋友", "péngyou", "teman"),
        t("的", "de", "partikel kepemilikan"), t("生日", "shēngrì", "ulang tahun"), p("。"),
      ]),
      pair("Wǒmen qù le yì jiā xīn kāi de fànguǎn.", "Kami pergi ke sebuah restoran yang baru buka.", [
        t("我们", "wǒmen", "kami; kita"), t("去", "qù", "pergi"), t("了", "le", "partikel aksi selesai"), t("一", "yì", "satu"),
        t("家", "jiā", "kata bantu bilangan untuk toko/restoran"), t("新", "xīn", "baru"), t("开", "kāi", "buka"),
        t("的", "de", "partikel atributif"), t("饭馆", "fànguǎn", "restoran"), p("。"),
      ]),
      pair("Fúwùyuán wèn wǒmen xiǎng chī shénme.", "Pelayan bertanya kami ingin makan apa.", [
        t("服务员", "fúwùyuán", "pelayan"), t("问", "wèn", "bertanya"), t("我们", "wǒmen", "kami"), t("想", "xiǎng", "ingin"),
        t("吃", "chī", "makan"), t("什么", "shénme", "apa"), p("。"),
      ]),
      pair("Wǒmen diǎn le yú, mǐfàn hé yìxiē shuǐguǒ.", "Kami memesan ikan, nasi, dan beberapa buah.", [
        t("我们", "wǒmen", "kami"), t("点", "diǎn", "memesan (makanan)"), t("了", "le", "partikel aksi selesai"), t("鱼", "yú", "ikan"),
        p("、"), t("米饭", "mǐfàn", "nasi"), t("和", "hé", "dan"), t("一些", "yìxiē", "beberapa"), t("水果", "shuǐguǒ", "buah-buahan"), p("。"),
      ]),
      pair("Cài fēicháng hǎochī, dàjiā dōu hěn gāoxìng.", "Masakannya sangat enak, semua orang senang.", [
        t("菜", "cài", "masakan; sayur"), t("非常", "fēicháng", "sangat; luar biasa"), t("好吃", "hǎochī", "enak"), p("，"),
        t("大家", "dàjiā", "semua orang"), t("都", "dōu", "semua; sama-sama"), t("很", "hěn", "sangat"), t("高兴", "gāoxìng", "senang"), p("。"),
      ]),
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    title_zh: "去北京旅游",
    title_id: "Berwisata ke Beijing",
    hsk_level: 3,
    audio_url: null,
    created_at: CREATED,
    content_pairs: [
      pair("Qùnián xiàtiān, wǒ dì-yī cì qù Běijīng lǚyóu.", "Musim panas tahun lalu, saya pertama kali berwisata ke Beijing.", [
        t("去年", "qùnián", "tahun lalu"), t("夏天", "xiàtiān", "musim panas"), p("，"), t("我", "wǒ", "saya"),
        t("第一次", "dì-yī cì", "pertama kali"), t("去", "qù", "pergi"), t("北京", "Běijīng", "Beijing"), t("旅游", "lǚyóu", "berwisata"), p("。"),
      ]),
      pair("Běijīng de tiānqì bǐ wǒ xiǎng de rè duō le.", "Cuaca Beijing jauh lebih panas daripada yang saya kira.", [
        t("北京", "Běijīng", "Beijing"), t("的", "de", "partikel kepemilikan"), t("天气", "tiānqì", "cuaca"), t("比", "bǐ", "dibandingkan"),
        t("我", "wǒ", "saya"), t("想", "xiǎng", "mengira; berpikir"), t("的", "de", "partikel"), t("热", "rè", "panas"),
        t("多了", "duō le", "jauh lebih"), p("。"),
      ]),
      pair("Wǒ cānguān le Chángchéng, hái pá dào le zuì gāo de dìfang.", "Saya mengunjungi Tembok Besar, dan bahkan mendaki sampai ke tempat tertinggi.", [
        t("我", "wǒ", "saya"), t("参观", "cānguān", "mengunjungi"), t("了", "le", "partikel aksi selesai"), t("长城", "Chángchéng", "Tembok Besar"),
        p("，"), t("还", "hái", "juga; bahkan"), t("爬", "pá", "mendaki; memanjat"), t("到", "dào", "sampai ke"), t("了", "le", "partikel aksi selesai"),
        t("最", "zuì", "paling"), t("高", "gāo", "tinggi"), t("的", "de", "partikel atributif"), t("地方", "dìfang", "tempat"), p("。"),
      ]),
      pair("Suīrán hěn lèi, dànshì fēngjǐng tèbié piàoliang.", "Meskipun sangat lelah, pemandangannya sangat indah.", [
        t("虽然", "suīrán", "meskipun"), t("很", "hěn", "sangat"), t("累", "lèi", "lelah"), p("，"), t("但是", "dànshì", "tetapi"),
        t("风景", "fēngjǐng", "pemandangan"), t("特别", "tèbié", "sangat; khususnya"), t("漂亮", "piàoliang", "indah; cantik"), p("。"),
      ]),
      pair("Wǒ xīwàng míngnián néng zài qù yí cì.", "Saya berharap tahun depan bisa pergi sekali lagi.", [
        t("我", "wǒ", "saya"), t("希望", "xīwàng", "berharap"), t("明年", "míngnián", "tahun depan"), t("能", "néng", "bisa"),
        t("再", "zài", "lagi"), t("去", "qù", "pergi"), t("一次", "yí cì", "sekali"), p("。"),
      ]),
    ],
  },
];
