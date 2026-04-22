import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Edit3, Plus, RefreshCw, Trash2, X } from "lucide-react";
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

const AdminNews = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUpdates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("updates").select("id,title,description,category,created_at").order("created_at", { ascending: false });
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

    if (error) {
      toast.error("News save failed", { description: error.message });
    } else {
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
    if (error) {
      toast.error("Could not delete news", { description: error.message });
    } else {
      toast.success("News removed");
      await loadUpdates();
      if (editingId === id) resetForm();
    }
  };

  if (adminLoading) return <Loader />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="animate-fade-up space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Admin Console</div>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight neon-text md:text-5xl">News Control</h1>
            <p className="mt-2 text-muted-foreground">Create, edit, or remove the updates shown on the News page.</p>
          </div>
          <Button variant="secondary" onClick={() => loadUpdates()} disabled={loading}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <section className="glass rounded-xl p-4 md:p-5">
          <form onSubmit={saveUpdate} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-black tracking-tight">{editingId ? "Edit news" : "Publish news"}</h2>
              {editingId && <Button type="button" variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /> Cancel</Button>}
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="News title" className="bg-secondary/50" />
              <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="bg-secondary/50" />
            </div>
            <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="News description" className="min-h-32 bg-secondary/50" />
            <Button type="submit" disabled={saving}>
              <Plus className="h-4 w-4" /> {saving ? "Saving..." : editingId ? "Save Changes" : "Publish to News"}
            </Button>
          </form>
        </section>

        <section className="space-y-3">
          {loading ? <Loader /> : updates.map((update) => (
            <article key={update.id} className="grid gap-4 rounded-lg border border-border bg-card/60 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">{update.category}</div>
                <h3 className="mt-1 font-display text-xl font-bold text-foreground">{update.title}</h3>
                <p className="mt-2 text-muted-foreground">{update.description}</p>
              </div>
              <div className="flex gap-2 md:justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={() => editUpdate(update)}><Edit3 className="h-4 w-4" /> Edit</Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => deleteUpdate(update.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
              </div>
            </article>
          ))}
          {!loading && !updates.length && <div className="rounded-lg border border-border bg-card/60 px-5 py-10 text-center text-muted-foreground">No news has been posted yet.</div>}
        </section>
      </div>
    </AppLayout>
  );
};

export default AdminNews;