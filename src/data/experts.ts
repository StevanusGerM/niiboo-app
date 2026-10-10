export interface Expert {
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  sessions: number;
  tokenCost: number;
  languages: string[];
  /** Hours (WIB, 24h) the expert is bookable each weekday. */
  hours: number[];
  color: string;
}

export const experts: Expert[] = [
  {
    name: "Laoshi Lin Mei",
    title: "Pengajar bersertifikat HSK & HSKK",
    specialties: ["Persiapan HSK 4–6", "Pelafalan & nada"],
    rating: 4.9,
    sessions: 1240,
    tokenCost: 2,
    languages: ["Mandarin", "English"],
    hours: [9, 10, 13, 15, 19],
    color: "from-blossom to-peach",
  },
  {
    name: "Laoshi Wang Hao",
    title: "Mandarin Bisnis",
    specialties: ["Presentasi & negosiasi", "Email bisnis"],
    rating: 4.8,
    sessions: 860,
    tokenCost: 3,
    languages: ["Mandarin", "English"],
    hours: [8, 12, 18, 20],
    color: "from-plum to-blossom",
  },
  {
    name: "Laoshi Siti Chen",
    title: "Tutor pemula — penutur Bahasa Indonesia",
    specialties: ["HSK 1–3", "Percakapan sehari-hari"],
    rating: 4.9,
    sessions: 2015,
    tokenCost: 1,
    languages: ["Mandarin", "Bahasa Indonesia"],
    hours: [10, 14, 16, 19, 20],
    color: "from-peach to-rose",
  },
  {
    name: "Laoshi Zhao Yun",
    title: "Penulisan Hanzi & sastra",
    specialties: ["Kaligrafi & urutan goresan", "Membaca teks klasik"],
    rating: 4.7,
    sessions: 540,
    tokenCost: 2,
    languages: ["Mandarin"],
    hours: [9, 11, 15],
    color: "from-rose to-blossom",
  },
];
