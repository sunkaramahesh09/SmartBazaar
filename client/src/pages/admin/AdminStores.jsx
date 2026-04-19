import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader, MapPin } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY = { name: '', address: { street: '', city: '', state: '', pincode: '' }, phone: '', timings: { open: '08:00 AM', close: '09:00 PM' }, location: { lat: '', lng: '' } };

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/stores'); setStores(r.data.data || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm(JSON.parse(JSON.stringify(s))); setModal(true); };

  const setAddr = (k) => (e) => setForm(f => ({ ...f, address: { ...f.address, [k]: e.target.value } }));
  const setTime = (k) => (e) => setForm(f => ({ ...f, timings: { ...f.timings, [k]: e.target.value } }));
  const setLoc  = (k) => (e) => setForm(f => ({ ...f, location: { ...f.location, [k]: e.target.value } }));

  const save = async () => {
    if (!form.name || !form.address.street || !form.address.city) return toast.error('Name and address required');
    setSaving(true);
    try {
      if (editing) { await api.put(`/stores/${editing._id}`, form); toast.success('Store updated!'); }
      else { await api.post('/stores', form); toast.success('Store added! It will appear on customer side.'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Remove this store?')) return;
    await api.delete(`/stores/${id}`); toast.success('Store removed'); fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div><h1 className="text-2xl font-black text-gray-900">Stores</h1><p className="text-gray-500 text-sm mt-0.5">Manage pickup locations</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={17} /> Add Store</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton h-44 rounded-2xl" />) :
          stores.map(store => (
            <div key={store._id} className="card p-6 relative group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-base">{store.name}</p>
                  <span className="text-xs font-mono text-primary bg-primary-50 px-2 py-0.5 rounded-md">{store.uniqueId}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(store)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit2 size={14} /></button>
                  <button onClick={() => del(store._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>{store.address.street}, {store.address.city}, {store.address.state} – {store.address.pincode}</span>
                </div>
                {store.phone && <p>📞 {store.phone}</p>}
                <p className="text-green-600 font-medium">🕐 {store.timings?.open} – {store.timings?.close}</p>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-bold text-lg">{editing ? 'Edit Store' : 'Add Store'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">STORE NAME *</label>
                <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Smart Bazaar Ameerpet" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-gray-500 mb-1.5 block">STREET *</label>
                  <input className="input-field" value={form.address.street} onChange={setAddr('street')} placeholder="123 Main Street" /></div>
                <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">CITY *</label>
                  <input className="input-field" value={form.address.city} onChange={setAddr('city')} placeholder="Hyderabad" /></div>
                <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">STATE</label>
                  <input className="input-field" value={form.address.state} onChange={setAddr('state')} placeholder="Telangana" /></div>
                <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">PINCODE</label>
                  <input className="input-field" value={form.address.pincode} onChange={setAddr('pincode')} placeholder="500001" /></div>
                <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">PHONE</label>
                  <input className="input-field" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765..." /></div>
                <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">OPENS AT</label>
                  <input className="input-field" value={form.timings.open} onChange={setTime('open')} placeholder="08:00 AM" /></div>
                <div><label className="text-xs font-semibold text-gray-500 mb-1.5 block">CLOSES AT</label>
                  <input className="input-field" value={form.timings.close} onChange={setTime('close')} placeholder="09:00 PM" /></div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <><Loader size={16} className="animate-spin" />Saving...</> : 'Save Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
