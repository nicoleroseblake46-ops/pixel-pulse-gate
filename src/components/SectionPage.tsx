import { AppLayout } from "@/components/AppLayout";
import { LucideIcon, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommerce } from "@/contexts/CommerceContext";
import { toast } from "sonner";
import { ProductCategory, useProducts } from "@/hooks/use-products";
import { Loader } from "@/components/Loader";

interface Props {
  title: string;
  tagline: string;
  Icon: LucideIcon;
  category: ProductCategory;
}

export const SectionPage = ({ title, tagline, Icon, category }: Props) => {
  const { cartItems, addToCart } = useCommerce();
  const { products, loading } = useProducts(category);

  const addItem = (item: typeof products[number]) => {
    addToCart({ id: `${category}-${item.id}`, name: item.name, meta: item.meta, price: Number(item.price) });
    toast.success("Added to cart", { description: `${item.name} is ready for balance checkout.` });
  };

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">/ {title}</div>
            <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
              <span className="neon-text">{title}</span>
            </h1>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground">{tagline}</p>
      </div>

      {loading ? (
        <Loader />
      ) : !products.length ? (
        <div className="glass rounded-xl px-6 py-12 text-center text-muted-foreground">
          No items available right now. Check back soon.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((item, i) => {
            const cartId = `${category}-${item.id}`;
            const inCart = cartItems.some((cartItem) => cartItem.id === cartId);
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
    </AppLayout>
  );
};
