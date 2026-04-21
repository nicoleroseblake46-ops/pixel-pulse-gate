import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Activity, TrendingUp, Users, Zap, Tag, CreditCard, Network, Wrench, Bell, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Update { id: string; title: string; description: string; category: string; created_at: string; }

const categoryStyle: Record<string, { color: string; icon: any }> = {
  socks: { color: "text-accent", icon: Zap },
  cards: { color: "text-primary", icon: CreditCard },
  sales: { color: "text-success", icon: Tag },
  tools: { color: "text-warning", icon: Wrench },
  proxy: { color: "text-accent", icon: Network },
  system: { color: "text-muted-foreground", icon: Bell },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    supabase.from("updates").select("*").order("created_at", { ascending: false }).limit(8)
      .then(({ data }) => data && setUpdates(data as Update[]));
    if (user) supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
      .then(({ data }) => setUsername((data?.username as string) || user.email?.split("@")[0] || "agent"));
  }, [user]);

  const stats = [
    { label: "Active Sessions", value: "2,847", change: "+12%", icon: Activity, color: "text-accent" },
    { label: "Online Users", value: "12.4K", change: "+8%", icon: Users, color: "text-primary" },
    { label: "Live Sales", value: "$48.2K", change: "+24%", icon: TrendingUp, color: "text-success" },
    { label: "Uptime", value: "99.98%", change: "stable", icon: Zap, color: "text-warning" },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
          <span>Connected · Mainnet</span>
        </div>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">
          Welcome back, <span className="neon-text">{username}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Here's what's happening across the network right now.</p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="glass group relative overflow-hidden rounded-xl p-5 transition-smooth hover:-translate-y-1 hover:shadow-[var(--glow-soft)] animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-smooth group-hover:opacity-30" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${s.color}`} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.change}</span>
                </div>
                <div className="mt-3 font-display text-3xl font-bold">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Updates feed */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-wider">LATEST UPDATES</h2>
            <p className="text-sm text-muted-foreground">Real-time feed from across NEXUS</p>
          </div>
          <span className="hidden font-mono text-xs uppercase tracking-widest text-muted-foreground sm:inline">
            Live · auto-refresh
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {updates.map((u, i) => {
            const cat = categoryStyle[u.category] || categoryStyle.system;
            const Icon = cat.icon;
            return (
              <article
                key={u.id}
                className="glass group relative overflow-hidden rounded-xl p-5 transition-smooth hover:-translate-y-1 hover:border-primary/40 animate-fade-up cursor-pointer"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="absolute right-0 top-0 h-px w-0 bg-gradient-primary transition-all duration-500 group-hover:w-full" />
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/50 ${cat.color} group-hover:scale-110 transition-smooth`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] uppercase tracking-widest ${cat.color}`}>{u.category}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-bold leading-tight group-hover:text-glow transition-smooth">
                      {u.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{u.description}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-smooth group-hover:opacity-100 group-hover:text-primary" />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Center hero panel */}
      <section className="glass-strong relative overflow-hidden rounded-2xl p-8 md:p-12 animate-fade-up">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/30 blur-[120px]" />
        <div className="relative max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent text-glow-accent">
            ⟶ MISSION CONTROL
          </div>
          <h2 className="mt-3 font-display text-3xl font-black md:text-4xl">
            Power up with <span className="neon-text">premium access</span>
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Top up your wallet with crypto and unlock the full NEXUS arsenal — fresh socks, premium proxies, exclusive tools and more.
          </p>
          <a
            href="/payments"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-background glow-primary transition-smooth hover:scale-105"
          >
            Top Up Wallet <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </AppLayout>
  );
};

export default Dashboard;
