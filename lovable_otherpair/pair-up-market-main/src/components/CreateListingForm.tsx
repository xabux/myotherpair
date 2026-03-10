import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Camera } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CreateListingForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    brand: "", model: "", size: "", side: "", condition: "", price: "", description: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model || !form.size || !form.side || !form.condition || !form.price) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Listing created successfully! 🎉");
    navigate("/browse");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo upload */}
      <div className="aspect-[16/10] rounded-2xl border-2 border-dashed border-accent/25 bg-accent/[0.03] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/[0.06] hover:border-accent/40 transition-all duration-300 group">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform">
          <ImagePlus className="h-6 w-6 text-accent" />
        </div>
        <p className="text-sm font-semibold text-accent">Add photos</p>
        <p className="text-xs text-muted-foreground">Tap to upload shoe images</p>
      </div>

      {/* Brand & Model */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Brand *</Label>
          <Input value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="e.g. Nike" className="rounded-xl h-11" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Model *</Label>
          <Input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder="e.g. Air Force 1" className="rounded-xl h-11" />
        </div>
      </div>

      {/* Size, Side, Condition */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Size *</Label>
          <Select value={form.size} onValueChange={(v) => update("size", v)}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Size" /></SelectTrigger>
            <SelectContent>
              {["3","4","5","6","7","8","9","10","11","12"].map((s) => (
                <SelectItem key={s} value={s}>UK {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Side *</Label>
          <Select value={form.side} onValueChange={(v) => update("side", v)}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Side" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Left">Left</SelectItem>
              <SelectItem value="Right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Condition *</Label>
          <Select value={form.condition} onValueChange={(v) => update("condition", v)}>
            <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Cond." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-medium">Price (£) *</Label>
        <Input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0" className="rounded-xl h-11 text-lg font-bold" />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-medium">Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe your shoe — condition, colour, any defects..."
          rows={3}
          className="rounded-xl resize-none"
        />
      </div>

      <Button type="submit" className="w-full rounded-xl text-base shadow-elevated hover:shadow-glow transition-shadow" variant="hero" style={{ height: 52 }}>
        List Shoe
      </Button>
    </form>
  );
};

export default CreateListingForm;
