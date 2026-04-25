import { findCountry } from "./countries";

// Returns a real flag emoji.
// `value` may already be an emoji (admin-selected) OR an ISO 3166-1 alpha-2 code.
export const flagEmoji = (value?: string | null): string => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  // If it's already an emoji-like value (non-ASCII), trust it
  if (/[^\x00-\x7F]/.test(trimmed)) return trimmed;
  const match = findCountry(trimmed);
  return match?.flag ?? "";
};
