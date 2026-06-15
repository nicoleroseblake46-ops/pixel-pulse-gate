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

type BaseItem = { id: string; name: string; created_at: string };

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
      const cats = ["cards", "rdp", "socks", "proxy", "logs", "tools", "sales"];
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
    const out: { label: string; items: BaseItem[] }[] = [];
    for (const b of bases) {
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
              className="glass flex flex-col items-center justify-center rounded-xl border border-border bg-card px-4 py-5 text-center shadow-[var(--shadow-elevated)] transition-smooth hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div className="font-display text-sm font-bold text-foreground">{s.label}</div>
              <div className="mt-1 font-mono text-xs text-primary">{resolveStatValue(s) || "—"}</div>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New Base Updates */}
        <section>
          <h2 className="mb-4 text-center font-display text-2xl font-black tracking-tight md:text-3xl">New Base Updates</h2>
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

        {/* Important */}
        <section>
          <h2 className="mb-4 text-center font-display text-2xl font-black tracking-tight md:text-3xl">Important</h2>
          <div className="space-y-4">
            {important.map((p, i) => {
              const accent = p.accent === "info"
                ? "border-success/40 text-foreground"
                : p.accent === "warning"
                  ? "border-warning/50 text-foreground"
                  : "border-destructive/40 text-destructive";
              return (
                <article key={i} className={`rounded-xl border bg-card px-5 py-4 shadow-[var(--shadow-elevated)] ${accent}`}>
                  {p.title && <h3 className="mb-2 font-display text-base font-bold">{p.title}</h3>}
                  <p className="whitespace-pre-line text-sm leading-relaxed">{p.body}</p>
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
      </div>
    </AppLayout>
  );
};

export default Dashboard;
