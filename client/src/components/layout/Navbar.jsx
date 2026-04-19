import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Shield, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import SearchBar from '../common/SearchBar';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg leading-none">SB</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Smart <span className="text-primary">Bazaar</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${location.pathname === l.to
                    ? 'text-primary bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ShoppingCart size={22} className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-once">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{user.name[0].toUpperCase()}</span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-2 z-50 animate-fade-in">
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <Package size={16} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary font-medium hover:bg-primary-50">
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary !px-4 !py-2 !text-sm hidden md:flex items-center gap-2">
                <User size={16} /> Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-xl hover:bg-gray-100">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slide-up">
            <SearchBar />
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-100">{l.label}</Link>
            ))}
            {!user && (
              <Link to="/login" className="block btn-primary text-center">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
