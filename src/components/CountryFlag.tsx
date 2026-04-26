import { flagCode } from "@/lib/flag";
import { findCountry } from "@/lib/countries";

interface Props {
  /** Country name, ISO alpha-2 code, or flag emoji. */
  value?: string | null;
  /** Pixel width of the flag image (height auto). */
  width?: number;
  className?: string;
}

/**
 * Renders a real country flag as an image (PNG via flagcdn.com).
 * Falls back to a neutral placeholder dash if the country can't be resolved.
 */
export const CountryFlag = ({ value, width = 20, className = "" }: Props) => {
  const code = flagCode(value);
  const country = findCountry(value ?? "");
  if (!code) return <span className={`text-muted-foreground ${className}`}>—</span>;
  // Pick the smallest CDN size >= requested width for crisp rendering.
  const sizes = [20, 40, 80, 160] as const;
  const target = sizes.find((s) => s >= width) ?? 40;
  return (
    <img
      src={`https://flagcdn.com/w${target}/${code}.png`}
      srcSet={`https://flagcdn.com/w${target}/${code}.png 1x, https://flagcdn.com/w${target * 2 > 160 ? 160 : target * 2}/${code}.png 2x`}
      width={width}
      height={Math.round(width * 0.66)}
      alt={country?.name ?? code.toUpperCase()}
      loading="lazy"
      className={`inline-block rounded-[2px] object-cover shadow-[0_0_0_1px_hsl(var(--border))] ${className}`}
    />
  );
};
