import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Edit3, Plus, Power, RefreshCw, Trash2, X, Package, Tag as TagIcon, CreditCard, Network, Wrench, MonitorSmartphone, Zap, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductCategory } from "@/hooks/use-products";
import { COUNTRIES, findCountry } from "@/lib/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CountryFlag } from "@/components/CountryFlag";

const categories: { value: ProductCategory; label: string; Icon: typeof TagIcon }[] = [
  { value: "sales", label: "Sales", Icon: TagIcon },
  { value: "cards", label: "Cards", Icon: CreditCard },
  { value: "socks", label: "Socks", Icon: Zap },
  { value: "proxy", label: "Proxy", Icon: Network },
  { value: "tools", label: "Tools", Icon: Wrench },
  { value: "rdp", label: "RDP", Icon: MonitorSmartphone },
  { value: "logs", label: "Logs", Icon: ScrollText },
];

const emptyForm = {
  name: "",
  meta: "",
  price: "",
  tag: "",
  sort_order: "0",
  bin: "",
  country: "",
  state: "",
  brand: "",
  card_type: "",
  bank: "",
  seller: "",
  exp: "",
  zip: "",
  valid: "",
  scheme: "",
  level: "",
  country_code: "",
  extras: "",
  image_url: "",
};

const AdminProducts = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [active, setActive] = useState<ProductCategory>("sales");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isCards = active === "cards";

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", active)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error("Could not load products", { description: error.message });
    setItems((data ?? []) as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
    setEditingId(null);
    setForm(emptyForm);
  }, [active, isAdmin]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid price");
      return;
    }
    setSaving(true);
    const payload = {
      category: active,
      name: form.name.trim(),
      meta: form.meta.trim(),
      price,
      tag: form.tag.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      bin: isCards ? form.bin.trim() || null : null,
      country: isCards ? form.country.trim() || null : null,
      state: isCards ? form.state.trim() || null : null,
      brand: isCards ? form.brand.trim() || null : null,
      card_type: isCards ? form.card_type.trim() || null : null,
      bank: isCards ? form.bank.trim() || null : null,
      seller: isCards ? form.seller.trim() || null : null,
      exp: isCards ? form.exp.trim() || null : null,
      zip: isCards ? form.zip.trim() || null : null,
      valid: isCards ? form.valid.trim() || null : null,
      scheme: isCards ? form.scheme.trim() || null : null,
      level: isCards ? form.level.trim() || null : null,
      country_code: isCards ? form.country_code.trim() || null : null,
      extras: isCards ? form.extras.trim() || null : null,
      image_url: form.image_url.trim() || null,
    };
    const { error } = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);
    if (error) toast.error("Save failed", { description: error.message });
    else {
      toast.success(editingId ? "Item updated" : "Item published");
      reset();
      await load();
    }
    setSaving(false);
  };

  const edit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      meta: p.meta,
      price: String(p.price),
      tag: p.tag ?? "",
      sort_order: String(p.sort_order),
      bin: p.bin ?? "",
      country: p.country ?? "",
      state: p.state ?? "",
      brand: p.brand ?? "",
      card_type: p.card_type ?? "",
      bank: p.bank ?? "",
      seller: p.seller ?? "",
      exp: p.exp ?? "",
      zip: p.zip ?? "",
      valid: p.valid ?? "",
      scheme: p.scheme ?? "",
      level: p.level ?? "",
      country_code: p.country_code ?? "",
      extras: p.extras ?? "",
      image_url: p.image_url ?? "",
    });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error("Delete failed", { description: error.message });
    else {
      toast.success("Item removed");
      if (editingId === id) reset();
      await load();
    }
  };

  const toggle = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) toast.error("Toggle failed", { description: error.message });
    else {
      toast.success(p.is_active ? "Item hidden" : "Item visible");
      await load();
    }
  };

  const counts = useMemo(() => items.length, [items]);

  if (adminLoading) return <Loader />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="animate-fade-up space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Admin Console</div>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight neon-text md:text-5xl">Inventory</h1>
            <p className="mt-2 text-muted-foreground">Add, edit, hide or remove items shown across the storefront.</p>
          </div>
          <Button variant="secondary" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <Tabs value={active} onValueChange={(v) => setActive(v as ProductCategory)}>
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card/60 p-1">
            {categories.map(({ value, label, Icon }) => (
              <TabsTrigger key={value} value={value} className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((c) => (
            <TabsContent key={c.value} value={c.value} className="mt-6 space-y-6">
              <section className="glass rounded-xl p-4 md:p-5">
                <form onSubmit={save} className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl font-black tracking-tight">
                      {editingId ? `Edit ${c.label}` : `New ${c.label} item`}
                    </h2>
                    {editingId && (
                      <Button type="button" variant="ghost" size="sm" onClick={reset}>
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Input placeholder="Price (USD)" type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <Textarea placeholder="Meta description / details" value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} className="min-h-20" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input placeholder="Tag (e.g. HOT, NEW) — optional" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                    <Input placeholder="Sort order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                  </div>

                  {isCards && (
                    <div className="grid gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3 md:grid-cols-3">
                      <Input placeholder="Base (e.g. Galaxy:25-04)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      <Input placeholder="Seller (e.g. 6369)" value={form.seller} onChange={(e) => setForm({ ...form, seller: e.target.value })} />
                      <Input placeholder="BIN" value={form.bin} onChange={(e) => setForm({ ...form, bin: e.target.value })} />
                      <Input placeholder="Exp (e.g. 2/27)" value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} />
                      <Input placeholder="ZIP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                      <Input placeholder="Bank" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} />
                      <Input placeholder="Valid % (e.g. 85%)" value={form.valid} onChange={(e) => setForm({ ...form, valid: e.target.value })} />
                      <Input placeholder="Scheme (e.g. MASTERCARD)" value={form.scheme} onChange={(e) => setForm({ ...form, scheme: e.target.value })} />
                      <Input placeholder="Type (e.g. Credit)" value={form.card_type} onChange={(e) => setForm({ ...form, card_type: e.target.value })} />
                      <Input placeholder="Level (e.g. STANDARD)" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
                      <div className="md:col-span-2">
                        <Select
                          value={findCountry(form.country_code)?.code ?? ""}
                          onValueChange={(code) => {
                            const c = COUNTRIES.find((x) => x.code === code);
                            if (c) setForm({ ...form, country: c.name, country_code: c.code });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Country (with real flag)">
                              {form.country_code && (
                                <span className="inline-flex items-center gap-2">
                                  <CountryFlag value={form.country_code} width={22} />
                                  <span>{form.country || findCountry(form.country_code)?.name}</span>
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                <span className="inline-flex items-center gap-2">
                                  <CountryFlag value={c.code} width={22} />
                                  <span>{c.name}</span>
                                  <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input placeholder="State / region" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                      <Input placeholder="Brand (legacy)" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                      <Input placeholder="Extras (e.g. Full name + Address...)" className="md:col-span-3" value={form.extras} onChange={(e) => setForm({ ...form, extras: e.target.value })} />
                    </div>
                  )}

                  <Button type="submit" disabled={saving}>
                    <Plus className="h-4 w-4" /> {saving ? "Saving..." : editingId ? "Save changes" : "Publish item"}
                  </Button>
                </form>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  <Package className="h-4 w-4" /> {counts} items in {c.label}
                </div>
                {loading ? (
                  <Loader />
                ) : !items.length ? (
                  <div className="rounded-lg border border-border bg-card/60 px-5 py-10 text-center text-muted-foreground">
                    Nothing here yet. Add your first item above.
                  </div>
                ) : (
                  items.map((p) => (
                    <article key={p.id} className="grid gap-3 rounded-lg border border-border bg-card/60 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-foreground">{p.name}</h3>
                          {p.tag && <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">{p.tag}</span>}
                          {!p.is_active && <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-destructive">Hidden</span>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{p.meta}</p>
                        {isCards && (
                          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                            {p.bin && `BIN ${p.bin} · `}{p.brand} {p.card_type} · {p.bank} · {p.country} {p.state}
                          </p>
                        )}
                        <div className="mt-2 font-mono text-sm font-bold text-primary">${Number(p.price).toFixed(2)}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Button type="button" variant="secondary" size="sm" onClick={() => edit(p)}><Edit3 className="h-4 w-4" /> Edit</Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => toggle(p)}><Power className="h-4 w-4" /> {p.is_active ? "Hide" : "Show"}</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
                      </div>
                    </article>
                  ))
                )}
              </section>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminProducts;
