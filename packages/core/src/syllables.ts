export type SyllableLanguage = 'en' | 'es';

/** English syllable estimate (vowel groups; trailing silent e). */
export function countEnglishSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 2) return 1;

  // Remove trailing silent e
  word = word.replace(/e$/, '');

  const matches = word.match(/[aeiouy]+/g);
  const count = matches ? matches.length : 1;
  return Math.max(1, count);
}

/**
 * Spanish syllable estimate via vowel groups with diphthong / hiatus rules.
 * Strong vowels: a, e, o (and accented). Weak: i, u, ü (í/ú break diphthongs).
 */
export function countSpanishSyllables(word: string): number {
  const w = word
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^a-záéíóúüñ]/g, '');
  if (!w) return 0;
  if (w.length <= 2) return 1;

  const isVowel = (c: string) => 'aeiouáéíóúü'.includes(c);
  const isStrong = (c: string) => 'aeoáéó'.includes(c);
  const isWeak = (c: string) => 'iuü'.includes(c);
  const isAccentedWeak = (c: string) => 'íú'.includes(c);

  let count = 0;
  let i = 0;
  while (i < w.length) {
    if (!isVowel(w[i])) {
      i++;
      continue;
    }
    count++;
    let j = i + 1;
    while (j < w.length && isVowel(w[j])) {
      const a = w[j - 1];
      const b = w[j];
      // Hiatus: two strong, or accented weak breaking a diphthong
      if (
        (isStrong(a) && isStrong(b)) ||
        isAccentedWeak(a) ||
        isAccentedWeak(b)
      ) {
        break;
      }
      // Diphthong: strong+weak, weak+strong, or two weaks
      if (
        (isStrong(a) && isWeak(b)) ||
        (isWeak(a) && isStrong(b)) ||
        (isWeak(a) && isWeak(b))
      ) {
        j++;
        continue;
      }
      break;
    }
    i = j;
  }

  return Math.max(1, count);
}

export function countSyllables(word: string, lang: SyllableLanguage = 'en'): number {
  return lang === 'es' ? countSpanishSyllables(word) : countEnglishSyllables(word);
}

/** Complex-word threshold: >=4 syllables for both en and es. */
export function isComplexWord(word: string, lang: SyllableLanguage = 'en'): boolean {
  return countSyllables(word, lang) >= 4;
}
