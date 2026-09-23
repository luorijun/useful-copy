const RADIX = 36,
  HALF = RADIX ** 3,
  SPACE = RADIX ** 6;
function roundValue(value: number, round: number) {
  let x = (value + Math.imul(round + 1, 0x9e3779b1)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) % HALF;
}
/** A six-round Feistel permutation over the complete six-character base-36 space. */
export function accessCodeFromSequence(sequence: number) {
  if (!Number.isSafeInteger(sequence) || sequence < 0 || sequence >= SPACE)
    throw new Error("访问码空间已耗尽");
  let left = Math.floor(sequence / HALF),
    right = sequence % HALF;
  for (let round = 0; round < 6; round++) {
    [left, right] = [right, (left + roundValue(right, round)) % HALF];
  }
  const code = (left * HALF + right).toString(RADIX).padStart(6, "0");
  if (!/^[a-z0-9]{6}$/.test(code)) throw new Error("访问码生成失败");
  return code;
}
export function normalizeAccessCode(code: string) {
  return code.trim().toLowerCase();
}
export function safeName(name: string) {
  return name.replace(/[\r\n"\\]/g, "_").slice(0, 180) || "download";
}
