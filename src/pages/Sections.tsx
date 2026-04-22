import { useMemo, useState } from "react";
import { Tag, CreditCard, Zap, Network, Wrench, Search, ShoppingCart, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SectionPage } from "@/components/SectionPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const cardInventory = [
  { bin: "453275", country: "USA", state: "CA", brand: "Visa", type: "Credit", bank: "Chase", info: "Classic · $300+ balance · verified", price: 45 },
  { bin: "542418", country: "Germany", state: "BE", brand: "Mastercard", type: "Debit", bank: "N26", info: "Gold · EU billing · instant check", price: 68 },
  { bin: "371449", country: "USA", state: "NY", brand: "Amex", type: "Credit", bank: "American Express", info: "Platinum · high limit · premium", price: 96 },
  { bin: "601100", country: "Canada", state: "ON", brand: "Discover", type: "Credit", bank: "TD Bank", info: "Fresh drop · low decline rate", price: 34 },
  { bin: "516875", country: "France", state: "IDF", brand: "Mastercard", type: "Prepaid", bank: "BNP Paribas", info: "Prepaid · clean history · EU", price: 52 },
  { bin: "455673", country: "UK", state: "ENG", brand: "Visa", type: "Debit", bank: "Barclays", info: "Verified debit · fast refund window", price: 29 },
  { bin: "414720", country: "USA", state: "TX", brand: "Visa", type: "Credit", bank: "Wells Fargo", info: "Signature · $800+ balance · checked", price: 74 },
  { bin: "557347", country: "Spain", state: "MD", brand: "Mastercard", type: "Credit", bank: "Santander", info: "Premium EU · 3DS ready · stable", price: 88 },
];

const emptyFilters = {
  bin: "",
  country: "",
  state: "",
  brand: "",
  type: "",
  bank: "",
};

export const Sales = () => (
  <SectionPage
    title="Sales"
    tagline="Limited-time deals refreshed every hour. Lock in before they vanish."
    Icon={Tag}
    items={[
      { name: "Mega Bundle Q1", meta: "All categories · 30 day access", price: "$149", tag: "-40%" },
      { name: "Proxy + Tools Combo", meta: "Save when bought together", price: "$79", tag: "HOT" },
      { name: "Black Card Pack ×10", meta: "High balance · verified", price: "$220" },
      { name: "Socks Premium ×500", meta: "Residential · 47 countries", price: "$45", tag: "FRESH" },
      { name: "Annual Toolkit", meta: "All tools, one license", price: "$390" },
      { name: "Starter Pack", meta: "Perfect for new agents", price: "$25" },
    ]}
  />
);

