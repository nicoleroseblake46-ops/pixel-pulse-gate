import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Edit3, Plus, Power, RefreshCw, Trash2, X, Package, Tag as TagIcon, CreditCard, Network, Wrench, MonitorSmartphone, Zap, ScrollText, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Loader } from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAdmin } from "@/hooks/use-admin";
import { useAppSettings } from "@/hooks/use-app-settings";
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
  city: "",
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
  vendor_id: "",
  full_card: "",
  host_ip: "",
};

type VendorOpt = { id: string; handle: string; name: string };

const AdminProducts = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { salesHidden, setSetting } = useAppSettings();
  const [active, setActive] = useState<ProductCategory>("sales");
  const [items, setItems] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<VendorOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("vendors").select("id,handle,name").order("name").then(({ data }) => {
      setVendors((data ?? []) as VendorOpt[]);
    });
  }, []);

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
      country: form.country.trim() || null,
      state: form.state.trim() || null,
      city: isCards ? form.city.trim() || null : null,
      brand: form.brand.trim() || null,
      card_type: form.card_type.trim() || null,
      bank: form.bank.trim() || null,
      seller: isCards ? form.seller.trim() || null : null,
      exp: isCards ? form.exp.trim() || null : null,
      zip: isCards ? form.zip.trim() || null : null,
      valid: isCards ? form.valid.trim() || null : null,
      scheme: isCards ? form.scheme.trim() || null : null,
      level: form.level.trim() || null,
      country_code: form.country_code.trim() || null,
      extras: isCards ? form.extras.trim() || null : null,
      image_url: form.image_url.trim() || null,
      vendor_id: form.vendor_id || null,
      full_card: isCards ? form.full_card.trim() || null : null,
      host_ip: active === "rdp" ? form.host_ip.trim() || null : null,
    } as any;
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
      city: (p as any).city ?? "",
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
      vendor_id: (p as any).vendor_id ?? "",
      full_card: (p as any).full_card ?? "",
      host_ip: (p as any).host_ip ?? "",
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

        {/* Site-wide toggles */}
        <section className="glass rounded-xl border border-border p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/40">
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-display text-base font-bold">Hide Sales section</div>
                <p className="text-xs text-muted-foreground">When ON, the Sales page and sidebar link are hidden for regular users. Admins still see it.</p>
              </div>
            </div>
            <Switch checked={salesHidden} onCheckedChange={(checked) => setSetting("sales_hidden", checked)} />
          </div>
        </section>

        <DashboardEditor />


        <Tabs value={active} onValueChange={(v) => setActive(v as ProductCategory)}>
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-card/60 p-1">
            {categories.map(({ value, label, Icon }) => (
              <TabsTrigger key={value} value={value} className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((c) => {
            const formSection = (
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

                  {/* Vendor selector removed — vendors no longer used in storefront */}


                  <div className="grid gap-3 md:grid-cols-2">
                    <Input placeholder="Tag (e.g. HOT, NEW) — optional" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                    <Input placeholder="Sort order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                  </div>

                  <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                    <div className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Product image</div>
                    <div className="flex flex-wrap items-center gap-3">
                      {form.image_url && (
                        <img src={form.image_url} alt="preview" className="h-20 w-20 rounded-md border border-border object-cover" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const ext = file.name.split(".").pop() || "png";
                          const path = `${active}/${crypto.randomUUID()}.${ext}`;
                          const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
                          if (upErr) { toast.error("Upload failed", { description: upErr.message }); return; }
                          const { data } = supabase.storage.from("product-images").getPublicUrl(path);
                          setForm((f) => ({ ...f, image_url: data.publicUrl }));
                          if (editingId) {
                            const { error: updErr } = await supabase.from("products").update({ image_url: data.publicUrl }).eq("id", editingId);
                            if (updErr) { toast.error("Could not attach image to product", { description: updErr.message }); return; }
                            await load();
                            toast.success("Image uploaded & attached");
                          } else {
                            toast.success("Image uploaded — click Publish to save the item");
                          }
                        }}
                        className="text-sm text-muted-foreground"
                      />
                      {form.image_url && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, image_url: "" })}>
                          <X className="h-4 w-4" /> Remove
                        </Button>
                      )}
                    </div>
                    <Input placeholder="Or paste image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="mt-2" />
                  </div>

                  {isCards && (
                    <>
                      <BulkCardsPaste onImported={load} defaultVendorId={form.vendor_id} />
                      <div className="grid gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3 md:grid-cols-3">
                        <Input placeholder="Base (e.g. Galaxy:25-04)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <Input placeholder="Seller / Full name" value={form.seller} onChange={(e) => setForm({ ...form, seller: e.target.value })} />
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
                        <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        <Input placeholder="Full Card (PAN|MM/YY|CVV) — delivered after purchase" value={form.full_card} onChange={(e) => setForm({ ...form, full_card: e.target.value })} className="md:col-span-3 font-mono" />
                      </div>
                    </>
                  )}

                  {active === "rdp" && (
                    <div className="grid gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3 md:grid-cols-2">
                      <Input placeholder="Name / Label" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      <Input placeholder="Host - IP (e.g. 192.168.1.10)" value={form.host_ip} onChange={(e) => setForm({ ...form, host_ip: e.target.value })} className="font-mono" />
                      <Input placeholder="Hosted By" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} />
                      <Input placeholder="System (e.g. Windows 10)" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                      <Input placeholder="RAM (e.g. 8GB)" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
                      <Input placeholder="HDD Size (e.g. 500GB SSD)" value={form.card_type} onChange={(e) => setForm({ ...form, card_type: e.target.value })} />
                      <div className="md:col-span-2">
                        <Select
                          value={findCountry(form.country_code)?.code ?? ""}
                          onValueChange={(code) => { const c = COUNTRIES.find((x) => x.code === code); if (c) setForm({ ...form, country: c.name, country_code: c.code }); }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Country">
                              {form.country_code && (<span className="inline-flex items-center gap-2"><CountryFlag value={form.country_code} width={22} /><span>{form.country}</span></span>)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {COUNTRIES.map((c) => (<SelectItem key={c.code} value={c.code}><span className="inline-flex items-center gap-2"><CountryFlag value={c.code} width={22} /><span>{c.name}</span></span></SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}


                  <Button type="submit" disabled={saving}>
                    <Plus className="h-4 w-4" /> {saving ? "Saving..." : editingId ? "Save changes" : "Publish item"}
                  </Button>
                </form>
              </section>
            );
            return (
            <TabsContent key={c.value} value={c.value} className="mt-6 space-y-6">
              {!editingId && formSection}


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
                    <Fragment key={p.id}>
                    <article className="grid gap-3 rounded-lg border border-border bg-card/60 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
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
                        <Button type="button" variant="secondary" size="sm" onClick={() => edit(p)}><Edit3 className="h-4 w-4" /> {editingId === p.id ? "Editing…" : "Edit"}</Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => toggle(p)}><Power className="h-4 w-4" /> {p.is_active ? "Hide" : "Show"}</Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
                      </div>
                    </article>
                    {editingId === p.id && (
                      <div className="animate-fade-up ml-0 md:ml-4 border-l-2 border-primary/50 pl-0 md:pl-4">
                        {formSection}
                      </div>
                    )}
                    </Fragment>
                  ))
                )}
              </section>
            </TabsContent>
            );
          })}

        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminProducts;

