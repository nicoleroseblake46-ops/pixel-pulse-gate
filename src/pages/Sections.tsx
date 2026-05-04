import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, CreditCard, Zap, Network, Search, ShoppingCart, MonitorSmartphone, ShieldCheck, ScrollText, Globe2, FileArchive, Calendar, BadgeCheck } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SectionPage } from "@/components/SectionPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useCommerce } from "@/contexts/CommerceContext";
import { useProducts } from "@/hooks/use-products";
import { Loader } from "@/components/Loader";
import { CountryFlag } from "@/components/CountryFlag";
import { toast } from "sonner";

const emptyFilters = { bin: "", country: "", state: "", brand: "", type: "", bank: "" };

export const Sales = () => (
  <SectionPage title="Sales" tagline="Limited-time deals refreshed every hour. Lock in before they vanish." Icon={Tag} category="sales" />
);

export const Socks = () => (
  <SectionPage title="Socks" tagline="Fresh residential SOCKS5 from a 3.5K+ pool, refreshed daily." Icon={Zap} category="socks" />
);

export const Proxy = () => (
  <SectionPage title="Proxy" tagline="Datacenter, residential, mobile — choose your battlefield." Icon={Network} category="proxy" />
);


export const RDP = () => (
  <SectionPage title="RDP" tagline="Private remote desktops · Windows · admin access · global regions." Icon={MonitorSmartphone} category="rdp" />
);

