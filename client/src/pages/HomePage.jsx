import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Truck, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';

const HERO_CATEGORIES = [
  { emoji: '🥦', name: 'Vegetables' },
  { emoji: '🍎', name: 'Fruits' },
  { emoji: '🥛', name: 'Dairy' },
  { emoji: '🌾', name: 'Grains' },
  { emoji: '🧴', name: 'Personal Care' },
  { emoji: '🍪', name: 'Snacks' },
];

const HIGHLIGHTS = [
  { icon: ShieldCheck, title: 'Fresh Quality', desc: 'Handpicked fresh produce daily', color: 'text-green-500' },
  { icon: Clock, title: 'Ready Quick', desc: 'Orders ready within 30 minutes', color: 'text-blue-500' },
  { icon: Truck, title: 'Store Pickup', desc: 'Convenient pickup at any store', color: 'text-primary' },
  { icon: Star, title: 'Best Prices', desc: 'Guaranteed lowest prices', color: 'text-yellow-500' },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?featured=true&limit=8')
        ]);
        setCategories(catRes.data.data || []);
        setFeatured(prodRes.data.data || []);
      } catch { /* fail silently on home */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="page-enter">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#5C0B0D] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="page-container relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow" />
              Fresh stock updated daily
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
              Your Daily<br />
              <span className="text-yellow-300">Grocery</span> Store
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              Shop fresh groceries online and pick up from your nearest Smart Bazaar store. No delivery charges, no waiting.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/products')}
                className="flex items-center gap-2 bg-white text-primary font-bold px-7 py-3.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-lg">
                Shop Now <ArrowRight size={18} />
              </button>
              <button onClick={() => navigate('/products?featured=true')}
                className="flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 active:scale-95 transition-all">
                Featured Deals
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
          <div className="page-container py-4 flex gap-3 overflow-x-auto scrollbar-hide">
            {HERO_CATEGORIES.map(c => (
              <button key={c.name}
                onClick={() => navigate(`/products?search=${c.name}`)}
                className="flex items-center gap-2 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-full transition-all">
                <span>{c.emoji}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="page-container py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="text-gray-500 mt-1">Find exactly what you need</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link key={cat._id} to={`/products?category=${cat._id}`}
                className="card p-4 flex flex-col items-center gap-3 text-center hover:border-primary hover:border-2 border-2 border-transparent transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center overflow-hidden group-hover:bg-primary group-hover:shadow-glow-primary transition-all duration-300">
                  {cat.image
                    ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                    : <span className="text-2xl">🛒</span>}
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {[['🥦', 'Vegetables'], ['🍎', 'Fruits'], ['🥛', 'Dairy'], ['🌾', 'Grains'], ['🍪', 'Snacks'], ['🧴', 'Care']].map(([e, n]) => (
              <Link key={n} to={`/products?search=${n}`}
                className="card p-4 flex flex-col items-center gap-3 text-center hover:border-primary border-2 border-transparent transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl group-hover:bg-primary group-hover:shadow-glow-primary transition-all duration-300">{e}</div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-primary transition-colors">{n}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-gray-50 py-14">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="text-gray-500 mt-1">Hand-picked deals just for you</p>
            </div>
            <Link to="/products?featured=true" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
              See All <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-3">🛒</p>
              <p className="font-medium">Products coming soon!</p>
              <p className="text-sm mt-1">Check back later for great deals</p>
            </div>
          )}
        </div>
      </section>

      {/* ── STORE HIGHLIGHTS ── */}
      <section className="page-container py-14">
        <h2 className="section-title text-center mb-10">Why Smart Bazaar?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-6 text-center group hover:border-primary border-2 border-transparent transition-all">
              <div className={`w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={26} className={color} />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-4 md:mx-auto max-w-7xl mb-14">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-10 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-3 relative">Ready to start shopping?</h2>
          <p className="text-white/80 mb-6 relative">Browse thousands of fresh products and pick up at your nearest store.</p>
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-lg">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
