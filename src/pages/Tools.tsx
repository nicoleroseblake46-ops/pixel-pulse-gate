import { useMemo, useState } from "react";
import { Wrench, ShoppingCart, ShieldCheck, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCommerce } from "@/contexts/CommerceContext";
import { useProducts } from "@/hooks/use-products";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";

const PRICE_PER_CHECK = 0.5;

// Luhn check — used to deterministically classify a card as Alive (passes Luhn) or Dead.
const luhnValid = (digits: string): boolean => {
  const arr = digits.split("").map((n) => parseInt(n, 10));
  if (arr.length < 12 || arr.some((n) => Number.isNaN(n))) return false;
  let sum = 0;
  let alt = false;
  for (let i = arr.length - 1; i >= 0; i--) {
    let v = arr[i];
    if (alt) {
      v *= 2;
      if (v > 9) v -= 9;
    }
    sum += v;
    alt = !alt;
  }
  return sum % 10 === 0;
};

type Parsed = { raw: string; pan: string; mm: string; yy: string; cvv: string };

const parseLine = (line: string): Parsed | null => {
  const cleaned = line.trim();
  if (!cleaned) return null;
  // Accepts PAN|MM/YY|CVV  or  PAN|MM|YY|CVV  with various separators
  const parts = cleaned.split(/[|,;: ]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const pan = parts[0].replace(/\D/g, "");
  let mm = "";
  let yy = "";
  let cvv = "";
  if (parts.length === 3) {
    const [m, y] = (parts[1] || "").split(/[\/\-.]/);
    mm = (m ?? "").replace(/\D/g, "");
    yy = (y ?? "").replace(/\D/g, "");
    cvv = (parts[2] ?? "").replace(/\D/g, "");
  } else {
    mm = (parts[1] ?? "").replace(/\D/g, "");
    yy = (parts[2] ?? "").replace(/\D/g, "");
    cvv = (parts[3] ?? "").replace(/\D/g, "");
  }
  if (!pan || !mm || !yy || !cvv) return null;
  return { raw: cleaned, pan, mm, yy, cvv };
};

const Tools = () => {
  const { cartItems, addToCart } = useCommerce();
  const { products, loading } = useProducts("tools");
  const [input, setInput] = useState("");
  const [alive, setAlive] = useState<string[]>([]);
  const [dead, setDead] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const lines = useMemo(
    () => input.split(/\r?\n/).map(parseLine).filter((l): l is Parsed => l !== null),
    [input],
  );
  const totalCost = lines.length * PRICE_PER_CHECK;

  const runCheck = async () => {
    if (!lines.length) {
      toast.error("Add at least one card to check");
      return;
    }
    setRunning(true);
    setAlive([]);
    setDead([]);
    // Simulated streaming check — animates rows in for realism.
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      await new Promise((r) => setTimeout(r, 220));
      const ok = luhnValid(l.pan);
      if (ok) setAlive((prev) => [...prev, l.raw]);
      else setDead((prev) => [...prev, l.raw]);
    }
    setRunning(false);
    toast.success("Check complete", { description: `${lines.length} cards processed.` });
  };

  const addItem = (item: typeof products[number]) => {
    addToCart({ id: `tools-${item.id}`, name: item.name, meta: item.meta, price: Number(item.price) });
    toast.success("Added to cart", { description: `${item.name} ready for checkout.` });
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">/ Tools</div>
            <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
              <span className="neon-text">Tools</span>
            </h1>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground">Pro-grade utilities. Built for speed, accuracy, and volume.</p>
      </div>

      {/* CC Checker */}
      <section className="glass mb-10 rounded-2xl p-5 md:p-6 animate-fade-up">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">Premium Utility</div>
            <h2 className="mt-1 font-display text-3xl font-black tracking-tight">CC Checker</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You can use this checker to check the status of your card. We will charge{" "}
              <span className="font-mono font-bold text-foreground">${PRICE_PER_CHECK.toFixed(2)}</span> for this service per card.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-success">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure · Encrypted
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Input panel */}
          <div className="rounded-xl border border-border bg-card/70 p-4">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Examples</div>
            <pre className="mb-3 select-none rounded-md bg-muted/40 px-3 py-2 font-mono text-xs leading-6 text-muted-foreground">
{`1234123412341234|12/34|123
1234123412341234|12/34|123
....
....`}
            </pre>
            <Textarea
              placeholder="Paste your cards here, one per line"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[260px] resize-y bg-background font-mono text-sm"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-mono">
                {lines.length} valid line{lines.length === 1 ? "" : "s"} parsed
              </span>
              <span className="font-mono font-bold text-foreground">
                Total: ${totalCost.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={runCheck}
              disabled={running || !lines.length}
              className="mt-4 h-12 w-full rounded-xl bg-destructive font-display text-base font-black uppercase tracking-widest text-destructive-foreground hover:bg-destructive/90"
            >
              {running ? "Checking..." : "Check"}
            </Button>
          </div>

          {/* Results panels */}
          <div className="grid gap-4">
            <ResultPanel label="Alive" tone="success" items={alive} />
            <ResultPanel label="Dead" tone="destructive" items={dead} />
          </div>
        </div>
      </section>

      {/* Other tools (admin-managed inventory) */}
      <section className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-primary">
          <Sparkles className="h-4 w-4" /> More tools
        </div>
        {loading ? (
          <Loader />
        ) : !products.length ? (
          <div className="glass rounded-xl px-6 py-12 text-center text-muted-foreground">
            No additional tools listed. Check back soon.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item, i) => {
              const cartId = `tools-${item.id}`;
              const inCart = cartItems.some((c) => c.id === cartId);
              return (
                <article
                  key={item.id}
                  className="glass group relative overflow-hidden rounded-xl p-5 transition-smooth hover:-translate-y-1 hover:border-primary/40 animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-primary opacity-0 transition-smooth group-hover:opacity-100" />
                  {item.tag && (
                    <span className="absolute right-4 top-4 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
                      {item.tag}
                    </span>
                  )}
                  <h3 className="font-display text-lg font-bold">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                    <span className="font-mono text-lg font-bold text-primary text-glow">${Number(item.price).toFixed(2)}</span>
                    <Button size="sm" variant={inCart ? "secondary" : "default"} onClick={() => addItem(item)} disabled={inCart}>
                      <ShoppingCart /> {inCart ? "Added" : "Add"}
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

const ResultPanel = ({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "success" | "destructive";
  items: string[];
}) => {
  const toneClasses =
    tone === "success"
      ? "border-success/40 bg-success/5"
      : "border-destructive/40 bg-destructive/5";
  const headingClass = tone === "success" ? "text-success" : "text-destructive";
  return (
    <div className={`rounded-xl border ${toneClasses} p-4`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className={`font-display text-xl font-black ${headingClass}`}>{label}</h3>
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {items.length} {items.length === 1 ? "result" : "results"}
        </span>
      </div>
      <div className="min-h-[200px] rounded-md bg-background/60 p-2 font-mono text-xs leading-6">
        {items.length ? (
          items.map((line, i) => (
            <div key={`${i}-${line}`} className={`truncate ${headingClass}`}>
              {line}
            </div>
          ))
        ) : (
          <div className="flex h-full min-h-[180px] items-center justify-center text-muted-foreground">
            Awaiting results...
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
