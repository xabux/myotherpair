import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Welcome back!");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="font-display text-sm font-bold text-foreground">myotherpair</span>
        <div className="w-14" />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-8">
        <div className="w-full max-w-sm animate-fade-in">
          <span className="text-3xl block mb-4">👋</span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">Log in to your myotherpair account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="rounded-xl h-12" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground font-medium">Password</Label>
                <button type="button" className="text-xs text-accent font-medium hover:underline">Forgot?</button>
              </div>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl h-12" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl h-13 text-base shadow-elevated hover:shadow-glow transition-shadow mt-2" style={{ height: 52 }}>
              Log in
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