type Stat = { label: string; value: string; icon: string };
type Panel = { accent?: string; title?: string; body: string };

const DEFAULT_STATS: Stat[] = [
  { label: "Total CVVs", value: "auto:cards", icon: "CreditCard" },
  { label: "Total RDPs", value: "auto:rdp", icon: "MonitorSmartphone" },
  { label: "Total SOCKS", value: "auto:socks", icon: "Zap" },
  { label: "Total LOGS", value: "auto:logs", icon: "ScrollText" },
  { label: "CVV Update Time", value: "Soon", icon: "History" },
];

const DEFAULT_PANELS: Panel[] = [
  { accent: "danger", body: "Always save our main url..." },
  { accent: "danger", body: "Payments possible in < BTC, LTC, DOGE, USDT TRC20 + ERC20, ETH, XMR >" },
  { accent: "info", body: "Refund method for HQ cards: ..." },
];

const ICON_OPTIONS = ["CreditCard","MonitorSmartphone","Zap","ScrollText","History","Database","Server","Network","Shield","Globe","Wrench"];
const ACCENT_OPTIONS = [
  { value: "danger", label: "Red (danger)" },
  { value: "info", label: "Green (info)" },
  { value: "warning", label: "Yellow (warning)" },
];

const DashboardEditor = () => {
  const { settings, setSetting } = useAppSettings();
  const initialStats = (Array.isArray(settings.dashboard_stats) ? settings.dashboard_stats : DEFAULT_STATS) as Stat[];
  const initialPanels = (Array.isArray(settings.dashboard_important) ? settings.dashboard_important : DEFAULT_PANELS) as Panel[];
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [panels, setPanels] = useState<Panel[]>(initialPanels);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setStats(initialStats); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [JSON.stringify(initialStats)]);
  useEffect(() => { setPanels(initialPanels); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [JSON.stringify(initialPanels)]);

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([
        setSetting("dashboard_stats", stats),
        setSetting("dashboard_important", panels),
      ]);
      toast.success("Dashboard updated");
    } catch (e: any) {
      toast.error("Save failed", { description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass space-y-6 rounded-xl border border-border p-4 md:p-5">
      <div>
        <h2 className="font-display text-xl font-black">Dashboard — Stats row</h2>
        <p className="text-xs text-muted-foreground">Use <code>auto:cards</code>, <code>auto:rdp</code>, <code>auto:socks</code>, <code>auto:proxy</code>, <code>auto:logs</code>, <code>auto:tools</code>, <code>auto:sales</code> as the value to auto-count active products. Otherwise type any text.</p>
      </div>
      <div className="space-y-3">
        {stats.map((s, i) => (
          <div key={i} className="grid gap-2 rounded-lg border border-border bg-secondary/30 p-3 md:grid-cols-[1fr_1fr_180px_auto]">
            <Input placeholder="Label" value={s.label} onChange={(e) => setStats((arr) => arr.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
            <Input placeholder="Value (or auto:cards)" value={s.value} onChange={(e) => setStats((arr) => arr.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} />
            <Select value={s.icon} onValueChange={(v) => setStats((arr) => arr.map((x, idx) => idx === i ? { ...x, icon: v } : x))}>
              <SelectTrigger><SelectValue placeholder="Icon" /></SelectTrigger>
              <SelectContent>{ICON_OPTIONS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="button" variant="destructive" size="sm" onClick={() => setStats((arr) => arr.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setStats((arr) => [...arr, { label: "New stat", value: "0", icon: "CreditCard" }])}>
          <Plus className="h-4 w-4" /> Add stat
        </Button>
      </div>

      <div>
        <h2 className="font-display text-xl font-black">Dashboard — Important panels</h2>
        <p className="text-xs text-muted-foreground">Shown on the right column of the homepage.</p>
      </div>
      <div className="space-y-3">
        {panels.map((p, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border bg-secondary/30 p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
              <Input placeholder="Title (optional)" value={p.title ?? ""} onChange={(e) => setPanels((arr) => arr.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} />
              <Select value={p.accent ?? "danger"} onValueChange={(v) => setPanels((arr) => arr.map((x, idx) => idx === i ? { ...x, accent: v } : x))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACCENT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" variant="destructive" size="sm" onClick={() => setPanels((arr) => arr.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea placeholder="Body text (supports line breaks)" value={p.body} onChange={(e) => setPanels((arr) => arr.map((x, idx) => idx === i ? { ...x, body: e.target.value } : x))} className="min-h-24" />
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setPanels((arr) => [...arr, { accent: "danger", body: "" }])}>
          <Plus className="h-4 w-4" /> Add panel
        </Button>
      </div>

      <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save dashboard"}</Button>
    </section>
  );
};

/**
 * Bulk-paste cards in the format:
 * BIN  BRAND  TYPE  LEVEL  BANK  COUNTRY
 * Columns separated by tab, comma, or " | ". One card per line.
 * Header row (BIN/Brand/...) is auto-skipped.
 * Auto-fills mock seller name, city, state, zip, exp, and full PAN|MM/YY|CVV.
 */
const FIRST_NAMES = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","William","Elizabeth","David","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen","Daniel","Nancy","Matthew","Lisa","Christopher","Margaret","Anthony","Sandra","Mark","Ashley"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Wilson","Anderson","Taylor","Thomas","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker"];
const US_LOCATIONS = [
  { city: "New York", state: "NY", zip: "10001" }, { city: "Los Angeles", state: "CA", zip: "90001" },
  { city: "Chicago", state: "IL", zip: "60601" }, { city: "Houston", state: "TX", zip: "77001" },
  { city: "Phoenix", state: "AZ", zip: "85001" }, { city: "Philadelphia", state: "PA", zip: "19101" },
  { city: "San Antonio", state: "TX", zip: "78201" }, { city: "Miami", state: "FL", zip: "33101" },
  { city: "Atlanta", state: "GA", zip: "30301" }, { city: "Boston", state: "MA", zip: "02101" },
  { city: "Seattle", state: "WA", zip: "98101" }, { city: "Denver", state: "CO", zip: "80201" },
];
const LOC_BY_CC: Record<string, { city: string; state: string; zip: string }[]> = {
  US: US_LOCATIONS,
  CA: [{ city: "Toronto", state: "ON", zip: "M5H 2N2" }, { city: "Vancouver", state: "BC", zip: "V6B 1A1" }, { city: "Montreal", state: "QC", zip: "H3B 4W5" }],
  GB: [{ city: "London", state: "ENG", zip: "EC1A 1BB" }, { city: "Manchester", state: "ENG", zip: "M1 1AE" }],
  AU: [{ city: "Sydney", state: "NSW", zip: "2000" }, { city: "Melbourne", state: "VIC", zip: "3000" }],
  DE: [{ city: "Berlin", state: "BE", zip: "10115" }, { city: "Munich", state: "BY", zip: "80331" }],
};
const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length];
const seedFromString = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };

const brandFromBin = (bin: string): string => {
  const d1 = bin[0];
  const d2 = bin.slice(0, 2);
  const d4 = parseInt(bin.slice(0, 4) || "0", 10);
  if (d1 === "4") return "VISA";
  if (["51","52","53","54","55"].includes(d2)) return "MASTERCARD";
  if (d4 >= 2221 && d4 <= 2720) return "MASTERCARD";
  if (d2 === "34" || d2 === "37") return "AMEX";
  if (d2 === "60" || d2 === "62" || d2 === "64" || d2 === "65") return "DISCOVER";
  if (d2 === "35") return "JCB";
  if (d2 === "36" || d2 === "30" || d2 === "38") return "DINERS";
  return "";
};

const BANK_COUNTRY: { kw: string; cc: string }[] = [
  ...["SUTTON","CHASE","JPMORGAN","WELLS FARGO","BANK OF AMERICA","BOFA","CAPITAL ONE","CITI","CITIBANK","US BANK","USBANK","PNC","NAVY FEDERAL","USAA","DISCOVER","AMERICAN EXPRESS","AMEX","REGIONS","FIFTH THIRD","HUNTINGTON","KEYBANK","BB&T","TRUIST","SYNCHRONY","GOLDMAN","METABANK","GREEN DOT","COMERICA","M&T","CITIZENS","ALLY","SOFI","VARO","CHIME","MERCURY","BREX"].map(kw => ({ kw, cc: "US" })),
  ...["BARCLAYS","LLOYDS","HSBC","NATWEST","MONZO","STARLING","HALIFAX","NATIONWIDE","SANTANDER UK","REVOLUT","TSB","METRO BANK","VIRGIN MONEY","CO-OPERATIVE","COOPERATIVE","CLYDESDALE","YORKSHIRE","FIRST DIRECT","ROYAL BANK OF SCOTLAND","RBS","UK","GB "].map(kw => ({ kw, cc: "GB" })),
  ...["ROYAL BANK OF CANADA","RBC","TD CANADA","SCOTIABANK","BMO","CIBC","DESJARDINS","TANGERINE","CANADA","CANADIAN"].map(kw => ({ kw, cc: "CA" })),
  ...["COMMONWEALTH","WESTPAC","ANZ","NAB","BENDIGO","MACQUARIE","AUSTRALIA","AUSTRALIAN"].map(kw => ({ kw, cc: "AU" })),
  ...["DEUTSCHE","COMMERZBANK","SPARKASSE","POSTBANK","N26","DKB","DZ BANK","GERMANY","GERMAN"].map(kw => ({ kw, cc: "DE" })),
  ...["BNP PARIBAS","CREDIT AGRICOLE","SOCIETE GENERALE","LA BANQUE POSTALE","CREDIT MUTUEL","BPCE","FRANCE"].map(kw => ({ kw, cc: "FR" })),
  ...["ING","ABN AMRO","RABOBANK","BUNQ","SNS BANK","NETHERLANDS","DUTCH"].map(kw => ({ kw, cc: "NL" })),
  ...["INTESA","UNICREDIT","MONTE DEI PASCHI","BANCA","ITALY","ITALIAN"].map(kw => ({ kw, cc: "IT" })),
  ...["BBVA","CAIXA","BANKINTER","SABADELL","SPAIN","SPANISH"].map(kw => ({ kw, cc: "ES" })),
];

// Common issuer BIN prefixes → country (fallback when bank text is ambiguous).
const BIN_COUNTRY: { prefix: string; cc: string }[] = [
  // UK
  ...["4462","4543","4658","4751","4929","5301","5355","5404","5413","5522","5641","5648"].map(p => ({ prefix: p, cc: "GB" })),
  // Canada
  ...["4506","4520","4530","4536","4540","4560","4590","5191","5254","5490","5522"].map(p => ({ prefix: p, cc: "CA" })),
  // Australia
  ...["4557","4564","4921","5163","5313","5610"].map(p => ({ prefix: p, cc: "AU" })),
  // Germany
  ...["4104","4547","5232","5453","5544"].map(p => ({ prefix: p, cc: "DE" })),
  // France
  ...["4970","4974","4978","5131","5170"].map(p => ({ prefix: p, cc: "FR" })),
  // Netherlands
  ...["4032","4988","5300","5413"].map(p => ({ prefix: p, cc: "NL" })),
  // Italy
  ...["4023","4517","5333"].map(p => ({ prefix: p, cc: "IT" })),
  // Spain
  ...["4548","4930","5480"].map(p => ({ prefix: p, cc: "ES" })),
];

const countryFromContext = (country: string, bank: string, bin: string) => {
  const direct = findCountry(country) || findCountry(country.slice(0, 2));
  if (direct) return direct;
  const b = ` ${(bank || "").toUpperCase()} `;
  const hit = BANK_COUNTRY.find((x) => b.includes(` ${x.kw} `) || b.includes(x.kw));
  if (hit) return findCountry(hit.cc);
  const binHit = BIN_COUNTRY.find((x) => bin.startsWith(x.prefix));
  if (binHit) return findCountry(binHit.cc);
  return findCountry("US");
};


const mockCardDetails = (bin: string, cc: string | null) => {
  const seed = seedFromString(bin + ":" + (cc ?? "") + ":" + Math.random().toString(36).slice(2, 8));
  const locs = LOC_BY_CC[cc ?? "US"] ?? US_LOCATIONS;
  const loc = pick(locs, seed >> 5);
  const month = String(((Math.abs(seed) % 12) + 1)).padStart(2, "0");
  const year = String(26 + (Math.abs(seed >> 7) % 4));
  const trailing = String(Math.floor(1000000000 + Math.abs(seed * 2654435761) % 9000000000)).slice(0, 10);
  const pan = (bin + trailing).slice(0, 16);
  const cvv = String(100 + (Math.abs(seed >> 11) % 900));
  return {
    // Hidden until purchase — show a tick in the inventory instead of the real value.
    name: "✓",
    city: "✓",
    state: loc.state,
    zip: loc.zip,
    exp: `${month}/${year}`,
    full_card: `${pan}|${month}/${year}|${cvv}`,
  };
};


const BulkCardsPaste = ({ onImported, defaultVendorId }: { onImported: () => Promise<void> | void; defaultVendorId?: string }) => {
  const [raw, setRaw] = useState("");
  const [base, setBase] = useState("");
  const [price, setPrice] = useState("5");
  const [busy, setBusy] = useState(false);

  const parse = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const rows: { bin: string; brand: string; card_type: string; level: string; bank: string; country: string }[] = [];
    for (const line of lines) {
      if (/^bin\b/i.test(line) && /brand|type|bank|country/i.test(line)) continue; // header
      // Split on tab, |, comma, or 2+ spaces. Preserves multi-word fields.
      const parts = line.split(/\t|\s*\|\s*|,\s*|\s{2,}/).map((p) => p.trim()).filter(Boolean);
      if (!parts.length) continue;
      const [bin, brand = "", card_type = "", level = "", bank = "", country = ""] = parts;
      if (!/^\d{4,}/.test(bin)) continue;
      rows.push({ bin: bin.replace(/\D/g, "").slice(0, 6), brand, card_type, level, bank, country });
    }
    return rows;
  };

  const preview = useMemo(() => parse(raw), [raw]);

  const importNow = async () => {
    if (!preview.length) { toast.error("Nothing to import"); return; }
    const priceN = Number(price);
    if (!Number.isFinite(priceN) || priceN < 0) { toast.error("Enter a valid default price"); return; }
    setBusy(true);
    const payload = preview.map((r) => {
      const brand = (r.brand || brandFromBin(r.bin) || "VISA").toUpperCase();
      const card_type = (r.card_type || "CREDIT").toUpperCase();
      const level = (r.level || "CLASSIC").toUpperCase();
      const bank = (r.bank || "UNKNOWN BANK").toUpperCase();
      const c = countryFromContext(r.country, bank, r.bin);
      const mock = mockCardDetails(r.bin, c?.code ?? null);
      return {
        category: "cards" as const,
        name: base.trim() || `Base ${new Date().toISOString().slice(0, 10)}`,
        meta: "",
        price: priceN,
        bin: r.bin,
        brand,
        scheme: brand,
        card_type,
        level,
        bank,
        country: c?.name ?? r.country ?? "United States",
        country_code: c?.code ?? "US",
        vendor_id: defaultVendorId || null,
        seller: mock.name,
        city: mock.city,
        state: mock.state,
        zip: mock.zip,
        exp: mock.exp,
        valid: "85%",
        full_card: mock.full_card,
      } as any;
    });
    const { error } = await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) { toast.error("Bulk import failed", { description: error.message }); return; }
    toast.success(`Imported ${payload.length} cards — brand, country & flag auto-detected`);
    setRaw("");
    await onImported();
  };


  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm font-bold">Bulk paste cards</div>
          <div className="text-[11px] text-muted-foreground">
            Paste anything from just <code>BIN</code> to <code>BIN BRAND TYPE LEVEL BANK COUNTRY</code>. Missing fields (brand, country, flag, city, state, zip, name, exp, full PAN) are auto-detected & filled.
          </div>

        </div>
        <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">{preview.length} parsed</span>
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_140px]">
        <Input placeholder="Base name (applied to all rows)" value={base} onChange={(e) => setBase(e.target.value)} />
        <Input placeholder="Price USD" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={"440393\tVISA\tDEBIT\tPREPAID CLASSIC\tSUTTON BANK\tUNITED STATES"}
        className="mt-2 min-h-32 font-mono text-xs"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" onClick={importNow} disabled={busy || !preview.length}>
          <Plus className="h-4 w-4" /> {busy ? "Importing..." : `Import ${preview.length} cards`}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setRaw("")} disabled={!raw}>Clear</Button>
      </div>
    </div>
  );
};


