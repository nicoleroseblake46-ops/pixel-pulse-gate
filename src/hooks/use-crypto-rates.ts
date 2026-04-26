import { useEffect, useState } from "react";

// USD price per 1 unit of coin
export type Rates = { BTC: number; LTC: number; "USDT/TRC20": number };

const FALLBACK: Rates = { BTC: 65000, LTC: 75, "USDT/TRC20": 1 };
const STORAGE_KEY = "nexus-crypto-rates";
const TTL_MS = 2 * 60 * 1000;

export const useCryptoRates = () => {
  const [rates, setRates] = useState<Rates>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (cached?.rates && Date.now() - cached.ts < TTL_MS) return cached.rates as Rates;
    } catch { /* noop */ }
    return FALLBACK;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,litecoin,tether&vs_currencies=usd"
        );
        const json = await res.json();
        const next: Rates = {
          BTC: Number(json?.bitcoin?.usd) || FALLBACK.BTC,
          LTC: Number(json?.litecoin?.usd) || FALLBACK.LTC,
          "USDT/TRC20": Number(json?.tether?.usd) || FALLBACK["USDT/TRC20"],
        };
        if (!mounted) return;
        setRates(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ rates: next, ts: Date.now() }));
      } catch {
        setRates(FALLBACK);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, TTL_MS);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return { rates, loading };
};

export const formatCrypto = (amount: number, coin: keyof Rates) => {
  if (!isFinite(amount) || amount <= 0) return "0";
  const decimals = coin === "USDT/TRC20" ? 2 : coin === "LTC" ? 6 : 8;
  return amount.toFixed(decimals).replace(/\.?0+$/, "");
};
