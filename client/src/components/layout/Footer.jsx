import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">V</span>
              </div>
              <span className="font-bold text-xl text-white">Smart <span className="text-primary-light">Bazaar</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your neighbourhood grocery store. Fresh products, great prices, and store pickup made easy.
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[['/', 'Home'], ['/products', 'Shop'], ['/cart', 'Cart'], ['/orders', 'My Orders']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-light transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              {['Fruits & Vegetables', 'Dairy & Eggs', 'Snacks', 'Beverages', 'Household'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`} className="hover:text-primary-light transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-primary-light mt-0.5 flex-shrink-0" />
                <span>123 Bazaar Street, Hyderabad, TS 500001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary-light flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary-light flex-shrink-0" />
                <span>hello@smartbazaar.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Smart Bazaar. All rights reserved.</p>
          <p>Store Pickup Only · No Delivery · Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