export const Cards = () => {
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [appliedPriceRange, setAppliedPriceRange] = useState([0, 100]);
  const [cartBins, setCartBins] = useState<string[]>([]);

  const availableCards = useMemo(
    () =>
      cardInventory.filter((card) => {
        const matchesText =
          card.bin.includes(filters.bin.trim()) &&
          card.country.toLowerCase().includes(filters.country.trim().toLowerCase()) &&
          card.state.toLowerCase().includes(filters.state.trim().toLowerCase()) &&
          card.brand.toLowerCase().includes(filters.brand.trim().toLowerCase()) &&
          card.type.toLowerCase().includes(filters.type.trim().toLowerCase()) &&
          card.bank.toLowerCase().includes(filters.bank.trim().toLowerCase());

        return matchesText && card.price >= appliedPriceRange[0] && card.price <= appliedPriceRange[1];
      }),
    [appliedPriceRange, filters],
  );

  const updateFilter = (key: keyof typeof emptyFilters, value: string) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const runSearch = () => {
    setFilters(draftFilters);
    setAppliedPriceRange(priceRange);
  };

  const addCard = (bin: string) => {
    setCartBins((current) => (current.includes(bin) ? current : [...current, bin]));
  };

  const addAll = () => {
    setCartBins((current) => Array.from(new Set([...current, ...availableCards.map((card) => card.bin)])));
  };

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
              <CreditCard className="h-6 w-6 text-background" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">/ Cards</div>
              <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
                <span className="neon-text">Cards</span>
              </h1>
            </div>
          </div>
          <div className="glass flex items-center gap-2 rounded-xl px-4 py-3 font-mono text-sm text-primary">
            <ShoppingCart className="h-4 w-4" />
            {cartBins.length} IN CART
          </div>
        </div>
        <p className="mt-3 text-muted-foreground">Filter verified card inventory and add matches to your cart.</p>
      </div>

      <section className="glass mb-6 rounded-xl p-4 animate-fade-up md:p-5">
        <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-primary">Top Filters</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Input placeholder="BINs" value={draftFilters.bin} onChange={(event) => updateFilter("bin", event.target.value)} />
          <Input placeholder="Country" value={draftFilters.country} onChange={(event) => updateFilter("country", event.target.value)} />
          <Input placeholder="State" value={draftFilters.state} onChange={(event) => updateFilter("state", event.target.value)} />
          <Input placeholder="Brand" value={draftFilters.brand} onChange={(event) => updateFilter("brand", event.target.value)} />
          <Input placeholder="Card Type" value={draftFilters.type} onChange={(event) => updateFilter("type", event.target.value)} />
          <Input placeholder="Bank" value={draftFilters.bank} onChange={(event) => updateFilter("bank", event.target.value)} />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <div>
            <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span>Price Range</span>
              <span className="text-primary">${priceRange[0]} - ${priceRange[1]}</span>
            </div>
            <Slider min={0} max={100} step={1} value={priceRange} onValueChange={setPriceRange} />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>$0</span>
              <span>$100</span>
            </div>
          </div>
          <Button onClick={runSearch} className="glow-primary">
            <Search />
            Search
          </Button>
          <Button variant="secondary" onClick={addAll} disabled={!availableCards.length}>
            <ShoppingCart />
            Add All
          </Button>
        </div>
      </section>

      <section className="glass rounded-xl p-4 animate-fade-up md:p-5" style={{ animationDelay: "80ms" }}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Available Cards</div>
          <div className="font-mono text-xs text-muted-foreground">{availableCards.length} MATCHES</div>
        </div>
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
              const inCart = cartBins.includes(card.bin);

              return (
                <TableRow key={card.bin}>
                  <TableCell className="font-mono text-primary">{card.bin}</TableCell>
                  <TableCell>{card.country}</TableCell>
                  <TableCell className="min-w-[240px]">
                    <div className="font-medium">{card.brand} {card.type} · {card.bank}</div>
                    <div className="text-xs text-muted-foreground">{card.state} · {card.info}</div>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-primary">${card.price}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant={inCart ? "secondary" : "default"} onClick={() => addCard(card.bin)} disabled={inCart}>
                      <Plus />
                      {inCart ? "Added" : "Add"}
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
      </section>
    </AppLayout>
  );
};

export const Socks = () => (
  <SectionPage
    title="Socks"
    tagline="Fresh residential SOCKS5 from a 3.5K+ pool, refreshed daily."
    Icon={Zap}
    items={[
      { name: "USA Pool · 100", meta: "99.9% uptime", price: "$12" },
      { name: "EU Pool · 250", meta: "Multi-country", price: "$28", tag: "POPULAR" },
      { name: "Global ×500", meta: "47 countries", price: "$45", tag: "BEST VALUE" },
      { name: "Premium ×1000", meta: "Static IPs · 30 day", price: "$120" },
      { name: "Asia Pack ×150", meta: "JP · KR · SG", price: "$22" },
      { name: "Mobile 4G ×50", meta: "True mobile carrier IPs", price: "$60", tag: "NEW" },
    ]}
  />
);

export const Proxy = () => (
  <SectionPage
    title="Proxy"
    tagline="Datacenter, residential, mobile — choose your battlefield."
    Icon={Network}
    items={[
      { name: "DC Proxy ×100", meta: "Datacenter · 1Gbps", price: "$18" },
      { name: "Residential 5GB", meta: "Pay-as-you-go", price: "$40", tag: "FAST" },
      { name: "Mobile 4G Plan", meta: "Unlimited rotation", price: "$95" },
      { name: "Sneaker Pack", meta: "Optimised for drops", price: "$70", tag: "DROP" },
      { name: "Streaming Pack", meta: "Geo-unblock 30+ regions", price: "$25" },
      { name: "ISP Premium ×50", meta: "Static · ultra clean", price: "$110" },
    ]}
  />
);

export const Tools = () => (
  <SectionPage
    title="Tools"
    tagline="GPU-accelerated checkers, scrapers and automation kits."
    Icon={Wrench}
    items={[
      { name: "Checker v6", meta: "5x faster · multi-threaded", price: "$85", tag: "v6" },
      { name: "Scraper Suite", meta: "Headless · undetectable", price: "$120" },
      { name: "Account Generator", meta: "20+ services supported", price: "$55" },
      { name: "BIN Database Pro", meta: "Updated weekly", price: "$30" },
      { name: "Bot Framework", meta: "Custom flows · Python", price: "$200", tag: "PRO" },
      { name: "Captcha Solver Key", meta: "10K solves included", price: "$40" },
    ]}
  />
);
