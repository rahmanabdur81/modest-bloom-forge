import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";

const sizeData = [
  { style: "Standard Hijab", length: "175 cm", width: "70 cm", bestFor: "Everyday wear, simple wraps" },
  { style: "Large / Maxi", length: "200 cm", width: "85 cm", bestFor: "Full coverage, layered styles" },
  { style: "Square Scarf", length: "110 cm", width: "110 cm", bestFor: "Turkish style, neat draping" },
  { style: "Khimar", length: "130–150 cm", width: "Full round", bestFor: "One-piece, easy coverage" },
  { style: "Shawl", length: "190 cm", width: "75 cm", bestFor: "Elegant draping, formal looks" },
];

const fabricTips = [
  { fabric: "Chiffon", tip: "Lightweight & flowy — great for layering and formal wear" },
  { fabric: "Jersey", tip: "Stretchy & stays in place — perfect for everyday, no pins needed" },
  { fabric: "Silk Satin", tip: "Luxurious sheen — ideal for special occasions" },
  { fabric: "Cotton", tip: "Breathable & comfortable — best for hot weather" },
  { fabric: "Georgette", tip: "Textured & elegant — holds shape well for styled wraps" },
];

export default function SizeGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1.5 px-0">
          <Ruler className="h-3.5 w-3.5" />
          Size & Fabric Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Hijab Size & Fabric Guide</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Size Chart */}
          <div>
            <h3 className="font-display text-sm font-semibold mb-3">Size Chart</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs font-body">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left px-3 py-2 font-semibold">Style</th>
                    <th className="text-left px-3 py-2 font-semibold">L × W</th>
                    <th className="text-left px-3 py-2 font-semibold">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((row) => (
                    <tr key={row.style} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{row.style}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.length} × {row.width}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fabric Guide */}
          <div>
            <h3 className="font-display text-sm font-semibold mb-3">Fabric Guide</h3>
            <ul className="space-y-2">
              {fabricTips.map((item) => (
                <li key={item.fabric} className="flex gap-2 text-xs font-body">
                  <span className="font-semibold text-foreground min-w-[80px]">{item.fabric}</span>
                  <span className="text-muted-foreground">{item.tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Care Tips */}
          <div>
            <h3 className="font-display text-sm font-semibold mb-3">Care Tips</h3>
            <ul className="space-y-1.5 text-xs font-body text-muted-foreground">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />Hand wash or gentle machine cycle in cold water</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />Air dry — avoid direct sunlight to preserve color</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />Iron on low heat; use a cloth barrier for satin/silk</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />Store folded or hung to avoid creasing</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
