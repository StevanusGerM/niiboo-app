import type { ExamQuestion } from "../types/content";
import type { HskExam, SectionType } from "../types/database";

type Mcq = Extract<ExamQuestion, { kind: "mcq" }>;
type Order = Extract<ExamQuestion, { kind: "order" }>;

const LISTEN = "Dengarkan audio, lalu pilih jawaban yang benar.";

const listen = (id: string, audio_text: string, prompt: string, options: string[], answer: number, explanation: string): Mcq =>
  ({ kind: "mcq", id, audio_text, prompt: `${LISTEN} ${prompt}`, options, answer, explanation });
const read = (id: string, passage_zh: string, prompt: string, options: string[], answer: number, explanation: string): Mcq =>
  ({ kind: "mcq", id, passage_zh, prompt, options, answer, explanation });
const order = (id: string, prompt: string, fragments: string[], answer: string, explanation: string): Order =>
  ({ kind: "order", id, prompt: `Susun menjadi kalimat: “${prompt}”`, fragments, answer, explanation });

const bank: Record<number, Record<SectionType, ExamQuestion[]>> = {
  1: {
    listening: [
      listen("1l1", "你好！我叫王芳。", "Siapa nama orang itu?", ["李明", "王芳", "张伟", "小红"], 1, "“我叫王芳” berarti “Nama saya Wang Fang”. 叫 (jiào) dipakai untuk menyebut nama."),
      listen("1l2", "我今天喝茶，不喝咖啡。", "Apa yang dia minum hari ini?", ["Kopi", "Teh", "Air", "Susu"], 1, "喝茶 = minum teh; 不喝咖啡 = tidak minum kopi."),
      listen("1l3", "现在是下午三点。", "Jam berapa sekarang?", ["03.00", "13.00", "15.00", "15.30"], 2, "下午 = siang/sore, 三点 = jam tiga → pukul 15.00."),
      listen("1l4", "我的妈妈是医生。", "Apa pekerjaan ibunya?", ["Guru", "Dokter", "Pelajar", "Koki"], 1, "医生 (yīshēng) = dokter. 妈妈 = ibu."),
    ],
    reading: [
      read("1r1", "猫", "Apa arti karakter ini?", ["Anjing", "Kucing", "Ikan", "Burung"], 1, "猫 (māo) = kucing. Anjing = 狗, ikan = 鱼, burung = 鸟."),
      read("1r2", "我在学校学习汉语。", "Di mana dia belajar?", ["Di rumah", "Di sekolah", "Di restoran", "Di rumah sakit"], 1, "在 + tempat menunjukkan lokasi. 学校 = sekolah."),
      read("1r3", "A：你几岁了？ B：____", "Pilih jawaban yang tepat untuk B.", ["我八岁了。", "我是中国人。", "我喜欢猫。", "我叫小明。"], 0, "几岁 menanyakan umur (untuk anak-anak). Jawabannya: angka + 岁."),
      read("1r4", "明天星期六，我不去学校。", "Mengapa dia tidak ke sekolah besok?", ["Dia sakit", "Besok hari Sabtu", "Sekolah tutup karena hujan", "Dia pindah"], 1, "星期六 = hari Sabtu. Kalimat menyiratkan tidak ada sekolah di hari Sabtu."),
    ],
    writing: [
      order("1w1", "Saya orang Indonesia.", ["人", "我", "印度尼西亚", "是"], "我是印度尼西亚人", "Pola: Subjek + 是 + nama negara + 人."),
      order("1w2", "Kamu mau minum apa?", ["喝", "你", "什么", "想"], "你想喝什么", "Kata tanya 什么 tetap di posisi objek — tidak dipindah ke depan kalimat."),
      order("1w3", "Dia tidak suka kucing.", ["不", "他", "猫", "喜欢"], "他不喜欢猫", "不 diletakkan tepat sebelum kata kerja yang dinegasikan."),
      read("1w4", "我___中国人。", "Pilih karakter yang tepat.", ["是", "在", "有", "叫"], 0, "是 = adalah. 在 = berada di, 有 = punya, 叫 = bernama."),
    ],
  },
  2: {
    listening: [
      listen("2l1", "男：你怎么去机场？女：我打算坐出租车去。", "Wanita itu naik apa ke bandara?", ["Bus", "Kereta", "Taksi", "Pesawat"], 2, "坐出租车 = naik taksi. 打算 = berencana."),
      listen("2l2", "我比我姐姐高一点儿。", "Siapa yang lebih tinggi?", ["Kakak perempuannya", "Pembicara", "Sama tinggi", "Tidak disebutkan"], 1, "Pola A 比 B + adj: A lebih ... daripada B. Pembicara (我) sedikit lebih tinggi."),
      listen("2l3", "外面正在下雨，别忘了带伞。", "Bagaimana cuaca di luar?", ["Cerah", "Bersalju", "Hujan", "Berangin"], 2, "正在下雨 = sedang hujan. 带伞 = bawa payung."),
      listen("2l4", "这件衣服三百块，太贵了。", "Menurut pembicara, baju itu…", ["Terlalu mahal", "Murah", "Terlalu kecil", "Bagus sekali"], 0, "太…了 = terlalu … ; 贵 = mahal."),
    ],
    reading: [
      read("2r1", "我已经吃过饭了，你们吃吧。", "Apa maksud pembicara?", ["Dia belum makan", "Dia sudah makan", "Dia ingin makan bersama", "Dia lapar sekali"], 1, "已经…了 = sudah. 吃过饭 = sudah makan."),
      read("2r2", "因为生病了，所以小王今天没来上班。", "Mengapa Xiao Wang tidak masuk kerja?", ["Bangun kesiangan", "Sakit", "Liburan", "Macet"], 1, "因为…所以… = karena… maka… ; 生病 = sakit."),
      read("2r3", "A：你的手机号码是多少？ B：____", "Pilih jawaban yang tepat untuk B.", ["13812345678。", "我的手机很新。", "我在打电话。", "我没有时间。"], 0, "号码是多少 menanyakan nomor, jadi jawabannya deretan angka."),
      read("2r4", "从我家到公司要走二十分钟。", "Berapa lama berjalan dari rumah ke kantor?", ["2 menit", "12 menit", "20 menit", "2 jam"], 2, "从…到… = dari… ke… ; 二十分钟 = 20 menit."),
    ],
    writing: [
      order("2w1", "Saya sedang membaca buku.", ["书", "我", "看", "在"], "我在看书", "在 + kata kerja menunjukkan aksi yang sedang berlangsung."),
      order("2w2", "Dia lebih tinggi dari saya.", ["我", "高", "他", "比"], "他比我高", "Pola perbandingan: A + 比 + B + kata sifat. Jangan tambahkan 很."),
      order("2w3", "Saya pernah ke Tiongkok.", ["过", "中国", "我", "去"], "我去过中国", "Kata kerja + 过 menyatakan pengalaman di masa lalu."),
      read("2w4", "你吃饭___吗？", "Isi titik-titik: “Kamu sudah makan?”", ["了", "的", "过", "着"], 0, "了 menandai aksi yang sudah selesai."),
    ],
  },
  3: {
    listening: [
      listen("3l1", "虽然今天很冷，但是他还是去公园跑步了。", "Apa yang dia lakukan?", ["Tetap di rumah", "Lari di taman", "Berenang", "Menonton TV"], 1, "虽然…但是… = meskipun… tetapi… ; 还是 = tetap. 去公园跑步 = lari di taman."),
      listen("3l2", "女：会议几点开始？男：本来是九点，现在改到十点半了。", "Jam berapa rapat dimulai sekarang?", ["09.00", "09.30", "10.00", "10.30"], 3, "本来 = semula; 改到十点半 = diubah ke 10.30."),
      listen("3l3", "我把钥匙忘在办公室了，进不了门。", "Apa masalahnya?", ["Kehilangan dompet", "Kunci tertinggal di kantor", "Pintu rusak", "Terlambat kerja"], 1, "把钥匙忘在办公室 = kunci tertinggal di kantor; 进不了 = tidak bisa masuk."),
      listen("3l4", "这个周末要是天气好的话，我们就去爬山吧。", "Kapan mereka akan mendaki gunung?", ["Pasti akhir pekan ini", "Akhir pekan ini jika cuaca bagus", "Besok", "Bulan depan"], 1, "要是…的话，就… = jika… maka…. Rencananya bersyarat pada cuaca."),
    ],
    reading: [
      read("3r1", "小李最近工作特别忙，每天都要加班到很晚，连周末也不能休息。", "Bagaimana keadaan Xiao Li akhir-akhir ini?", ["Sedang liburan", "Sangat sibuk bekerja", "Mencari pekerjaan", "Sering bolos"], 1, "加班 = lembur; 连…也… = bahkan… pun…. Dia sangat sibuk."),
      read("3r2", "这家超市的东西又便宜又新鲜，所以附近的人都喜欢来这儿买菜。", "Mengapa orang suka belanja di sini?", ["Dekat stasiun", "Murah dan segar", "Buka 24 jam", "Ada diskon"], 1, "又…又… = …dan juga…; 便宜 = murah, 新鲜 = segar."),
      read("3r3", "请把窗户关上，外边风太大了。", "Apa yang diminta pembicara?", ["Membuka jendela", "Menutup jendela", "Menyalakan AC", "Keluar rumah"], 1, "把窗户关上 = tutup jendelanya. Alasannya angin di luar terlalu kencang."),
      read("3r4", "他越说越激动，最后声音都变了。", "Pola 越…越… berarti…", ["Semakin… semakin…", "Baik… maupun…", "Bukan… melainkan…", "Jika… maka…"], 0, "越 A 越 B = semakin A semakin B: semakin bicara, semakin emosional."),
    ],
    writing: [
      order("3w1", "Tolong letakkan buku di atas meja.", ["把", "放在", "请", "书", "桌子上"], "请把书放在桌子上", "Kalimat 把: (请) + 把 + objek + kata kerja + pelengkap tempat."),
      order("3w2", "Bahasa Mandarinnya semakin lama semakin bagus.", ["越来越", "他的", "好", "汉语"], "他的汉语越来越好", "越来越 + kata sifat = semakin lama semakin …."),
      order("3w3", "Saya sudah belajar bahasa Mandarin selama dua tahun.", ["两年", "汉语", "我", "了", "学了"], "我学了两年汉语了", "Durasi diletakkan setelah V+了; 了 di akhir menandakan aksi masih berlanjut."),
      read("3w4", "他跑___很快。", "Pilih partikel yang tepat.", ["得", "的", "地", "了"], 0, "得 menghubungkan kata kerja dengan pelengkap derajat: 跑得很快 = larinya cepat."),
    ],
  },
  4: {
    listening: [
      listen("4l1", "这次面试我准备得很充分，所以一点儿也不紧张。", "Bagaimana perasaannya?", ["Sangat gugup", "Sama sekali tidak gugup", "Kecewa", "Marah"], 1, "准备得很充分 = persiapannya matang; 一点儿也不紧张 = sama sekali tidak gugup."),
      listen("4l2", "男：咱们打车去吧？女：这个时间肯定堵车，还不如坐地铁呢。", "Wanita itu menyarankan apa?", ["Naik taksi", "Naik subway", "Jalan kaki", "Naik bus"], 1, "还不如 = lebih baik…. 坐地铁 = naik subway karena pasti macet."),
    ],
    reading: [
      read("4r1", "随着科技的发展，越来越多的人习惯在网上购物，这不仅节约了时间，而且价格往往更便宜。", "Apa keuntungan belanja online menurut teks?", ["Barang lebih bagus", "Hemat waktu dan sering lebih murah", "Pengiriman gratis", "Bisa dicoba dulu"], 1, "不仅…而且… = tidak hanya… tetapi juga…: 节约了时间 dan 价格往往更便宜."),
      read("4r2", "他之所以能成功，是因为他从来没有放弃过。", "Mengapa dia berhasil?", ["Karena keberuntungan", "Karena tidak pernah menyerah", "Karena kaya", "Karena dibantu teman"], 1, "之所以…是因为… = alasan… adalah karena…; 从来没有放弃过 = tidak pernah menyerah."),
    ],
    writing: [
      order("4w1", "Masalah ini sudah diselesaikan olehnya.", ["被", "这个问题", "解决了", "他"], "这个问题被他解决了", "Kalimat pasif: objek + 被 + pelaku + kata kerja + 了."),
      order("4w2", "Saya sangat tertarik pada budaya Tiongkok.", ["对", "感兴趣", "我", "中国文化", "很"], "我对中国文化很感兴趣", "Pola: S + 对 + sesuatu + (很) 感兴趣."),
    ],
  },
  5: {
    listening: [
      listen("5l1", "尽管这个方案还有一些不足，但总的来说是可行的。", "Bagaimana penilaian terhadap rencana itu?", ["Sempurna", "Ada kekurangan tetapi secara umum layak", "Sama sekali tidak layak", "Belum dibaca"], 1, "尽管…但… = meskipun… tetapi…; 可行 = layak dijalankan."),
      listen("5l2", "女：听说你辞职了？男：是啊，我打算自己创业，趁年轻多闯一闯。", "Apa rencana pria itu?", ["Melanjutkan kuliah", "Memulai usaha sendiri", "Pindah ke luar negeri", "Pensiun"], 1, "创业 = merintis usaha; 趁年轻 = selagi muda."),
    ],
    reading: [
      read("5r1", "适当的压力能使人保持积极的状态，然而压力过大则会影响身心健康。", "Apa gagasan utama kalimat ini?", ["Tekanan selalu buruk", "Tekanan yang tepat bermanfaat, berlebihan merugikan", "Hindari semua tekanan", "Tekanan tidak berpengaruh"], 1, "适当 = secukupnya; 然而…则… menyajikan kontras: terlalu besar akan merugikan."),
      read("5r2", "他做事向来一丝不苟，领导对他非常放心。", "Apa makna 一丝不苟?", ["Ceroboh", "Sangat teliti dan cermat", "Lambat", "Malas"], 1, "成语 一丝不苟 = tidak melewatkan sehelai benang pun → sangat teliti."),
    ],
    writing: [
      order("5w1", "Asalkan kamu berusaha, pasti akan berhasil.", ["只要", "你", "努力", "就", "一定会成功"], "只要你努力就一定会成功", "只要…就… = asalkan… maka…."),
      read("5w2", "这个问题我们必须认真___。", "Pilih kata yang tepat.", ["对待", "对付", "对比", "对话"], 0, "认真对待 = menangani dengan serius. 对付 bernuansa ‘menghadapi lawan’."),
    ],
  },
  6: {
    listening: [
      listen("6l1", "这部小说情节跌宕起伏，引人入胜，一经出版便成为畅销书。", "Apa yang dikatakan tentang novel itu?", ["Membosankan", "Alurnya menarik dan menjadi best-seller", "Belum terbit", "Ditulis untuk anak"], 1, "跌宕起伏 = penuh liku; 引人入胜 = memikat; 畅销书 = buku laris."),
      listen("6l2", "与其抱怨环境，不如改变自己。", "Apa makna kalimat ini?", ["Lebih baik mengubah diri daripada mengeluhkan lingkungan", "Lingkungan harus diubah", "Mengeluh itu wajar", "Diri sendiri tidak bisa diubah"], 0, "与其 A 不如 B = daripada A, lebih baik B."),
    ],
    reading: [
      read("6r1", "城市化进程的加快在带来经济繁荣的同时，也引发了交通拥堵、住房紧张等一系列问题。", "Menurut teks, urbanisasi…", ["Hanya membawa keuntungan", "Membawa kemakmuran tetapi juga masalah", "Sudah berhenti", "Tidak berdampak pada perumahan"], 1, "在…的同时，也… = sambil…, juga…. Ada sisi positif dan negatif."),
      read("6r2", "他的建议可谓一针见血，大家听了都深受启发。", "Apa arti 一针见血?", ["Menyakitkan", "Tepat sasaran / langsung ke inti", "Bertele-tele", "Menakutkan"], 1, "成语 一针见血 = satu tusukan langsung berdarah → kritik yang tepat sasaran."),
    ],
    writing: [
      read("6w1", "面对困难，我们要___，不能轻易放弃。", "Pilih 成语 yang tepat.", ["坚持不懈", "半途而废", "无所事事", "得过且过"], 0, "坚持不懈 = gigih tanpa henti. 半途而废 justru berarti menyerah di tengah jalan."),
      order("6w2", "Teknologi ini tidak hanya meningkatkan efisiensi tetapi juga menurunkan biaya.", ["不仅", "而且", "这项技术", "提高了效率", "降低了成本"], "这项技术不仅提高了效率而且降低了成本", "不仅…而且… menghubungkan dua predikat untuk subjek yang sama."),
    ],
  },
};

const SECTIONS: SectionType[] = ["listening", "reading", "writing"];

export const sampleExams: HskExam[] = Object.entries(bank).flatMap(([level, sections]) =>
  SECTIONS.map((section_type, i) => ({
    id: `00000000-0000-4000-8000-0000000003${level}${i}`,
    hsk_level: Number(level),
    section_type,
    questions_json: sections[section_type],
    created_at: "2026-01-01T00:00:00.000Z",
  })),
);
