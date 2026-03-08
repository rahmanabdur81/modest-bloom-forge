import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/habeeb-logo.png";

export default function Footer() {
  return (
    <footer className="bg-teal-dark text-teal-dark-foreground">
      <div className="container-page py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          <div className="sm:col-span-2 md:col-span-1">
            <img src={logo} alt="Habeeb's Paradise" className="h-10 sm:h-12 w-auto object-contain mb-4" />
            <p className="text-xs sm:text-sm opacity-70 font-body leading-relaxed">
              Habeeb's Paradise is dedicated to delivering high-quality hijabs and modest fashion for every occasion.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Facebook">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Instagram">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm opacity-70 font-body">
              <li><Link to="/" className="hover:opacity-100 transition-opacity">Home</Link></li>
              <li><Link to="/products" className="hover:opacity-100 transition-opacity">Shop</Link></li>
              <li><span className="cursor-default">About Us</span></li>
              <li><span className="cursor-default">Contact Us</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm opacity-70 font-body">
              <li><Link to="/track-order" className="hover:opacity-100 transition-opacity">Track Order</Link></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms & Conditions</span></li>
              <li><span className="cursor-default">FAQ</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm opacity-70 font-body">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>+91 91 2350 694 0</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="break-all">habeebsparadise@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-teal-dark-foreground/20 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-[10px] sm:text-xs opacity-50 font-body">
          © 2026 Habeeb's Paradise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
