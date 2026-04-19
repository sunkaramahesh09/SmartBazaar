import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Store, Warehouse, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-black text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, stores: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [products, orders, stores, inventory] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/orders/admin/all?limit=5'),
          api.get('/stores'),
          api.get('/inventory'),
        ]);
        const lowStock = (inventory.data.data || []).filter(i => i.currentStock <= i.threshold).length;
        setStats({
          products: products.data.pagination?.total || 0,
          orders: orders.data.pagination?.total || 0,
          stores: (stores.data.data || []).length,
          lowStock,
        });
        setRecentOrders(orders.data.data || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const STATUS_COLORS = { pending: 'badge-warning', preparing: 'badge-info', ready: 'badge-success', completed: 'badge-primary' };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-9">
        <StatCard icon={Package}      label="Total Products" value={stats.products} color="bg-primary"      sub="Active listings" />
        <StatCard icon={ShoppingBag}  label="Total Orders"   value={stats.orders}   color="bg-blue-500"    sub="All time" />
        <StatCard icon={Store}        label="Stores"         value={stats.stores}   color="bg-green-500"   sub="Active locations" />
        <StatCard icon={AlertTriangle} label="Low Stock"     value={stats.lowStock} color="bg-orange-500"  sub="Need restocking" />
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <a href="/admin/orders" className="text-primary text-sm font-medium hover:underline">View all →</a>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Token', 'Customer', 'Store', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-primary">#{order.token}</td>
                    <td className="px-5 py-4 text-gray-700">{order.user?.name}</td>
                    <td className="px-5 py-4 text-gray-600">{order.store?.name}</td>
                    <td className="px-5 py-4 font-semibold">₹{order.total.toFixed(2)}</td>
                    <td className="px-5 py-4"><span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span></td>
                    <td className="px-5 py-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
