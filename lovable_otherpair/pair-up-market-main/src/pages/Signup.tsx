import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const sizeSystems: Record<string, string[]> = {
  UK: ["3","4","5","6","7","8","9","10","11","12"],
  US: ["4","5","6","7","8","9","10","11","12","13"],
  EU: ["36","37","38","39","40","41","42","43","44","45","46"],
};

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", location: "",
    sizeSystem: "UK" as "UK" | "US" | "EU",
    leftFootSize: "", rightFootSize: "",
    isAmputee: false,
    amputeeSide: "" as "" | "left" | "right",
    neededFootSize: "",
  });

  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email || !form.password || !form.location) {
        toast.error("Please fill in all fields");
        return;
      }
      setStep(2);
    } else {
      if (form.isAmputee) {
        if (!form.amputeeSide || !form.neededFootSize) {
          toast.error("Please select which foot you need and its size");
          return;
        }
      } else {
        if (!form.leftFootSize || !form.rightFootSize) {
          toast.error("Please select your foot sizes");
          return;
        }
      }
      toast.success("Account created! Welcome to myotherpair 🎉");
      navigate("/home");
    }
  };

  const sizes = sizeSystems[form.sizeSystem];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => step === 1 ? navigate("/") : setStep(1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="font-display text-sm font-bold text-foreground">myotherpair</span>
        <div className="w-14" />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Progress */}
          <div className="flex gap-2 mb-8">
            <div className="flex-1 h-1 rounded-full bg-accent" />
            <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-accent' : 'bg-muted'}`} />
          </div>

          <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 block">
            Step {step} of 2
          </span>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1 leading-tight">
            {step === 1 ? "Create your account" : "About your feet"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {step === 1 ? "Join the community for perfectly matched shoes." : "So we can find your ideal match."}
          </p>

          <form onSubmit={handleNext} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">Full name</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" className="rounded-xl h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" className="rounded-xl h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">Password</Label>
                  <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" className="rounded-xl h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">Location</Label>
                  <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. London, UK" className="rounded-xl h-12" />
                </div>
              </>
            ) : (
              <>
                {/* Size system selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground font-medium">Sizing system</Label>
                  <div className="flex gap-2">
                    {(["UK", "US", "EU"] as const).map((sys) => (
                      <button
                        key={sys}
                        type="button"
                        onClick={() => {
                          setForm((p) => ({ ...p, sizeSystem: sys, leftFootSize: "", rightFootSize: "", neededFootSize: "" }));
                        }}
                        className={`flex-1 h-11 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                          form.sizeSystem === sys
                            ? "bg-accent text-accent-foreground border-accent shadow-sm"
                            : "bg-muted/50 text-muted-foreground border-border/30 hover:border-border"
                        }`}
                      >
                        {sys}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amputee checkbox — moved above foot size fields */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/30">
                  <Checkbox
                    id="amputee"
                    checked={form.isAmputee}
                    onCheckedChange={(v) => {
                      const isAmputee = v === true;
                      setForm((p) => ({
                        ...p,
                        isAmputee,
                        amputeeSide: "",
                        neededFootSize: "",
                        leftFootSize: "",
                        rightFootSize: "",
                      }));
                    }}
                  />
                  <div>
                    <Label htmlFor="amputee" className="text-sm text-foreground cursor-pointer font-medium">
                      I am an amputee
                    </Label>
                    <p className="text-[10px] text-muted-foreground mt-0.5">We'll only ask for the foot you need a shoe for</p>
                  </div>
                </div>

                {form.isAmputee ? (
                  <>
                    {/* Which foot do you need? */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">Which foot do you need a shoe for?</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {(["left", "right"] as const).map((side) => (
                          <button
                            key={side}
                            type="button"
                            onClick={() => update("amputeeSide", side)}
                            className={`h-12 rounded-xl text-sm font-semibold border transition-all duration-200 flex items-center justify-center gap-2 ${
                              form.amputeeSide === side
                                ? "bg-accent text-accent-foreground border-accent shadow-sm"
                                : "bg-muted/50 text-muted-foreground border-border/30 hover:border-border"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${side === "left" ? "bg-left-shoe" : "bg-right-shoe"}`} />
                            {side.charAt(0).toUpperCase() + side.slice(1)} foot
                          </button>
                        ))}
                      </div>
                    </div>

                    {form.amputeeSide && (
                      <div className="space-y-1.5 animate-fade-in">
                        <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${form.amputeeSide === "left" ? "bg-left-shoe" : "bg-right-shoe"}`} />
                          {form.amputeeSide.charAt(0).toUpperCase() + form.amputeeSide.slice(1)} foot size ({form.sizeSystem})
                        </Label>
                        <Select value={form.neededFootSize} onValueChange={(v) => update("neededFootSize", v)}>
                          <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Size" /></SelectTrigger>
                          <SelectContent>
                            {sizes.map((s) => <SelectItem key={s} value={s}>{form.sizeSystem} {s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-left-shoe" />
                          Left foot size ({form.sizeSystem})
                        </Label>
                        <Select value={form.leftFootSize} onValueChange={(v) => update("leftFootSize", v)}>
                          <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Size" /></SelectTrigger>
                          <SelectContent>
                            {sizes.map((s) => <SelectItem key={s} value={s}>{form.sizeSystem} {s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-right-shoe" />
                          Right foot size ({form.sizeSystem})
                        </Label>
                        <Select value={form.rightFootSize} onValueChange={(v) => update("rightFootSize", v)}>
                          <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Size" /></SelectTrigger>
                          <SelectContent>
                            {sizes.map((s) => <SelectItem key={s} value={s}>{form.sizeSystem} {s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {form.leftFootSize && form.rightFootSize && form.leftFootSize !== form.rightFootSize && (
                      <div className="p-4 rounded-xl bg-match-green/8 border border-match-green/20 animate-fade-in">
                        <p className="text-xs font-semibold text-match-green flex items-center gap-2">
                          <span>✨</span> Great — myotherpair is built for you!
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">We'll help you find single shoes that match each foot perfectly.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl h-13 text-base shadow-elevated hover:shadow-glow transition-shadow" style={{ height: 52 }}>
              {step === 1 ? (
                <>Continue <ArrowRight className="h-4 w-4 ml-1" /></>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {step === 1 && (
            <p className="text-sm text-muted-foreground text-center mt-8">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-semibold hover:underline">Log in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
