import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Tag, CreditCard, Network, Wrench, Wallet, User, LogOut, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommerce } from "@/contexts/CommerceContext";
import { useAdmin } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, accent: "primary" },
  { title: "Sales", url: "/sales", icon: Tag, accent: "accent" },
  { title: "Cards", url: "/cards", icon: CreditCard, accent: "primary" },
  { title: "Socks", url: "/socks", icon: Zap, accent: "accent" },
  { title: "Proxy", url: "/proxy", icon: Network, accent: "primary" },
  { title: "Tools", url: "/tools", icon: Wrench, accent: "accent" },
];

export const AppSidebar = () => {
  const { signOut, user } = useAuth();
  const { balance, cartItems } = useCommerce();
  const { isAdmin } = useAdmin();
  const loc = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl md:flex">
      {/* Logo */}
      <div className="relative flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="relative">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary animate-pulse-glow flex items-center justify-center">
            <span className="font-display text-xl font-black text-background">N</span>
          </div>
        </div>
        <div>
          <div className="font-display text-xl font-black tracking-widest neon-text">NEXUS</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">v2.4.1</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <div className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Navigation</div>
        {items.map((item) => {
          const active = loc.pathname === item.url;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-smooth",
                "hover:bg-sidebar-accent hover:translate-x-1",
                active && "bg-sidebar-accent text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-primary glow-primary" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-smooth",
                  active ? "text-primary text-glow" : "text-muted-foreground group-hover:text-accent"
                )}
              />
              <span className={cn("text-sm tracking-wide", active && "text-glow")}>{item.title}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />}
            </NavLink>
          );
        })}

        <div className="mt-6 mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Account</div>
        <NavLink
          to="/payments"
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-smooth hover:bg-sidebar-accent hover:translate-x-1",
              isActive && "bg-sidebar-accent text-foreground"
            )
          }
        >
          <Wallet className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-smooth" />
          <span className="text-sm tracking-wide">Payments</span>
          {!!cartItems.length && <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">{cartItems.length}</span>}
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-smooth hover:bg-sidebar-accent hover:translate-x-1",
              isActive && "bg-sidebar-accent text-foreground"
            )
          }
        >
          <User className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-smooth" />
          <span className="text-sm tracking-wide">Profile</span>
        </NavLink>
        {isAdmin && (
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
            <span className="text-sm tracking-wide">Admin</span>
          </NavLink>
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
          <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground/70">{user?.email}</div>
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
