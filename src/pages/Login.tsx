import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import loginMascot from "@/assets/login-mascot.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();
        
        if (profile?.role === "teacher") {
          navigate("/teacher/dashboard");
        } else if (profile?.role === "provider") {
          navigate("/provider/dashboard");
        } else if (profile?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/parent/dashboard");
        }
      } else {
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="h-dvh bg-background flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-xs">
        {/* Mascot */}
        <div className="flex justify-center mb-3">
          <img
            src={loginMascot}
            alt="CareConnect mascot"
            width={88}
            height={88}
            className="drop-shadow-md"
          />
        </div>

        {/* Card */}
        <div className="bg-popover rounded-2xl border border-border p-4 shadow-lg">
          <div className="text-center mb-3">
            <h1 className="font-heading text-lg font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-[11px] mt-0.5">Sign in to CareConnect</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-2.5">
            <div>
              <Label htmlFor="email" className="text-[11px]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 rounded-xl text-xs"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <Label htmlFor="password" className="text-[11px]">Password</Label>
                <Link to="/forgot-password" className="text-[11px] text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 rounded-xl text-xs"
              />
            </div>
            <Button type="submit" className="w-full h-9 rounded-xl bg-primary text-primary-foreground text-xs" disabled={loading}>
              {loading ? "Signing in..." : <><LogIn className="w-3.5 h-3.5 mr-1.5" /> Sign In</>}
            </Button>
          </form>

          {/* Teacher code link */}
          <div className="mt-2.5 p-2 bg-secondary rounded-xl text-center">
            <p className="text-[11px] text-muted-foreground">
              Have a teacher invite code? <Link to="/enter-code" className="text-primary font-medium hover:underline">Enter it here</Link>
            </p>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-3">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
