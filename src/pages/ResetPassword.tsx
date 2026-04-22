import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Zap } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleBackground } from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const passwordSchema = z.string().min(6, "Min 6 characters").max(72);

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setLoading(false);

    if (error) {
      toast.error("Password reset failed", { description: error.message });
    } else {
      toast.success("Password updated", { description: "Sign in with your new password." });
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <ParticleBackground />
      <div className="grid-bg absolute inset-0 opacity-30" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary animate-pulse-glow">
            <Zap className="h-8 w-8 text-background" strokeWidth={3} />
          </div>
          <h1 className="font-display text-4xl font-black tracking-[0.2em] neon-text">RESET ACCESS</h1>
          <p className="mt-2 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Create a new secure password</p>
        </div>

        <div className="glass-strong relative overflow-hidden rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-primary" />
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="border-border bg-input/50 pl-10 font-mono"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="h-12 w-full bg-gradient-primary font-display font-bold uppercase tracking-widest text-background glow-primary">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;