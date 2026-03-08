import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-xl font-bold mb-4">MODEST GRACE</h3>
            <p className="text-sm opacity-70 font-body leading-relaxed">
              Premium hijabs & modest fashion. Curated collections for the modern modest woman.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm opacity-70 font-body">
              <li><Link to="/products?category=new-arrivals" className="hover:opacity-100 transition-opacity">New Arrivals</Link></li>
              <li><Link to="/products?category=hijabs" className="hover:opacity-100 transition-opacity">Hijabs</Link></li>
              <li><Link to="/products?category=khimars" className="hover:opacity-100 transition-opacity">Khimars</Link></li>
              <li><Link to="/products?category=accessories" className="hover:opacity-100 transition-opacity">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm opacity-70 font-body">
              <li><Link to="/track-order" className="hover:opacity-100 transition-opacity">Track Order</Link></li>
              <li><span className="cursor-default">Shipping Policy</span></li>
              <li><span className="cursor-default">Returns & Exchange</span></li>
              <li><span className="cursor-default">Contact Us</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-body font-semibold mb-4">Newsletter</h4>
            <p className="text-sm opacity-70 font-body mb-4">Join for exclusive offers & new collection updates.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-2 text-sm font-body text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none"
              />
              <button className="bg-gold text-gold-foreground px-4 py-2 text-xs uppercase tracking-wider font-body font-semibold hover:bg-gold/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-xs opacity-50 font-body">
          © 2026 Modest Grace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
