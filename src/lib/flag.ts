import { findCountry } from "./countries";

// Resolve a country to its ISO alpha-2 code (lowercase) for flag image lookups.
// Accepts: ISO code ("US"), flag emoji ("🇺🇸"), or country name ("United States").
export const flagCode = (value?: string | null): string => {
  if (!value) return "";
  const match = findCountry(value.trim());
  return match ? match.code.toLowerCase() : "";
};

// Returns a real flag image URL (PNG via flagcdn.com).
// Returns empty string if the country can't be resolved.
export const flagImage = (value?: string | null, size: 20 | 40 | 80 | 160 = 40): string => {
  const code = flagCode(value);
  if (!code) return "";
  return `https://flagcdn.com/w${size}/${code}.png`;
};

// Legacy: returns the unicode emoji (kept for any older callers).
export const flagEmoji = (value?: string | null): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/[^\x00-\x7F]/.test(trimmed)) return trimmed;
  const match = findCountry(trimmed);
  return match?.flag ?? "";
};
