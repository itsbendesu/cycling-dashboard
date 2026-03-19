// Convert 2-letter country code to flag emoji
export function countryFlag(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
