import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, CreditCard, Zap, Network, Wrench, Search, ShoppingCart, Plus, MonitorSmartphone } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SectionPage } from "@/components/SectionPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCommerce } from "@/contexts/CommerceContext";
import { useProducts } from "@/hooks/use-products";
import { Loader } from "@/components/Loader";
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

export const Tools = () => (
  <SectionPage title="Tools" tagline="GPU-accelerated checkers, scrapers and automation kits." Icon={Wrench} category="tools" />
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

      <section className="glass rounded-xl p-4 animate-fade-up md:p-5" style={{ animationDelay: "80ms" }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Available Cards</div>
          <div className="font-mono text-xs text-muted-foreground">{availableCards.length} MATCHES</div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BIN</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Info</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableCards.map((card) => {
                const inCart = cartItems.some((i) => i.id === cartIdFor(card.id));
                return (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono text-primary">{card.bin ?? "—"}</TableCell>
                    <TableCell>{card.country ?? "—"}</TableCell>
                    <TableCell className="min-w-[240px]">
                      <div className="font-medium">{card.brand ?? card.name} {card.card_type ?? ""} · {card.bank ?? ""}</div>
                      <div className="text-xs text-muted-foreground">{card.state ?? ""} · {card.meta}</div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-primary">${Number(card.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant={inCart ? "secondary" : "default"} onClick={() => addCard(card)} disabled={inCart}>
                        <Plus /> {inCart ? "Added" : "Add"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!availableCards.length && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No cards match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </section>
    </AppLayout>
  );
};
