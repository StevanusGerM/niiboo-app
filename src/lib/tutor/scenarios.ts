/** Roleplay scenarios shared by the tutor UI and the /api/tutor engine. */

export interface Line {
  zh: string;
  pinyin: string;
  id: string;
}

export interface ScenarioStep {
  ai: Line;
  /** Accepted answers: hanzi fragments or toneless pinyin fragments. */
  expect: string[];
  hint: Line;
}

export interface Scenario {
  id: string;
  title: string;
  title_zh: string;
  level: number;
  emoji: string;
  steps: ScenarioStep[];
  closing: Line;
}

const L = (zh: string, pinyin: string, id: string): Line => ({ zh, pinyin, id });

export const scenarios: Scenario[] = [
  {
    id: "intro",
    title: "Perkenalan diri",
    title_zh: "自我介绍",
    level: 1,
    emoji: "👋",
    steps: [
      {
        ai: L("你好！我叫李老师。你叫什么名字？", "Nǐ hǎo! Wǒ jiào Lǐ lǎoshī. Nǐ jiào shénme míngzi?", "Halo! Saya Guru Li. Siapa namamu?"),
        expect: ["我叫", "wo jiao", "我是", "wo shi"],
        hint: L("我叫……", "Wǒ jiào …", "Nama saya …"),
      },
      {
        ai: L("很高兴认识你！你是哪国人？", "Hěn gāoxìng rènshi nǐ! Nǐ shì nǎ guó rén?", "Senang berkenalan! Kamu orang mana?"),
        expect: ["人", "ren", "印尼", "yin ni", "印度尼西亚", "yin du ni xi ya"],
        hint: L("我是印度尼西亚人。", "Wǒ shì Yìndùníxīyà rén.", "Saya orang Indonesia."),
      },
      {
        ai: L("太好了！你为什么学习中文？", "Tài hǎo le! Nǐ wèishénme xuéxí Zhōngwén?", "Bagus! Kenapa kamu belajar bahasa Mandarin?"),
        expect: ["因为", "yin wei", "喜欢", "xi huan", "工作", "gong zuo"],
        hint: L("因为我喜欢中国文化。", "Yīnwèi wǒ xǐhuan Zhōngguó wénhuà.", "Karena saya suka budaya Tiongkok."),
      },
    ],
    closing: L("你说得很好！下次见！", "Nǐ shuō de hěn hǎo! Xià cì jiàn!", "Bicaramu bagus sekali! Sampai jumpa lagi!"),
  },
  {
    id: "restaurant",
    title: "Pesan makanan di restoran",
    title_zh: "在饭馆点菜",
    level: 1,
    emoji: "🍜",
    steps: [
      {
        ai: L("欢迎光临！请问几位？", "Huānyíng guānglín! Qǐngwèn jǐ wèi?", "Selamat datang! Untuk berapa orang?"),
        expect: ["位", "wei", "个人", "ge ren", "一", "两", "三", "yi", "liang", "san"],
        hint: L("两位。", "Liǎng wèi.", "Dua orang."),
      },
      {
        ai: L("好的，这边请。你们想吃什么？", "Hǎo de, zhèbiān qǐng. Nǐmen xiǎng chī shénme?", "Baik, silakan ke sini. Kalian mau makan apa?"),
        expect: ["想吃", "xiang chi", "要", "yao", "米饭", "mi fan", "饺子", "jiao zi", "面", "mian"],
        hint: L("我想吃饺子。", "Wǒ xiǎng chī jiǎozi.", "Saya mau makan pangsit."),
      },
      {
        ai: L("要喝什么吗？我们有茶、可乐和果汁。", "Yào hē shénme ma? Wǒmen yǒu chá, kělè hé guǒzhī.", "Mau minum apa? Kami ada teh, cola, dan jus."),
        expect: ["茶", "cha", "可乐", "ke le", "果汁", "guo zhi", "水", "shui", "不要", "bu yao"],
        hint: L("我要一杯茶。", "Wǒ yào yì bēi chá.", "Saya mau secangkir teh."),
      },
      {
        ai: L("一共八十五块。", "Yígòng bāshíwǔ kuài.", "Totalnya 85 yuan."),
        expect: ["微信", "wei xin", "支付宝", "zhi fu bao", "现金", "xian jin", "给你", "gei ni", "谢谢", "xie xie", "刷卡", "shua ka"],
        hint: L("可以用微信吗？", "Kěyǐ yòng Wēixìn ma?", "Bisa pakai WeChat?"),
      },
    ],
    closing: L("谢谢光临，慢走！", "Xièxie guānglín, màn zǒu!", "Terima kasih atas kunjungannya, hati-hati di jalan!"),
  },
  {
    id: "taxi",
    title: "Naik taksi",
    title_zh: "打车",
    level: 2,
    emoji: "🚕",
    steps: [
      {
        ai: L("你好，去哪儿？", "Nǐ hǎo, qù nǎr?", "Halo, mau ke mana?"),
        expect: ["去", "qu", "到", "dao"],
        hint: L("我去北京大学。", "Wǒ qù Běijīng Dàxué.", "Saya mau ke Universitas Peking."),
      },
      {
        ai: L("好的。现在有点儿堵车，你着急吗？", "Hǎo de. Xiànzài yǒudiǎnr dǔchē, nǐ zháojí ma?", "Baik. Sekarang agak macet, kamu buru-buru?"),
        expect: ["着急", "zhao ji", "不", "bu", "没关系", "mei guan xi", "快", "kuai"],
        hint: L("不着急，没关系。", "Bù zháojí, méi guānxi.", "Tidak buru-buru, tidak apa-apa."),
      },
      {
        ai: L("到了！一共三十二块。", "Dào le! Yígòng sānshí'èr kuài.", "Sudah sampai! Totalnya 32 yuan."),
        expect: ["给", "gei", "谢谢", "xie xie", "微信", "wei xin", "发票", "fa piao"],
        hint: L("给你钱，谢谢师傅！", "Gěi nǐ qián, xièxie shīfu!", "Ini uangnya, terima kasih Pak!"),
      },
    ],
    closing: L("不客气，再见！", "Bú kèqi, zàijiàn!", "Sama-sama, sampai jumpa!"),
  },
  {
    id: "shopping",
    title: "Tawar-menawar di pasar",
    title_zh: "买东西",
    level: 2,
    emoji: "🛍️",
    steps: [
      {
        ai: L("你好，你想买什么？", "Nǐ hǎo, nǐ xiǎng mǎi shénme?", "Halo, kamu mau beli apa?"),
        expect: ["买", "mai", "要", "yao", "看看", "kan kan"],
        hint: L("我想买这件衣服。", "Wǒ xiǎng mǎi zhè jiàn yīfu.", "Saya mau beli baju ini."),
      },
      {
        ai: L("这件衣服两百块。", "Zhè jiàn yīfu liǎngbǎi kuài.", "Baju ini 200 yuan."),
        expect: ["贵", "gui", "便宜", "pian yi", "少", "shao"],
        hint: L("太贵了！便宜一点儿吧。", "Tài guì le! Piányi yìdiǎnr ba.", "Terlalu mahal! Kurangi sedikit, ya."),
      },
      {
        ai: L("那……一百五十块，怎么样？", "Nà… yìbǎi wǔshí kuài, zěnmeyàng?", "Kalau begitu… 150 yuan, bagaimana?"),
        expect: ["好", "hao", "行", "xing", "可以", "ke yi", "买", "mai", "一百", "yi bai"],
        hint: L("好，我买了！", "Hǎo, wǒ mǎi le!", "Oke, saya beli!"),
      },
    ],
    closing: L("谢谢！欢迎下次再来！", "Xièxie! Huānyíng xià cì zài lái!", "Terima kasih! Silakan datang lagi!"),
  },
];

export const getScenario = (id: string) => scenarios.find((s) => s.id === id);
