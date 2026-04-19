import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Loader } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef();

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/categories'); setCategories(r.data.data || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setImageFile(null); setModal(true); };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (imageFile) fd.append('image', imageFile);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) { await api.put(`/categories/${editing._id}`, fd, cfg); toast.success('Category updated!'); }
      else { await api.post('/categories', fd, cfg); toast.success('Category created!'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`); toast.success('Category removed'); fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div><h1 className="text-2xl font-black text-gray-900">Categories</h1><p className="text-gray-500 text-sm mt-0.5">{categories.length} total</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={17} /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? [...Array(8)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />) :
          categories.map(cat => (
            <div key={cat._id} className="card p-5 flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {cat.image
                  ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                  : <span className="text-2xl">🛒</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.slug}</p>
                {cat.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>}
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => del(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-lg">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">NAME *</label>
                <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fruits & Vegetables" /></div>
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">DESCRIPTION</label>
                <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" /></div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">IMAGE</label>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
                  + Upload Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                {imageFile && <p className="text-xs text-green-600 mt-1">✓ {imageFile.name}</p>}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <><Loader size={16} className="animate-spin" />Saving...</> : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
