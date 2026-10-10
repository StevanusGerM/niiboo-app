/** Shapes of the JSONB columns (content_json, content_pairs, questions_json). */

export interface VocabItem {
  hanzi: string;
  pinyin: string;
  meaning: string; // Bahasa Indonesia
  example?: { zh: string; pinyin: string; id: string };
}

export interface LessonContent {
  intro: string;
  vocab: VocabItem[];
  dialogue?: { speaker: string; zh: string; pinyin: string; id: string }[];
  grammar_tip?: string;
}

/** A word inside a sentence — powers the instant glossary lookup. */
export interface GlossToken {
  w: string; // hanzi as it appears
  py?: string; // pinyin (omit for punctuation)
  id?: string; // Indonesian gloss (omit for punctuation)
}

/** One aligned Mandarin–Indonesian sentence pair. */
export interface StoryPair {
  zh: string;
  pinyin: string;
  id: string;
  tokens: GlossToken[];
  /** Optional timestamps (seconds) into audio_url for karaoke sync. */
  start?: number;
  end?: number;
}

export type ExamQuestion =
  | {
      kind: "mcq";
      id: string;
      prompt: string;
      /** Mandarin passage / sentence displayed with the question. */
      passage_zh?: string;
      /** Listening only: text spoken via TTS when no audio file is present. */
      audio_text?: string;
      options: string[];
      answer: number;
      explanation: string;
    }
  | {
      kind: "order";
      id: string;
      prompt: string;
      /** Shuffled fragments the learner taps to build the sentence. */
      fragments: string[];
      answer: string;
      explanation: string;
    };
