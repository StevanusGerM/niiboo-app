export interface Expert {
  name: string;
  title: string;
  specialties: string[];
  /** Optional — only show real numbers. */
  rating?: number;
  sessions?: number;
  tokenCost: number;
  /** Session length in minutes. */
  duration: number;
  languages: string[];
  /** Hours (WIB, 24h) the expert is bookable each weekday. */
  hours: number[];
  color: string;
}

export const experts: Expert[] = [
  {
    name: "Laoshi Brigita Chuanes",
    title: "Pengajar Mandarin",
    specialties: ["HSK 1–6", "Percakapan & pelafalan"],
    tokenCost: 4,
    duration: 50,
    languages: ["Mandarin", "Bahasa Indonesia", "English"],
    hours: [9, 10, 13, 15, 16, 19, 20],
    color: "from-blossom to-peach",
  },
];
