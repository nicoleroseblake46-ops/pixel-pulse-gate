import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Activity, Newspaper, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";

interface Update {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

const formatNewsDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value));

const categoryStyles: Record<string, { dot: string; chip: string; label: string }> = {
  system: {
    dot: "bg-primary",
    chip: "border-primary/30 bg-primary/10 text-primary",
    label: "System",
  },
  release: {
    dot: "bg-accent",
    chip: "border-accent/30 bg-accent/10 text-accent",
    label: "Release",
  },
  alert: {
    dot: "bg-destructive",
    chip: "border-destructive/30 bg-destructive/10 text-destructive",
    label: "Alert",
  },
  drop: {
    dot: "bg-warning",
    chip: "border-warning/40 bg-warning/10 text-warning",
    label: "Fresh Drop",
  },
};

const getCategoryStyle = (category: string) =>
  categoryStyles[category?.toLowerCase()] ?? {
    dot: "bg-muted-foreground",
    chip: "border-border bg-muted text-muted-foreground",
    label: category || "Update",
  };

const Dashboard = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpdates = () => {
      supabase
        .from("updates")
        .select("id,title,description,category,created_at")
        .order("created_at", { ascending: false })
        .limit(24)
        .then(({ data }) => {
          if (data) setUpdates(data as Update[]);
          setLoading(false);
        });
    };

    loadUpdates();

    const channel = supabase
      .channel("news-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "updates" }, loadUpdates)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const latestUpdateAt = useMemo(() => {
    if (!updates.length) return null;
    return formatNewsDate(updates[0].created_at);
  }, [updates]);

  return (
    <AppLayout>
      <section className="animate-fade-up space-y-8">
        {/* Premium hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-primary p-6 text-primary-foreground shadow-[var(--shadow-elevated)] md:p-8">
          <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
          <div className="grid-bg absolute inset-0 opacity-20" />

          <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.32em] text-primary-foreground/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Live Newsroom · Verified Operator
              </div>
              <h1 className="mt-3 font-display text-4xl font-black tracking-tight md:text-5xl">News & Drops</h1>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80 md:text-base">
                Real-time announcements from the operations desk. Vendor-verified, instantly broadcast to every member.
              </p>
            </div>

            <div className="flex flex-wrap items-stretch gap-3">
              <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/70">
                  <Activity className="h-3 w-3" /> Posts
                </div>
                <div className="font-display text-2xl font-black">{updates.length}</div>
              </div>
              <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/70">
                  <ShieldCheck className="h-3 w-3" /> Uptime
                </div>
                <div className="font-display text-2xl font-black">99.98%</div>
              </div>
            </div>
          </div>

          {/* trust strip */}
          <div className="relative mt-6 grid gap-3 border-t border-primary-foreground/15 pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary-foreground/70">Active members</div>
                <div className="font-display text-lg font-bold">12,480+</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary-foreground/70">Avg. delivery</div>
                <div className="font-display text-lg font-bold">&lt; 30 sec</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary-foreground/70">Last update</div>
                <div className="font-display text-sm font-bold">{latestUpdateAt ?? "Awaiting first post"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Operator broadcasts</div>
            <h2 className="mt-1 font-display text-2xl font-black tracking-wide text-foreground md:text-3xl">News Feed</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 font-mono text-xs text-muted-foreground">
            <Newspaper className="h-3.5 w-3.5 text-primary" />
            <span>{updates.length} live posts</span>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {loading && !updates.length && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-card/50" />
              ))}
            </div>
          )}

          {updates.map((u, i) => {
            const style = getCategoryStyle(u.category);
            return (
              <article
                key={u.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 shadow-[0_1px_0_hsl(var(--border))] transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] animate-fade-up"
              >
                {/* left accent bar */}
                <div className={`absolute inset-y-0 left-0 w-1 ${style.dot}`} />

                <div className="grid gap-4 p-5 pl-6 md:grid-cols-[minmax(0,1fr)_180px] md:items-start md:p-6 md:pl-7">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${style.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                      {i === 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-success">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                          </span>
                          New
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-black leading-snug text-foreground md:text-2xl">
                      {u.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
                      {u.description}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-3 md:flex-col md:items-end md:gap-1 md:pt-1">
                    <time
                      dateTime={u.created_at}
                      className="font-mono text-xs font-bold text-foreground md:text-right md:text-sm"
                    >
                      {formatNewsDate(u.created_at)}
                    </time>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Operations Desk
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && !updates.length && (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 px-5 py-14 text-center">
              <Newspaper className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-display text-lg font-bold text-foreground">No broadcasts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Updates from the operations desk will appear here in real time.</p>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default Dashboard;
