import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Newspaper } from "lucide-react";

interface Update { id: string; title: string; description: string; category: string; created_at: string; }

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

const Dashboard = () => {
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    supabase.from("updates").select("id,title,description,category,created_at").order("created_at", { ascending: false }).limit(24)
      .then(({ data }) => data && setUpdates(data as Update[]));
  }, []);

  return (
    <AppLayout>
      <section className="animate-fade-up">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-3xl font-black tracking-wide text-foreground">News</h1>
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
            <Newspaper className="h-4 w-4" />
            <span>Latest updates</span>
          </div>
        </div>

        <div className="space-y-4">
          {updates.map((u, i) => {
            return (
              <article
                key={u.id}
                className="group grid min-h-28 gap-4 rounded-lg border border-border bg-card/60 px-5 py-6 transition-smooth hover:border-primary/40 hover:bg-card/80 animate-fade-up md:grid-cols-[minmax(0,1fr)_190px] md:items-start md:px-7"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold leading-snug text-foreground md:text-2xl">{u.title}</h2>
                  <p className="mt-3 text-base font-semibold leading-relaxed text-muted-foreground md:text-lg">{u.description}</p>
                </div>
                <time className="font-mono text-sm font-bold text-muted-foreground md:pt-1 md:text-right md:text-base" dateTime={u.created_at}>
                  {formatNewsDate(u.created_at)}
                </time>
              </article>
            );
          })}
          {!updates.length && (
            <div className="rounded-lg border border-border bg-card/60 px-5 py-10 text-center text-muted-foreground">
              No news has been posted yet.
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default Dashboard;