export const Cards = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, addToCart, addManyToCart } = useCommerce();
  const { products, loading } = useProducts("cards");
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 500]);

  const availableCards = useMemo(
    () =>
      products.filter((card) => {
        const text = (val: string | null, search: string) =>
          (val ?? "").toLowerCase().includes(search.trim().toLowerCase());
        const matches =
          (card.bin ?? "").includes(filters.bin.trim()) &&
          text(card.country, filters.country) &&
          text(card.state, filters.state) &&
          text(card.brand, filters.brand) &&
          text(card.card_type, filters.type) &&
          text(card.bank, filters.bank);
        return matches && Number(card.price) >= appliedPriceRange[0] && Number(card.price) <= appliedPriceRange[1];
      }),
    [appliedPriceRange, filters, products],
  );

  const updateFilter = (key: keyof typeof emptyFilters, value: string) =>
    setDraftFilters((current) => ({ ...current, [key]: value }));

  const runSearch = () => {
    setFilters(draftFilters);
    setAppliedPriceRange(priceRange);
  };

  const cartIdFor = (id: string) => `cards-${id}`;

  const addCard = (card: typeof products[number]) => {
    addToCart({
      id: cartIdFor(card.id),
      name: `${card.brand ?? card.name} ${card.card_type ?? ""}`.trim(),
      meta: `${card.country ?? ""} · ${card.bank ?? ""}`,
      price: Number(card.price),
    });
    toast.success("Added to cart", { description: `${card.bin ? `BIN ${card.bin}` : card.name} ready.` });
  };

  const addAll = () => {
    addManyToCart(
      availableCards.map((card) => ({
        id: cartIdFor(card.id),
        name: `${card.brand ?? card.name} ${card.card_type ?? ""}`.trim(),
        meta: `${card.country ?? ""} · ${card.bank ?? ""}`,
        price: Number(card.price),
      })),
    );
    toast.success("Cart updated", { description: `${availableCards.length} matching cards added.` });
  };

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">/ Cards</div>
              <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
                <span className="neon-text">Cards</span>
              </h1>
            </div>
          </div>
          <button
            onClick={() => navigate("/payments")}
            className="glass flex items-center gap-2 rounded-xl px-4 py-3 font-mono text-sm text-primary transition-smooth hover:border-primary/50 hover:text-accent"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartItems.length} IN CART · ${cartTotal.toFixed(2)}
          </button>
        </div>
        <p className="mt-3 text-muted-foreground">Filter verified card inventory and add matches to your cart.</p>
      </div>

      <section className="glass mb-6 rounded-xl p-4 animate-fade-up md:p-5">
        <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-primary">Top Filters</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Input placeholder="BINs" value={draftFilters.bin} onChange={(e) => updateFilter("bin", e.target.value)} />
          <Input placeholder="Country" value={draftFilters.country} onChange={(e) => updateFilter("country", e.target.value)} />
          <Input placeholder="State" value={draftFilters.state} onChange={(e) => updateFilter("state", e.target.value)} />
          <Input placeholder="Brand" value={draftFilters.brand} onChange={(e) => updateFilter("brand", e.target.value)} />
          <Input placeholder="Card Type" value={draftFilters.type} onChange={(e) => updateFilter("type", e.target.value)} />
          <Input placeholder="Bank" value={draftFilters.bank} onChange={(e) => updateFilter("bank", e.target.value)} />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span>Price Range</span>
              <span className="text-primary">${priceRange[0]} - ${priceRange[1]}</span>
            </div>
            <Slider min={0} max={500} step={1} value={priceRange} onValueChange={setPriceRange} />
          </div>
          <Button onClick={runSearch} className="glow-primary"><Search /> Search</Button>
          <Button variant="secondary" onClick={addAll} disabled={!availableCards.length}><ShoppingCart /> Add All</Button>
        </div>
      </section>

      <section className="space-y-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Available Cards</div>
          <div className="font-mono text-xs text-muted-foreground">{availableCards.length} MATCHES</div>
        </div>

        {loading ? (
          <Loader />
        ) : !availableCards.length ? (
          <div className="glass rounded-xl px-6 py-12 text-center text-muted-foreground">
            No cards match the current filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {availableCards.map((card, idx) => {
              const inCart = cartItems.some((i) => i.id === cartIdFor(card.id));
              const scheme = (card.scheme ?? card.brand ?? "").toUpperCase();
              return (
                <article
                  key={card.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/40 p-5 shadow-sm transition-smooth hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-elevated)] animate-fade-up"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Top accent bar */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary opacity-70 transition-smooth group-hover:opacity-100" />
                  {/* Decorative chip glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-smooth group-hover:bg-primary/20" />

                  {/* Header: scheme + tag */}
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-14 items-center justify-center rounded-md bg-gradient-to-br from-primary/30 to-accent/20 ring-1 ring-primary/30">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Scheme</div>
                        <div className="font-display text-sm font-black tracking-wide text-foreground">{scheme || "—"}</div>
                      </div>
                    </div>
                    {card.tag && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                        <ShieldCheck className="h-3 w-3" /> {card.tag}
                      </span>
                    )}
                  </div>

                  {/* BIN feature */}
                  <div className="relative mt-4">
                    <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">BIN</div>
                    <div className="font-mono text-2xl font-black tracking-widest text-primary text-glow">
                      {card.bin ?? "••••••"} <span className="text-muted-foreground">•• ••</span>
                    </div>
                  </div>

                  {/* Mini grid */}
                  <div className="relative mt-4 grid grid-cols-3 gap-2 text-xs">
                    <Stat icon={<Calendar className="h-3 w-3" />} label="Exp" value={card.exp ?? "—"} />
                    <Stat icon={<BadgeCheck className="h-3 w-3" />} label="Valid" value={card.valid ?? "—"} accent="success" />
                    <Stat icon={<CreditCard className="h-3 w-3" />} label="Type" value={card.card_type ?? "—"} />
                    <Stat icon={<ScrollText className="h-3 w-3" />} label="Level" value={card.level ?? "—"} />
                    <Stat icon={<Tag className="h-3 w-3" />} label="ZIP" value={card.zip ?? "—"} accent="warning" />
                    <Stat icon={<ShieldCheck className="h-3 w-3" />} label="Seller" value={card.seller ?? "—"} accent="success" />
                  </div>

                  {/* Bank + country */}
                  <div className="relative mt-4 space-y-1.5 border-t border-border/50 pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <CountryFlag value={card.country_code ?? card.country} width={20} />
                      <span className="truncate font-mono text-xs uppercase tracking-wide text-foreground">
                        {card.country ?? card.country_code ?? "Unknown"}{card.state ? ` · ${card.state}` : ""}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      <span className="font-mono uppercase tracking-widest text-muted-foreground/70">Bank · </span>
                      <span className="font-medium text-foreground">{card.bank ?? "—"}</span>
                    </div>
                    {card.extras && (
                      <div className="truncate font-mono text-[11px] text-accent/90">{card.extras}</div>
                    )}
                  </div>

                  {/* Footer: price + CTA */}
                  <div className="relative mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Price</div>
                      <div className="font-display text-2xl font-black text-primary text-glow">${Number(card.price).toFixed(2)}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={inCart ? "secondary" : "default"}
                      onClick={() => addCard(card)}
                      disabled={inCart}
                      className="rounded-full glow-primary"
                    >
                      <ShoppingCart className="h-4 w-4" /> {inCart ? "Added" : "Add"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

const Stat = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: "success" | "warning" }) => (
  <div className="rounded-md border border-border/60 bg-background/40 px-2 py-1.5">
    <div className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
      {icon}{label}
    </div>
    <div className={`mt-0.5 truncate font-mono text-xs font-bold ${accent === "success" ? "text-success" : accent === "warning" ? "text-warning" : "text-foreground"}`}>
      {value}
    </div>
  </div>
);

export const Logs = () => (
  <SectionPage title="Logs" tagline="Fresh stealer logs · cookies, autofills, wallet artifacts. Updated daily." Icon={ScrollText} category="logs" />
);

