import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";

interface FiltersState {
  size: string;
  side: string;
  condition: string;
  brand: string;
  maxPrice: number;
}

interface FiltersPanelProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  onClose?: () => void;
  brands: string[];
}

const sizes = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const FiltersPanel = ({ filters, onChange, onClose, brands }: FiltersPanelProps) => {
  const update = (key: keyof FiltersState, value: string | number) => {
    onChange({ ...filters, [key]: value });
  };

  const reset = () => {
    onChange({ size: "all", side: "all", condition: "all", brand: "all", maxPrice: 200 });
  };

  return (
    <div className="space-y-4 p-5 gradient-card rounded-xl shadow-card border border-border/40">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Filters</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-muted-foreground gap-1 rounded-full h-7">
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Size</Label>
          <Select value={filters.size} onValueChange={(v) => update("size", v)}>
            <SelectTrigger className="rounded-lg h-9 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sizes</SelectItem>
              {sizes.map((s) => <SelectItem key={s} value={s}>UK {s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Side</Label>
          <Select value={filters.side} onValueChange={(v) => update("side", v)}>
            <SelectTrigger className="rounded-lg h-9 text-xs"><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any side</SelectItem>
              <SelectItem value="Left">Left</SelectItem>
              <SelectItem value="Right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Condition</Label>
          <Select value={filters.condition} onValueChange={(v) => update("condition", v)}>
            <SelectTrigger className="rounded-lg h-9 text-xs"><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Brand</Label>
          <Select value={filters.brand} onValueChange={(v) => update("brand", v)}>
            <SelectTrigger className="rounded-lg h-9 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Max Price</Label>
          <span className="text-sm font-bold text-foreground">£{filters.maxPrice}</span>
        </div>
        <Slider
          value={[filters.maxPrice]}
          onValueChange={([v]) => update("maxPrice", v)}
          min={0}
          max={200}
          step={5}
        />
      </div>
    </div>
  );
};

export default FiltersPanel;
export type { FiltersState };
