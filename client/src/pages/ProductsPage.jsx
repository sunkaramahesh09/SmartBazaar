import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import SearchBar from '../components/common/SearchBar';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filterOpen, setFilterOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const featured = searchParams.get('featured') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (featured) params.featured = featured;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const { data } = await api.get('/products', { params });
      setProducts(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [search, category, featured, page, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data || []));
  }, []);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => {
    setMinPrice(''); setMaxPrice('');
    setSearchParams({});
  };

  const hasFilters = search || category || featured || minPrice || maxPrice;

  return (
    <div className="page-container py-8 page-enter">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-7">
        <div>
          <h1 className="section-title">
            {search ? `Results for "${search}"` : featured ? 'Featured Deals' : category ? 'Products' : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{pagination.total} products found</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-72">
            <SearchBar />
          </div>
          <button onClick={() => setFilterOpen(o => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${filterOpen ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'}`}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar Filters ── */}
        <aside className={`${filterOpen ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
          <div className="card p-5 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Filters</h3>
              {hasFilters && (
                <button onClick={clearAll} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <h4 className="font-semibold text-gray-700 text-sm mb-3">Category</h4>
              <div className="space-y-1.5">
                <button onClick={() => setParam('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!category ? 'bg-primary-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  All Categories
                </button>
                {categories.map(c => (
                  <button key={c._id} onClick={() => setParam('category', c._id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${category === c._id ? 'bg-primary-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-700 text-sm mb-3">Price Range</h4>
              <div className="flex gap-2">
                <input type="number" placeholder="Min ₹" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  className="input-field !py-2 !text-sm" />
                <input type="number" placeholder="Max ₹" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="input-field !py-2 !text-sm" />
              </div>
              <button onClick={fetchProducts} className="btn-primary w-full mt-3 !py-2 !text-sm">Apply</button>
            </div>

            {/* Featured Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-5 rounded-full transition-colors relative ${featured ? 'bg-primary' : 'bg-gray-200'}`}
                  onClick={() => setParam('featured', featured ? '' : 'true')}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${featured ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Featured only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-6xl mb-4">🔍</p>
              <p className="text-lg font-semibold text-gray-600">No products found</p>
              <p className="text-sm mt-1">Try different keywords or clear filters</p>
              <button onClick={clearAll} className="btn-primary mt-5">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => setParam('page', i + 1)}
                      className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${page === i + 1 ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
