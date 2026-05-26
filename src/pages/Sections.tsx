import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, CreditCard, Zap, Network, Search, ShoppingCart, MonitorSmartphone, ShieldCheck, ScrollText, Globe2, FileArchive, Calendar, BadgeCheck, ChevronLeft, ChevronRight, Lock, Sparkles, Wallet } from "lucide-react";
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

const CARDS_MIN_BALANCE = 50;

const CardsLockedGate = ({ balance }: { balance: number }) => {
  const navigate = useNavigate();
  const progress = Math.min(100, Math.round((balance / CARDS_MIN_BALANCE) * 100));
  const remaining = Math.max(0, CARDS_MIN_BALANCE - balance);

  return (
    <AppLayout>
      <div className="relative mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center px-4 py-12">
        {/* Ambient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/30 blur-[120px] animate-pulse-glow" />
          <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-accent/25 blur-[140px] animate-pulse-glow" style={{ animationDelay: "1.2s" }} />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warning/15 blur-[100px]" />
        </div>

        <div className="relative w-full animate-fade-up">
          <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-card/60 p-8 shadow-[0_0_80px_-15px_hsl(var(--primary)/0.55)] backdrop-blur-xl md:p-12">
            {/* Animated gradient sheen */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15" />
            <div className="pointer-events-none absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
            <div className="pointer-events-none absolute -bottom-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

            {/* Vault icon */}
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-30 blur-2xl animate-pulse-glow" />
              <div className="relative flex h-full w-full items-center justify-center rounded-2xl border border-primary/50 bg-gradient-primary shadow-[0_0_40px_hsl(var(--primary)/0.6)]">
                <Lock className="h-10 w-10 text-primary-foreground" strokeWidth={2.4} />
                <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-warning animate-pulse" />
              </div>
            </div>

            <div className="relative text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary">Vault · Restricted</div>
              <h1 className="mt-3 font-display text-4xl font-black tracking-tight md:text-5xl">
                <span className="neon-text">Cards Locked</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
                Access to the live card inventory requires a minimum balance of{" "}
                <span className="font-bold text-warning">${CARDS_MIN_BALANCE}</span>. Top up to unlock the vault.
              </p>
            </div>

            {/* Balance progress */}
            <div className="relative mx-auto mt-8 max-w-lg">
              <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
                <span className="text-muted-foreground">Balance</span>
                <span className="text-primary">${balance.toFixed(2)} / ${CARDS_MIN_BALANCE}</span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full border border-primary/30 bg-background/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-warning shadow-[0_0_20px_hsl(var(--primary)/0.8)] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,hsl(var(--primary-foreground)/0.25),transparent)] bg-[length:200%_100%] animate-[shimmer_2.4s_infinite]" />
              </div>
              <div className="mt-2 text-center font-mono text-[11px] text-muted-foreground">
                {remaining > 0 ? <>${remaining.toFixed(2)} more to unlock</> : <>Vault ready — refresh to enter</>}
              </div>
            </div>

            {/* Feature grid */}
            <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Verified Bases" },
                { icon: BadgeCheck, label: "Daily Refresh" },
                { icon: Globe2, label: "Global Coverage" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="glass flex items-center gap-2 rounded-xl px-3 py-3 text-xs">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => navigate("/payments")}
                className="group relative h-12 w-full overflow-hidden bg-gradient-primary px-8 font-display text-base font-bold text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.8)] sm:w-auto"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Top Up Balance
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/sales")}
                className="h-12 w-full border-primary/40 px-6 font-mono text-xs uppercase tracking-widest sm:w-auto"
              >
                Browse Sales Instead
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export const Cards = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, addToCart, addManyToCart, balance } = useCommerce();
  const { products, loading } = useProducts("cards");
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 500]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

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
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(availableCards.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedCards = availableCards.slice((page - 1) * pageSize, page * pageSize);

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

  if (balance < CARDS_MIN_BALANCE) {
    return <CardsLockedGate balance={balance} />;
  }

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
          <div className="relative overflow-hidden rounded-2xl border border-primary/40 shadow-[0_0_60px_-10px_hsl(var(--primary)/0.45)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_60%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.18),transparent_60%)]" />
            <div className="relative overflow-x-auto">
            <table className="w-full min-w-[1400px] border-collapse text-xs">
              <thead className="bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 backdrop-blur">
                <tr className="text-left font-mono text-[11px] uppercase tracking-wider">
                  <Th>Base</Th>
                  <Th>Seller</Th>
                  <Th>Base Quality</Th>
                  <Th>Bin</Th>
                  <Th>Level</Th>
                  <Th>Credit/Debit</Th>
                  <Th>ExpDate</Th>
                  <Th>Address Details</Th>
                  <Th>Email/Phone/DOB/SSN</Th>
                  <Th>Special Info</Th>
                  <Th>Bank Name</Th>
                  <Th>Refundable</Th>
                  <Th>Price</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {pagedCards.map((card) => {
                  const inCart = cartItems.some((i) => i.id === cartIdFor(card.id));
                  const scheme = (card.scheme ?? card.brand ?? "").toUpperCase();
                  return (
                    <tr key={card.id} className="border-t border-primary/20 align-top transition-colors hover:bg-primary/10">
                      <Td>
                        <div className="font-mono text-[11px] font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{card.name || "04MAY_95VR_EMAIL_PHONE_IP_FIRSTHAND2"}</div>
                        {card.tag && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-primary">
                            ◆ {card.tag}
                          </span>
                        )}
                      </Td>
                      <Td><span className="font-mono text-[11px] text-accent">{card.seller ?? "—"}</span></Td>
                      <Td>
                        {card.valid ? (
                          <span className="inline-block rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-success">
                            {card.valid}
                          </span>
                        ) : "—"}
                      </Td>
                      <Td>
                        <div className="font-mono text-[12px] font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">{card.bin ?? "—"}</div>
                        {scheme && <div className="mt-1 font-mono text-[10px] font-bold uppercase text-accent">{scheme}</div>}
                      </Td>
                      <Td><span className="font-mono text-[11px] uppercase text-foreground/90">{card.level ?? "—"}</span></Td>
                      <Td><span className="font-mono text-[11px] uppercase text-foreground/90">{card.card_type ?? "—"}</span></Td>
                      <Td><span className="font-mono text-[11px] text-foreground/90">{card.exp ?? "—"}</span></Td>
                      <Td>
                        <div className="space-y-0.5 font-mono text-[11px] text-foreground/90">
                          <Row label="Address" ok />
                          <div>City : {(card.extras?.split("|")[0] ?? "—").trim()}</div>
                          <div>State : {card.state ?? "—"}</div>
                          <div>Zip : {card.zip ?? "—"}</div>
                          <div className="flex items-center gap-1">
                            Country : {card.country_code?.toUpperCase() ?? card.country ?? "—"}
                            <CountryFlag value={card.country_code ?? card.country} width={16} />
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div className="space-y-1 font-mono text-[11px]">
                          <Row label="Email" ok />
                          <Row label="Phone" ok />
                          <Row label="DOB" ok={false} />
                          <Row label="SSN" ok={false} />
                        </div>
                      </Td>
                      <Td>
                        <div className="space-y-1 font-mono text-[11px]">
                          <Row label="IP" ok />
                          <Row label="UA" ok={false} />
                          <Row label="DL" ok={false} />
                          <Row label="MMN" ok={false} />
                        </div>
                      </Td>
                      <Td><span className="font-mono text-[11px] uppercase text-foreground/90">{card.bank ?? "—"}</span></Td>
                      <Td><span className="text-destructive">✕</span></Td>
                      <Td><span className="font-mono text-[12px] font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">${Number(card.price).toFixed(2)}</span></Td>
                      <Td>
                        <Button
                          size="sm"
                          onClick={() => addCard(card)}
                          disabled={inCart}
                          className="rounded-md bg-gradient-to-r from-primary to-accent px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:opacity-90"
                        >
                          {inCart ? "Added" : "AddCart"}
                        </Button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {!loading && availableCards.length > 0 && (
          <div className="glass mt-4 flex flex-col items-center justify-between gap-3 rounded-xl px-4 py-3 sm:flex-row">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Page {page} of {totalPages} · Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, availableCards.length)} of {availableCards.length}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPage(1)} disabled={page === 1}>First</Button>
              <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {idx > 0 && p - arr[idx - 1] > 1 && <span className="font-mono text-xs text-muted-foreground">…</span>}
                    <Button
                      size="sm"
                      variant={p === page ? "default" : "secondary"}
                      onClick={() => setPage(p)}
                      className={p === page ? "glow-primary" : ""}
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</Button>
            </div>
          </div>
        )}
      </section>
    </AppLayout>
  );
};

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border-r border-border/60 px-3 py-3 font-medium last:border-r-0">{children}</th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="border-r border-border/40 px-3 py-3 last:border-r-0">{children}</td>
);

const Row = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center gap-1">
    <span className="text-foreground">{label} :</span>
    <span className={ok ? "text-success" : "text-destructive"}>{ok ? "✓" : "✕"}</span>
  </div>
);

export const Logs = () => (
  <SectionPage title="Logs" tagline="Fresh stealer logs · cookies, autofills, wallet artifacts. Updated daily." Icon={ScrollText} category="logs" />
);

