/** English auxiliary + past participle (ed/en). */
export function detectEnglishPassive(sentence: string): boolean {
  const pattern = /\b(is|are|was|were|been|being|be)\s+(\w+ed|(\w+en))\b/i;
  return pattern.test(sentence);
}
