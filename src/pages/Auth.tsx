import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Zap, Mail, Lock, User as UserIcon } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
  username: z.string().trim().min(2).max(32).optional(),
});

const emailSchema = z.string().trim().email("Invalid email").max(255);

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, username: mode === "signup" ? username : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { username } },
        });
        if (error) throw error;
        toast.success("Welcome to NEXUS — you're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Access granted.");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your email first");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error("Reset failed", { description: error.message });
    } else {
      toast.success("Reset link sent", { description: "Check your email to create a new password." });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <ParticleBackground />
      <div className="grid-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-primary animate-pulse-glow flex items-center justify-center">
              <Zap className="h-8 w-8 text-background" strokeWidth={3} />
            </div>
          </div>
          <h1 className="font-display text-4xl font-black tracking-[0.2em] neon-text">NEXUS</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Premium Marketplace · Crypto Only
          </p>
        </div>

        <div className="glass-strong relative overflow-hidden rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
          {/* Top neon line */}
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-primary" />

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg bg-secondary/50 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md py-2 font-display text-sm font-bold tracking-wider uppercase transition-smooth ${
                  mode === m ? "bg-gradient-primary text-background glow-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2 animate-fade-up">
                <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="player_one"
                    className="border-border bg-input/50 pl-10 font-mono"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nexus.io"
                  className="border-border bg-input/50 pl-10 font-mono"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={sendPasswordReset}
                    disabled={loading}
                    className="font-mono text-[10px] uppercase tracking-widest text-primary transition-smooth hover:text-accent disabled:opacity-50"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-border bg-input/50 pl-10 font-mono"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden bg-gradient-primary font-display font-bold tracking-widest uppercase text-background hover:opacity-90 glow-primary h-12"
            >
              {loading ? "Connecting..." : mode === "login" ? "Enter Nexus" : "Create Access"}
            </Button>
          </form>

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Encrypted · Anonymous · Crypto Native
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
