import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Newspaper, ShieldCheck, Sparkles } from "lucide-react";

interface Update {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

const categoryStyles: Record<string, { dot: string; chip: string; label: string; ring: string }> = {
  system: {
    dot: "bg-primary",
    chip: "border-primary/40 bg-primary/10 text-primary",
    ring: "from-primary/40 via-primary/10 to-transparent",
    label: "System",
  },
  release: {
    dot: "bg-accent",
    chip: "border-accent/40 bg-accent/10 text-accent",
    ring: "from-accent/40 via-accent/10 to-transparent",
    label: "Release",
  },
  alert: {
    dot: "bg-destructive",
    chip: "border-destructive/40 bg-destructive/10 text-destructive",
    ring: "from-destructive/40 via-destructive/10 to-transparent",
    label: "Alert",
  },
  drop: {
    dot: "bg-warning",
    chip: "border-warning/50 bg-warning/10 text-warning",
    ring: "from-warning/40 via-warning/10 to-transparent",
    label: "Fresh Drop",
  },
};

const getCategoryStyle = (category: string) =>
  categoryStyles[category?.toLowerCase()] ?? {
    dot: "bg-foreground/60",
    chip: "border-border bg-muted text-foreground",
    ring: "from-primary/30 via-primary/10 to-transparent",
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

  return (
    <AppLayout>
      <section className="animate-fade-up space-y-8">
        {/* Premium section heading */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.32em] text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Live Newsroom · Verified Operator
            </div>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-foreground md:text-5xl">
              <span className="neon-text">News & Drops</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-foreground/70 md:text-base">
              Real-time announcements from the operations desk. Vendor-verified, instantly broadcast.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-foreground/80 shadow-sm">
            <Newspaper className="h-3.5 w-3.5 text-primary" />
            <span>{updates.length} live posts</span>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-5">
          {loading && !updates.length && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-card/60" />
              ))}
            </div>
          )}

          {updates.map((u, i) => {
            const style = getCategoryStyle(u.category);
            return (
              <article
                key={u.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)] transition-smooth hover:-translate-y-0.5 hover:border-primary/40 animate-fade-up"
              >
                {/* gradient ring on hover */}
                <div className={`pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r ${style.ring} opacity-0 transition-smooth group-hover:opacity-100`} />
                {/* left accent bar */}
                <div className={`absolute inset-y-0 left-0 w-1.5 ${style.dot}`} />
                {/* corner glow */}
                <div className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${style.ring} opacity-60 blur-3xl`} />

                <div className="relative p-5 pl-6 md:p-7 md:pl-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${style.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                    </span>
                    {i === 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-success/50 bg-success/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-success">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                        </span>
                        New
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-foreground/80">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                      <Sparkles className="h-3 w-3" /> Operations
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-xl font-black leading-snug text-foreground md:text-2xl">
                    {u.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/75 md:text-base">
                    {u.description}
                  </p>
                </div>
              </article>
            );
          })}

          {!loading && !updates.length && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center">
              <Newspaper className="mx-auto h-8 w-8 text-foreground/60" />
              <p className="mt-3 font-display text-lg font-bold text-foreground">No broadcasts yet</p>
              <p className="mt-1 text-sm text-foreground/70">Updates from the operations desk will appear here in real time.</p>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default Dashboard;
