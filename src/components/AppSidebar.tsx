import { NavLink, useLocation } from "react-router-dom";
import { Newspaper, Tag, CreditCard, Network, Wrench, Wallet, User, LogOut, ShoppingBag, ShieldCheck, FilePenLine, MessageSquareText, MonitorSmartphone, Package, ScrollText, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommerce } from "@/contexts/CommerceContext";
import { useAdmin } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";

const items = [
  { title: "News", url: "/", icon: Newspaper, accent: "primary" },
  { title: "Sales", url: "/sales", icon: Tag, accent: "accent" },
  { title: "Cards", url: "/cards", icon: CreditCard, accent: "primary" },
  { title: "Proxy", url: "/proxy", icon: Network, accent: "primary" },
  { title: "Tools", url: "/tools", icon: Wrench, accent: "accent" },
  { title: "RDP", url: "/rdp", icon: MonitorSmartphone, accent: "primary" },
  { title: "Logs", url: "/logs", icon: ScrollText, accent: "accent" },
  { title: "My Orders", url: "/orders", icon: ShoppingBag, accent: "primary" },
  { title: "Tickets", url: "/tickets", icon: MessageSquareText, accent: "accent" },
];

export const AppSidebar = () => {
  const { signOut, user } = useAuth();
  const { balance, cartItems } = useCommerce();
  const { isAdmin } = useAdmin();
  const loc = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar shadow-[var(--shadow-elevated)] md:flex">
      {/* Logo */}
      <div className="relative flex h-28 flex-col items-center justify-center gap-2 bg-gradient-primary px-6 text-primary-foreground">
        <div className="relative">
          <div className="flex h-12 w-16 items-center justify-center rounded-t-full rounded-bl-xl rounded-br-sm bg-primary-foreground shadow-sm">
            <span className="font-display text-2xl font-black text-primary">N</span>
          </div>
        </div>
        <div className="font-display text-xl font-black uppercase tracking-normal">NEXUS</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <div className="mb-3 px-3 font-mono text-[10px] uppercase tracking-normal text-muted-foreground">Navigation</div>
        {items.map((item) => {
          const active = loc.pathname === item.url;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-3 font-semibold transition-smooth",
                "hover:bg-sidebar-accent hover:text-primary",
                active && "bg-primary text-primary-foreground shadow-[var(--glow-primary)]"
              )}
            >
              {active && (
                <span className="absolute -left-1 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-smooth",
                  active ? "text-primary-foreground" : "text-foreground group-hover:text-primary"
                )}
              />
              <span className="text-base tracking-normal">{item.title}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
            </NavLink>
          );
        })}

        <div className="mt-6 mb-3 px-3 font-mono text-[10px] uppercase tracking-normal text-muted-foreground">Account</div>
        <NavLink
          to="/payments"
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-lg px-3 py-3 font-semibold transition-smooth hover:bg-sidebar-accent hover:text-primary",
              isActive && "bg-primary text-primary-foreground shadow-[var(--glow-primary)]"
            )
          }
        >
          <Wallet className="h-5 w-5 transition-smooth" />
          <span className="text-base tracking-normal">Payments</span>
          {!!cartItems.length && <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">{cartItems.length}</span>}
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-lg px-3 py-3 font-semibold transition-smooth hover:bg-sidebar-accent hover:text-primary",
              isActive && "bg-primary text-primary-foreground shadow-[var(--glow-primary)]"
            )
          }
        >
          <User className="h-5 w-5 transition-smooth" />
          <span className="text-base tracking-normal">Profile</span>
        </NavLink>
        {isAdmin && (
          <>
            <NavLink
              to="/admin/news"
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-smooth hover:bg-sidebar-accent hover:translate-x-1",
                  isActive && "bg-sidebar-accent text-foreground"
                )
              }
            >
              <FilePenLine className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-smooth" />
              <span className="text-sm tracking-wide">News Admin</span>
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-smooth hover:bg-sidebar-accent hover:translate-x-1",
                  isActive && "bg-sidebar-accent text-foreground"
                )
              }
            >
              <Package className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-smooth" />
              <span className="text-sm tracking-wide">Inventory Admin</span>
            </NavLink>
            <NavLink
              to="/admin/payments"
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-smooth hover:bg-sidebar-accent hover:translate-x-1",
                  isActive && "bg-sidebar-accent text-foreground"
                )
              }
            >
              <ShieldCheck className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-smooth" />
              <span className="text-sm tracking-wide">Payments Admin</span>
            </NavLink>
            <NavLink
              to="/admin/tickets"
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-smooth hover:bg-sidebar-accent hover:translate-x-1",
                  isActive && "bg-sidebar-accent text-foreground"
                )
              }
            >
              <MessageSquareText className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-smooth" />
              <span className="text-sm tracking-wide">Tickets Admin</span>
            </NavLink>
            <NavLink
              to="/admin/visitors"
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-smooth hover:bg-sidebar-accent hover:translate-x-1",
                  isActive && "bg-sidebar-accent text-foreground"
                )
              }
            >
              <Globe className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-smooth" />
              <span className="text-sm tracking-wide">Visitor IPs</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="glass mb-3 rounded-lg p-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Balance</div>
          <div className="mt-1 font-display text-2xl font-black text-primary text-glow">${balance.toFixed(2)}</div>
        </div>
        <div className="glass mb-3 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
            <div className="font-mono text-xs text-muted-foreground">SYSTEM ONLINE</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 transition-smooth group-hover:-translate-x-1" />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
};
