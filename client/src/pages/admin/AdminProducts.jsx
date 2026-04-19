import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Loader, Search } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UNITS = ['piece', 'kg', 'g', 'litre', 'ml', 'dozen', 'pack'];
const EMPTY = { name: '', description: '', price: '', mrp: '', stock: '', threshold: '10', unit: 'piece', brand: '', tags: '', isFeatured: false, category: '', images: [] };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const fileRef = useRef();

  const fetch = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get('/products?limit=100'), api.get('/categories')]);
      setProducts(p.data.data || []);
      setCategories(c.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImageFiles([]); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p, tags: p.tags?.join(', ') || '', category: p.category?._id || p.category || '' });
    setImageFiles([]);
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.price || Number(form.price) <= 0) return toast.error('Valid price is required');
    if (form.stock === '' || form.stock === null) return toast.error('Stock is required');
    if (!form.category) return toast.error('Please select a category first');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'images') return;
        if (k === 'tags') { v.split(',').map(t => t.trim()).filter(Boolean).forEach(t => fd.append('tags', t)); return; }
        fd.append(k, v);
      });
      imageFiles.forEach(f => fd.append('images', f));

      if (editing) {
        await api.put(`/products/${editing._id}`, fd);
        toast.success('Product updated!');
      } else {
        await api.post('/products', fd);
        toast.success('Product created!');
      }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product removed'); fetch();
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div><h1 className="text-2xl font-black text-gray-900">Products</h1><p className="text-gray-500 text-sm mt-0.5">{products.length} total</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={17} /> Add Product</button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          className="input-field pl-10 !py-2.5" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Image','Name','Category','Price','Stock','Featured','Actions'].map(h =>
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="skeleton h-8 rounded-lg" /></td></tr>
              )) : filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🛒</div>}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800 max-w-[160px]"><p className="truncate">{p.name}</p><p className="text-xs text-gray-400 truncate">{p.brand}</p></td>
                  <td className="px-5 py-4 text-gray-500">{p.category?.name}</td>
                  <td className="px-5 py-4 font-bold text-gray-800">₹{p.price}<span className="text-xs text-gray-400 font-normal ml-1">/{p.unit}</span></td>
                  <td className="px-5 py-4">
                    <span className={`badge ${p.stock <= p.threshold ? 'badge-danger' : p.stock <= p.threshold * 2 ? 'badge-warning' : 'badge-success'}`}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-4">{p.isFeatured ? '⭐' : '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => del(p._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-bold text-lg">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-xs font-semibold text-gray-500 mb-1.5 block">NAME *</label>
                <input className="input-field" value={form.name} onChange={set('name')} placeholder="Product name" /></div>
              <div className="col-span-2"><label className="text-xs font-semibold text-gray-500 mb-1.5 block">DESCRIPTION</label>
                <textarea className="input-field resize-none" rows={2} value={form.description} onChange={set('description')} placeholder="Description" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">PRICE (₹) *</label>
                <input className="input-field" type="number" value={form.price} onChange={set('price')} placeholder="0.00" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">MRP (₹)</label>
                <input className="input-field" type="number" value={form.mrp} onChange={set('mrp')} placeholder="0.00" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">STOCK *</label>
                <input className="input-field" type="number" value={form.stock} onChange={set('stock')} placeholder="0" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">THRESHOLD</label>
                <input className="input-field" type="number" value={form.threshold} onChange={set('threshold')} placeholder="10" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">UNIT</label>
                <select className="input-field" value={form.unit} onChange={set('unit')}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">CATEGORY *</label>
                <select className={`input-field ${!form.category ? 'border-red-300 bg-red-50' : ''}`} value={form.category} onChange={set('category')}>
                  <option value="">— Select category —</option>
                  {categories.length === 0 && <option disabled>No categories found — run seed first</option>}
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {!form.category && <p className="text-xs text-red-500 mt-1">Category is required</p>}
              </div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">BRAND</label>
                <input className="input-field" value={form.brand} onChange={set('brand')} placeholder="Brand name" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">TAGS (comma-separated)</label>
                <input className="input-field" value={form.tags} onChange={set('tags')} placeholder="fresh, organic, daily" /></div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="featured" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 accent-primary" />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Mark as Featured</label>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">IMAGES</label>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
                  + Upload Images (Max 5)
                </button>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e => setImageFiles(Array.from(e.target.files))} />
                {imageFiles.length > 0 && <p className="text-xs text-green-600 mt-1">{imageFiles.length} file(s) selected</p>}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <><Loader size={16} className="animate-spin" /> Saving...</> : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
