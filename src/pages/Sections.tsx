import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, CreditCard, Zap, Network, Wrench, Search, ShoppingCart, Plus, MonitorSmartphone, ShieldCheck, Lock } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SectionPage } from "@/components/SectionPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useCommerce } from "@/contexts/CommerceContext";
import { useProducts } from "@/hooks/use-products";
import { Loader } from "@/components/Loader";
import { CountryFlag } from "@/components/CountryFlag";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CARDS_MIN_DEPOSIT = 100;

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
          <div className="space-y-3">
            {/* Column headers — visible on lg+ */}
            <div className="hidden gap-2 rounded-lg border border-border bg-card/70 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground lg:grid lg:grid-cols-[1.2fr_0.6fr_0.7fr_0.5fr_0.6fr_1.1fr_0.5fr_0.8fr_0.6fr_0.7fr_0.6fr]">
              <div>Base</div>
              <div>Seller</div>
              <div>BIN</div>
              <div>Exp</div>
              <div>ZIP</div>
              <div>Bank</div>
              <div>Valid</div>
              <div>Scheme</div>
              <div>Type</div>
              <div>Level</div>
              <div>Country</div>
            </div>

            {availableCards.map((card) => {
              const inCart = cartItems.some((i) => i.id === cartIdFor(card.id));
              return (
                <article
                  key={card.id}
                  className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-smooth hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)] md:p-5"
                >
                  {/* Top row: data grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4 lg:grid-cols-[1.2fr_0.6fr_0.7fr_0.5fr_0.6fr_1.1fr_0.5fr_0.8fr_0.6fr_0.7fr_0.6fr] lg:items-center">
                    <Field label="Base" valueClass="font-mono font-bold text-accent">{card.name}</Field>
                    <Field label="Seller" valueClass="font-mono font-bold text-success">{card.seller ?? "—"}</Field>
                    <Field label="BIN" valueClass="font-mono font-bold text-primary">{card.bin ?? "—"}</Field>
                    <Field label="Exp" valueClass="font-mono font-semibold text-foreground">{card.exp ?? "—"}</Field>
                    <Field label="ZIP" valueClass="font-mono font-semibold text-warning">{card.zip ?? "—"}</Field>
                    <Field label="Bank" valueClass="font-medium text-foreground">{card.bank ?? "—"}</Field>
                    <Field label="Valid" valueClass="font-mono font-bold text-success">{card.valid ?? "—"}</Field>
                    <Field label="Scheme" valueClass="font-mono font-bold uppercase text-foreground">{card.scheme ?? card.brand ?? "—"}</Field>
                    <Field label="Type" valueClass="font-medium text-foreground">{card.card_type ?? "—"}</Field>
                    <Field label="Level" valueClass="font-mono font-bold uppercase text-foreground">{card.level ?? "—"}</Field>
                    <Field label="Country" valueClass="text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CountryFlag value={card.country_code ?? card.country} width={22} />
                        <span className="font-mono text-xs uppercase">{card.country ?? card.country_code ?? "—"}</span>
                      </span>
                    </Field>
                  </div>

                  {/* Bottom row: price, CTA, extras */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1.5 font-mono text-xs font-bold text-background">
                      <span className="text-muted-foreground/80">PRICE:</span>
                      <span className="text-background">${Number(card.price).toFixed(2)}</span>
                    </span>
                    <Button
                      size="sm"
                      variant={inCart ? "secondary" : "default"}
                      onClick={() => addCard(card)}
                      disabled={inCart}
                      className="rounded-full"
                    >
                      <ShoppingCart className="h-4 w-4" /> {inCart ? "Added" : "Add to cart"}
                    </Button>
                    {card.extras && (
                      <span className="font-mono text-xs text-accent">{card.extras}</span>
                    )}
                    {card.tag && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                        <ShieldCheck className="h-3 w-3" /> {card.tag}
                      </span>
                    )}
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

const Field = ({ label, valueClass, children }: { label: string; valueClass?: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground lg:hidden">{label}</div>
    <div className={`truncate ${valueClass ?? ""}`}>{children}</div>
  </div>
);
