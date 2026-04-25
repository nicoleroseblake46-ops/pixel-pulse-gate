// Convert ISO 3166-1 alpha-2 country code (e.g. "NL") to its emoji flag.
export const flagEmoji = (code?: string | null) => {
  if (!code) return "🏳️";
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return "🏳️";
  return String.fromCodePoint(...cc.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
};
