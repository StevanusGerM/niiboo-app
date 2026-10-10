/** Pinyin helpers: tone-number → diacritics, tone stripping, tone extraction. */

const TONE_MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

const MARKED: Record<string, [string, number]> = {};
for (const [base, marks] of Object.entries(TONE_MARKS)) {
  marks.forEach((m, i) => (MARKED[m] = [base, i + 1]));
}

/** "ni3 hao3" → "nǐ hǎo" */
export function numberedToMarked(input: string) {
  return input.replace(/([a-zA-ZüÜv:]+)([1-5])/g, (_, syl: string, toneStr: string) => {
    const tone = Number(toneStr);
    const s = syl.replace(/v|u:/g, "ü");
    if (tone === 5) return s;
    const lower = s.toLowerCase();
    let idx = lower.search(/[ae]/);
    if (idx === -1) idx = lower.indexOf("ou");
    if (idx === -1) {
      for (let i = lower.length - 1; i >= 0; i--) {
        if ("aeiouü".includes(lower[i])) {
          idx = i;
          break;
        }
      }
    }
    if (idx === -1) return s;
    const mark = TONE_MARKS[lower[idx]]?.[tone - 1];
    if (!mark) return s;
    const cased = s[idx] === s[idx].toUpperCase() ? mark.toUpperCase() : mark;
    return s.slice(0, idx) + cased + s.slice(idx + 1);
  });
}

/** "nǐ hǎo" → "ni hao" */
export function stripTones(input: string) {
  return input
    .split("")
    .map((c) => MARKED[c.toLowerCase()]?.[0] ?? c)
    .join("")
    .toLowerCase();
}

export function hasToneMarks(input: string) {
  return input.split("").some((c) => MARKED[c.toLowerCase()]);
}
