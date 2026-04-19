import { useState, useEffect, useRef } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import socket from '../../services/socket';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'completed'];
const STATUS_COLORS  = { pending: 'badge-warning', preparing: 'badge-info', ready: 'badge-success', completed: 'badge-primary' };
const STATUS_LABELS  = { pending: 'Pending', preparing: 'Preparing', ready: 'Ready for Pickup', completed: 'Completed' };

export default function AdminOrders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId]   = useState(null);
  const [updating, setUpdating]       = useState(null);
  const intervalRef                   = useRef(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const r = await api.get('/orders/admin/all', { params });
      setOrders(r.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  useEffect(() => {
    // ── Real-time: when any order status changes, update the row instantly ──
    const handleOrderUpdated = ({ orderId, status }) => {
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status } : o)
      );
    };

    // ── When a NEW order comes in, refetch so admin sees it immediately ──
    const handleNewOrder = () => {
      fetchOrders();
      toast('🛒 New order received!', { icon: '🔔' });
    };

    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:new',     handleNewOrder);

    // Fallback: poll every 30s
    intervalRef.current = setInterval(fetchOrders, 30000);

    // Refetch when admin switches back to this tab
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchOrders();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      socket.off('order:updated', handleOrderUpdated);
      socket.off('order:new',     handleNewOrder);
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status });
      toast.success(`Order status → ${STATUS_LABELS[status]}`);
      // Optimistically update locally (socket will also confirm)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div><h1 className="text-2xl font-black text-gray-900">Orders</h1><p className="text-gray-500 text-sm mt-0.5">{orders.length} orders</p></div>
        <div className="flex items-center gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="input-field !py-2 !w-auto">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <button onClick={fetchOrders} className="p-2.5 rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />) :
          orders.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">No orders found</div>
          ) : orders.map(order => (
            <div key={order._id} className="card overflow-hidden">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="flex items-center gap-4">
                  {/* Token */}
                  <div className="token-display text-white font-black text-xl tracking-widest rounded-xl px-4 py-1.5">
                    #{order.token}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{order.user?.name}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">₹{order.total.toFixed(2)}</span>
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select value={order.status} disabled={updating === order._id}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      className={`appearance-none pr-8 pl-4 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all focus:outline-none
                        ${order.status === 'pending'   ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                          order.status === 'preparing' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                          order.status === 'ready'     ? 'border-green-300 bg-green-50 text-green-700' :
                          'border-gray-300 bg-gray-50 text-gray-600'}`}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                  </div>
                  <button onClick={() => setExpandedId(id => id === order._id ? null : order._id)}
                    className="text-xs text-gray-500 hover:text-primary font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    {expandedId === order._id ? '▲ Hide' : '▼ Items'}
                  </button>
                </div>
              </div>

              {/* Store + date */}
              <div className="px-6 pb-3 flex flex-wrap items-center gap-4 text-xs text-gray-500 border-t border-gray-50">
                <span>🏪 {order.store?.name}</span>
                <span>📅 {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>

              {/* Expanded items */}
              {expandedId === order._id && (
                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-2.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">🛒</div>}
                      </div>
                      <p className="flex-1 text-sm text-gray-700 font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                      <p className="text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  {order.notes && <p className="text-xs text-gray-500 pt-2 border-t">Note: {order.notes}</p>}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
