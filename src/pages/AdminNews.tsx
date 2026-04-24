import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Edit3, Newspaper, Plus, RefreshCw, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";

type NewsUpdate = {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
};

const emptyForm = { title: "", description: "", category: "system" };

const categoryColor: Record<string, string> = {
  system: "border-primary/40 bg-primary/10 text-primary",
  release: "border-accent/40 bg-accent/10 text-accent",
  alert: "border-destructive/40 bg-destructive/10 text-destructive",
  drop: "border-warning/40 bg-warning/10 text-warning",
};

const AdminNews = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("updates")
      .select("id,title,description,category,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setUpdates((data ?? []) as NewsUpdate[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadUpdates().catch((error) => {
      toast.error("Could not load news", { description: error instanceof Error ? error.message : "Please try again." });
      setLoading(false);
    });
  }, [isAdmin]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Add a title and description");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim() || "system",
    };
    const { error } = editingId
      ? await supabase.from("updates").update(payload).eq("id", editingId)
      : await supabase.from("updates").insert(payload);

    if (error) toast.error("News save failed", { description: error.message });
    else {
      toast.success(editingId ? "News updated" : "News published");
      resetForm();
      await loadUpdates();
    }
    setSaving(false);
  };

  const editUpdate = (update: NewsUpdate) => {
    setEditingId(update.id);
    setForm({ title: update.title, description: update.description, category: update.category });
  };

  const deleteUpdate = async (id: string) => {
    const { error } = await supabase.from("updates").delete().eq("id", id);
    if (error) toast.error("Could not delete news", { description: error.message });
    else {
      toast.success("News removed");
      await loadUpdates();
      if (editingId === id) resetForm();
    }
  };

  const quickCategories = ["system", "release", "alert", "drop"];

  if (adminLoading) return <Loader />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="animate-fade-up space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-primary p-6 text-primary-foreground shadow-[var(--shadow-elevated)] md:p-8">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/80">
                <Sparkles className="h-3.5 w-3.5" /> Admin · Newsroom
              </div>
              <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">News Control</h1>
              <p className="mt-2 max-w-xl text-primary-foreground/80">
                Publish announcements, drops and system notes that appear instantly on the user dashboard.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary-foreground/15 px-4 py-3 backdrop-blur">
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary-foreground/70">Posts</div>
                <div className="font-display text-2xl font-black">{updates.length}</div>
              </div>
              <Button variant="secondary" onClick={() => loadUpdates()} disabled={loading} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Composer */}
        <section className="glass rounded-2xl p-5 shadow-[var(--shadow-elevated)] md:p-6">
          <form onSubmit={saveUpdate} className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Newspaper className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black tracking-tight">{editingId ? "Edit news post" : "Compose new post"}</h2>
                  <p className="text-xs text-muted-foreground">Live to all users the moment you publish.</p>
                </div>
              </div>
              {editingId && (
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" /> Cancel
                </Button>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <Input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Headline"
                className="bg-secondary/50 text-base"
              />
              <Input
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                placeholder="Category"
                className="bg-secondary/50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {quickCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, category: c }))}
                  className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-smooth ${
                    form.category === c ? categoryColor[c] : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <Textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="What changed? Keep it short, sharp and useful."
              className="min-h-32 bg-secondary/50"
            />

            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] text-muted-foreground">{form.description.length} chars</div>
              <Button type="submit" disabled={saving} className="glow-primary">
                <Plus className="h-4 w-4" /> {saving ? "Publishing..." : editingId ? "Save changes" : "Publish to feed"}
              </Button>
            </div>
          </form>
        </section>

        {/* Feed */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-black">Published feed</h3>
            <span className="font-mono text-xs text-muted-foreground">{updates.length} TOTAL</span>
          </div>
          {loading ? (
            <Loader />
          ) : !updates.length ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 px-5 py-12 text-center text-muted-foreground">
              No news yet — publish your first post above.
            </div>
          ) : (
            <div className="grid gap-3">
              {updates.map((update) => (
                <article
                  key={update.id}
                  className="group grid gap-4 rounded-2xl border border-border bg-card/70 p-5 transition-smooth hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${categoryColor[update.category] ?? "border-border bg-muted text-muted-foreground"}`}>
                        {update.category}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {new Date(update.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-bold text-foreground">{update.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{update.description}</p>
                  </div>
                  <div className="flex gap-2 md:justify-end">
                    <Button type="button" variant="secondary" size="sm" onClick={() => editUpdate(update)}>
                      <Edit3 className="h-4 w-4" /> Edit
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => deleteUpdate(update.id)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default AdminNews;
