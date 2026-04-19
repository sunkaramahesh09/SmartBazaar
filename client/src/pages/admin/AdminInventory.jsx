import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Save, Loader, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/inventory'); setInventory(r.data.data || []); }
    finally { setLoading(false); }
  };
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch();

    // Auto-refresh every 30s so stock changes reflect without manual reload
    intervalRef.current = setInterval(fetch, 30000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetch();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const setEdit = (id, field, value) =>
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const save = async (item) => {
    const edit = edits[item._id] || {};
    const payload = {
      currentStock: edit.currentStock ?? item.currentStock,
      threshold: edit.threshold ?? item.threshold,
    };
    setSaving(item._id);
    try {
      await api.put(`/inventory/${item.product._id}`, payload);
      toast.success(`${item.product.name} updated!`);
      setEdits(prev => { const n = { ...prev }; delete n[item._id]; return n; });
      fetch();
    } catch { toast.error('Update failed'); }
    finally { setSaving(null); }
  };

  const filtered = inventory.filter(item => {
    if (filter === 'low') return item.currentStock <= item.threshold;
    if (filter === 'ok') return item.currentStock > item.threshold;
    return true;
  });

  const lowCount = inventory.filter(i => i.currentStock <= i.threshold).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm mt-0.5">{inventory.length} products tracked</p>
        </div>
        <div className="flex items-center gap-3">
          {lowCount > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-medium">
              <AlertTriangle size={16} /> {lowCount} low stock
            </div>
          )}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {[['all','All'],['low','Low Stock'],['ok','In Stock']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-4 py-2 text-xs font-semibold transition-all ${filter === v ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={fetch} className="p-2.5 rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Product','Current Stock','Threshold','Status','Actions'].map(h =>
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              )}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={5}><div className="skeleton h-12 m-4 rounded-xl" /></td></tr>
              )) : filtered.map(item => {
                const isLow = item.currentStock <= item.threshold;
                const edit = edits[item._id] || {};
                const hasEdit = edits[item._id] !== undefined;
                return (
                  <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${isLow ? 'bg-orange-50/50' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0]
                            ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🛒</div>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">₹{item.product?.price} / {item.product?.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <input type="number" min="0"
                        value={edit.currentStock ?? item.currentStock}
                        onChange={e => setEdit(item._id, 'currentStock', Number(e.target.value))}
                        className="w-24 input-field !py-1.5 !text-sm text-center" />
                    </td>
                    <td className="px-5 py-4">
                      <input type="number" min="0"
                        value={edit.threshold ?? item.threshold}
                        onChange={e => setEdit(item._id, 'threshold', Number(e.target.value))}
                        className="w-24 input-field !py-1.5 !text-sm text-center" />
                    </td>
                    <td className="px-5 py-4">
                      {isLow
                        ? <span className="badge badge-danger flex items-center gap-1 w-fit"><AlertTriangle size={11} /> Low Stock</span>
                        : <span className="badge badge-success w-fit">In Stock</span>}
                    </td>
                    <td className="px-5 py-4">
                      {hasEdit && (
                        <button onClick={() => save(item)} disabled={saving === item._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60">
                          {saving === item._id ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
                          Save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
