export function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 2) return 1;

  // Remove trailing silent e
  word = word.replace(/e$/, '');
  
  // Count vowel groups
  const matches = word.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  
  // Ensure at least 1 syllable
  return Math.max(1, count);
}
