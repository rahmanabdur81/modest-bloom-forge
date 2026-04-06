import { Phone, Mail } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = () => setSearchOpen((prev) => !prev);
    window.addEventListener("toggle-search", handler);
    return () => window.removeEventListener("toggle-search", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        {/* Contact strip */}
        <div className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between px-4 py-1.5 text-[10px] sm:text-xs font-body">
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="tel:+919123506940" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <Phone className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">+91 91 2350 694 0</span>
                <span className="sm:hidden">Call Us</span>
              </a>
              <a href="mailto:habeebsparadise@gmail.com" className="hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Mail className="h-3 w-3" />
                <span>habeebsparadise@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Facebook">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Instagram">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Twitter">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Trigger bar */}
        <div className="flex items-center h-12 px-3 gap-2">
          <SidebarTrigger className="h-9 w-9" />
          <span className="text-sm font-body text-muted-foreground">Menu</span>
        </div>
      </header>

      {searchOpen && <SearchWithSuggestions onClose={() => setSearchOpen(false)} />}
    </>
  );
}
