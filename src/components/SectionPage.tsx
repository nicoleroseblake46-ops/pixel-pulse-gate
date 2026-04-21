import { AppLayout } from "@/components/AppLayout";
import { ArrowUpRight, LucideIcon } from "lucide-react";

interface Props {
  title: string;
  tagline: string;
  Icon: LucideIcon;
  items: { name: string; meta: string; price: string; tag?: string }[];
}

export const SectionPage = ({ title, tagline, Icon, items }: Props) => (
  <AppLayout>
    <div className="mb-8 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
          <Icon className="h-6 w-6 text-background" />
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

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <article
          key={item.name}
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
            <span className="font-mono text-lg font-bold text-primary text-glow">{item.price}</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
          </div>
        </article>
      ))}
    </div>
  </AppLayout>
);
