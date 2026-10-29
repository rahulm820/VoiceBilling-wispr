/**
 * A clean sentence from raw speech-to-text: no colons, commas, bullets, quotes, brackets,
 * stray full stops or filler sounds. Decimal points survive ("1.5 kg").
 */
export const cleanTranscript = (s: string): string =>
  s
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\p{Extended_Pictographic}/gu, ' ')
    .replace(/(^|\s)[-–—•*·]+(?=\s|$)/g, ' ')
    .replace(/[:;,|"“”‘’`~^()[\]{}<>_=\\]/g, ' ')
    .replace(/(?<!\d)\.|\.(?!\d)/g, ' ')
    .replace(/[?!।]+/g, ' ')
    .replace(/(?<![\p{L}\p{M}])(?:um+|uh+|hmm+|erm)(?![\p{L}\p{M}])/giu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
