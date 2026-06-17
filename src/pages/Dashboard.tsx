import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, MonitorSmartphone, Zap, ScrollText, History, Database, Server, Network, Shield, Plus, Globe, Wrench } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAppSettings } from "@/hooks/use-app-settings";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, MonitorSmartphone, Zap, ScrollText, History, Database, Server, Network, Shield, Globe, Wrench,
};

const DEFAULT_STATS = [
  { label: "Total CVVs", value: "0", icon: "CreditCard" },
  { label: "Total RDPs", value: "0", icon: "MonitorSmartphone" },
  { label: "Total SOCKS", value: "0", icon: "Zap" },
  { label: "Total LOGS", value: "0", icon: "ScrollText" },
  { label: "CVV Update Time", value: "Soon", icon: "History" },
];

const DEFAULT_IMPORTANT = [
  {
    accent: "danger",
    body:
      "Always save our main url, if our shop ever goes down you'll get the extra domains that are active.",
  },
  {
    accent: "danger",
    body: "Payments possible in < BTC, LTC, DOGE, USDT TRC20 + ERC20, ETH, XMR >",
  },
  {
    accent: "danger",
    body: "Only form of contact is ticket support. Check the Telegram channel for updates and important news.",
  },
  {
    accent: "info",
    body:
      "Refund method for HQ cards: After clicking the 'View' button on the HQ orders page, you have 45 seconds to use the 'Check' button. If the card is dead, an automatic refund will be processed.",
  },
];

type Stat = { label: string; value: string; icon: string };
type Panel = { accent?: string; title?: string; body: string };

type BaseItem = { id: string; name: string; created_at: string; category: string };

const bucketLabel = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 3600 * 24) return `${Math.floor(diff / 3600)} hours ago`;
  const d = Math.floor(diff / 86400);
  return d === 1 ? "1 day ago" : `${d} days ago`;
};

const Dashboard = () => {
  const { settings } = useAppSettings();
  const stats = (Array.isArray(settings.dashboard_stats) ? settings.dashboard_stats : DEFAULT_STATS) as Stat[];
  const important = (Array.isArray(settings.dashboard_important) ? settings.dashboard_important : DEFAULT_IMPORTANT) as Panel[];

  const [bases, setBases] = useState<BaseItem[]>([]);
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(true);
  const [autoCounts, setAutoCounts] = useState<Record<string, number>>({});

  const load = async (n: number) => {
    const { data } = await supabase
      .from("products")
      .select("id,name,created_at")
      .eq("category", "cards")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(n);
    setBases((data ?? []) as BaseItem[]);
    setLoading(false);
  };

  useEffect(() => {
    load(limit);
    const ch = supabase
      .channel(`dash-bases-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => load(limit))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [limit]);

  // Auto live counts so stats with value "auto" pull from DB
  useEffect(() => {
    const run = async () => {
      const cats = ["cards", "rdp", "socks", "proxy", "logs", "tools", "sales"] as const;
      const entries = await Promise.all(
        cats.map(async (c) => {
          const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category", c).eq("is_active", true);
          return [c, count ?? 0] as const;
        }),
      );
      setAutoCounts(Object.fromEntries(entries));
    };
    run();
  }, []);

  const grouped = useMemo(() => {
    // Dedupe by base name — newest occurrence wins (bases already sorted desc by created_at)
    const seen = new Set<string>();
    const uniq: BaseItem[] = [];
    for (const b of bases) {
      const key = (b.name ?? "").trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      uniq.push(b);
    }
    const out: { label: string; items: BaseItem[] }[] = [];
    for (const b of uniq) {
      const lbl = bucketLabel(b.created_at);
      const last = out[out.length - 1];
      if (last && last.label === lbl) last.items.push(b);
      else out.push({ label: lbl, items: [b] });
    }
    return out;
  }, [bases]);


  const resolveStatValue = (s: Stat) => {
    const v = String(s.value ?? "").trim().toLowerCase();
    const map: Record<string, string> = {
      "auto:cards": "cards", "auto:cvvs": "cards", "auto:cvv": "cards",
      "auto:rdp": "rdp", "auto:socks": "socks", "auto:proxy": "proxy",
      "auto:logs": "logs", "auto:tools": "tools", "auto:sales": "sales",
    };
    if (map[v]) return autoCounts[map[v]]?.toLocaleString() ?? "0";
    return s.value;
  };

  return (
    <AppLayout>


      {/* Stats */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 animate-fade-up">
        {stats.map((s, i) => {
          const Icon = ICONS[s.icon] ?? CreditCard;
          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-muted-foreground">{s.label}</div>
                  <div className="mt-0.5 font-display text-xl font-black text-foreground">{resolveStatValue(s) || "—"}</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Important (first on mobile so it isn't pushed below bases) */}
        <section className="order-1 lg:order-2">
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight md:text-2xl">Important</h2>
          <div className="space-y-3">
            {important.map((p, i) => {
              const accent = p.accent === "info"
                ? "border-emerald-500/40"
                : p.accent === "warning"
                  ? "border-amber-500/50"
                  : "border-destructive/40";
              return (
                <article key={i} className={`rounded-xl border bg-card px-5 py-4 shadow-sm ${accent}`}>
                  {p.title && <h3 className="mb-1 font-display text-base font-bold">{p.title}</h3>}
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{p.body}</p>
                </article>
              );
            })}
            {!important.length && (
              <div className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-muted-foreground">
                No notices configured.
              </div>
            )}
          </div>
        </section>

        {/* New Base Updates */}
        <section className="order-2 lg:order-1">
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight md:text-2xl">New Base Updates</h2>
          <div className="space-y-4">
            {loading && !bases.length && (
              <div className="space-y-2">
                {[0,1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg border border-border bg-card/60" />)}
              </div>
            )}

            {grouped.map((g, gi) => (
              <div key={`${g.label}-${gi}`}>
                <div className="mb-2 font-mono text-xs text-muted-foreground">{g.label}</div>
                <div className="space-y-2">
                  {g.items.map((b) => (
                    <Link
                      key={b.id}
                      to={`/cards?base=${encodeURIComponent(b.name)}`}
                      className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-sm transition-smooth hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[var(--shadow-elevated)]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate font-mono text-xs uppercase tracking-wider text-foreground">{b.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {!loading && !bases.length && (
              <div className="rounded-xl border border-dashed border-border bg-card px-5 py-10 text-center text-muted-foreground">
                No bases published yet.
              </div>
            )}

            {bases.length >= limit && (
              <div className="flex justify-center pt-2">
                <Button variant="secondary" onClick={() => setLimit((n) => n + 30)}>Load more</Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
