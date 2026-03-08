import { Share2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareProductProps {
  productName: string;
  price: number;
}

export default function ShareProduct({ productName, price }: ShareProductProps) {
  const url = window.location.href;
  const text = `Check out ${productName} — ₹${price} at Habeeb's Paradise!`;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: productName, text, url });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary gap-1.5 px-0">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={shareWhatsApp} className="gap-2 cursor-pointer">
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="gap-2 cursor-pointer">
          <Copy className="h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareNative} className="gap-2 cursor-pointer">
          <Share2 className="h-4 w-4" />
          More...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
