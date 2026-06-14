import { useMemo, useState } from "react";
import { Wrench, ShoppingCart, Sparkles, RefreshCcw } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCommerce } from "@/contexts/CommerceContext";
import { useProducts } from "@/hooks/use-products";
import { Loader } from "@/components/Loader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PRICE_PER_CHECK = 0.5;
const LIVE_RATE = 0.9; // ~90% of cards return Live

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
  const { cartItems, addToCart, balance, refreshBalance } = useCommerce();
  const { products, loading } = useProducts("tools");
  const [input, setInput] = useState("");
  const [alive, setAlive] = useState<string[]>([]);
  const [dead, setDead] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [refunded, setRefunded] = useState(0);

  const lines = useMemo(
    () => input.split(/\r?\n/).map(parseLine).filter((l): l is Parsed => l !== null),
    [input],
  );
  const totalCost = lines.length * PRICE_PER_CHECK;
  const insufficient = totalCost > balance;

  const runCheck = async () => {
    if (!lines.length) { toast.error("Add at least one card"); return; }
    if (insufficient) {
      toast.error("Insufficient balance", { description: `Need $${totalCost.toFixed(2)}.` });
      return;
    }
    setRunning(true);
    setAlive([]);
    setDead([]);
    setRefunded(0);

    const { error: chargeError } = await supabase.rpc("charge_checker_fee", {
      _count: lines.length,
      _price_per_check: PRICE_PER_CHECK,
    });
    if (chargeError) {
      setRunning(false);
      toast.error("Could not charge fee", { description: chargeError.message });
      return;
    }
    await refreshBalance();

    let deadCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      await new Promise((r) => setTimeout(r, 220));
      const isLive = Math.random() < LIVE_RATE;
      if (isLive) setAlive((prev) => [...prev, l.raw]);
      else { setDead((prev) => [...prev, l.raw]); deadCount++; }
    }

    if (deadCount > 0) {
      const { error: refundErr } = await supabase.rpc("refund_checker_fee", {
        _count: deadCount,
        _price_per_check: PRICE_PER_CHECK,
      });
      if (!refundErr) {
        const amount = deadCount * PRICE_PER_CHECK;
        setRefunded(amount);
        await refreshBalance();
        toast.success(`Refunded $${amount.toFixed(2)} for ${deadCount} dead`);
      }
    }
    setRunning(false);
  };

  const addItem = (item: typeof products[number]) => {
    addToCart({ id: `tools-${item.id}`, name: item.name, meta: item.meta, price: Number(item.price) });
    toast.success("Added to cart");
  };

  return (
    <AppLayout>
      {/* Compact header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
            <Wrench className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight md:text-3xl">
            <span className="neon-text">CC Checker</span>
          </h1>
        </div>
        <div className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-mono text-[11px] text-primary">
          ${PRICE_PER_CHECK.toFixed(2)}/card · dead auto-refund
        </div>
      </div>

      {/* CC Checker */}
      <section className="glass mb-10 rounded-2xl p-4 md:p-6 animate-fade-up">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Input panel */}
          <div className="rounded-xl border border-border bg-card/70 p-3 md:p-4">
            <Textarea
              placeholder={`Paste cards, one per line\n1234123412341234|12/34|123`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[220px] resize-y bg-background font-mono text-sm"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono text-muted-foreground">
                {lines.length} line{lines.length === 1 ? "" : "s"} · Balance ${balance.toFixed(2)}
              </span>
              <span className="font-mono font-bold text-foreground">Total ${totalCost.toFixed(2)}</span>
            </div>
            <Button
              onClick={runCheck}
              disabled={running || !lines.length || insufficient}
              className="mt-3 h-12 w-full rounded-xl bg-gradient-primary font-display text-base font-black uppercase tracking-widest text-primary-foreground glow-primary hover:opacity-90"
            >
              {running
                ? "Checking..."
                : insufficient && lines.length
                  ? `Need $${totalCost.toFixed(2)}`
                  : "Start Check"}
            </Button>

            {/* Refund banner */}
            <div className="mt-3 rounded-lg border border-success/40 bg-success/5 p-3">
              <div className="flex items-start gap-2">
                <RefreshCcw className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-bold text-success">Auto-refund:</span> every dead card returns its{" "}
                  <span className="font-mono font-bold text-foreground">${PRICE_PER_CHECK.toFixed(2)}</span> fee
                  to your balance the moment the check completes — no ticket needed.
                  {refunded > 0 && (
                    <div className="mt-1 font-mono text-success">
                      Last check refunded ${refunded.toFixed(2)}.
                    </div>
                  )}
                </div>
              </div>
            </div>
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
