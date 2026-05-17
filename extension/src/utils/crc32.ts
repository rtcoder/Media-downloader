/**
 * Tablica CRC32
 */
const crcTable = (() => {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

/**
 * Funkcja CRC32.
 * @param {string} str - Ciąg znaków do zhashowania.
 * @returns {number} - Liczbowy hash CRC32.
 */
function crc32(str: string): number {
  let crc = 0 ^ (-1);
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

/**
 * Konwertuje hash CRC32 na format heksadecymalny.
 * @param {string} str - Ciąg znaków do zhashowania.
 * @returns {string} - Krótki hash w formacie heksadecymalnym.
 */
export function getCrc32Hash(str: string): string {
  const hash = crc32(str);
  return hash.toString(16).padStart(8, '0'); // Upewnienie się, że ma 8 znaków
}

