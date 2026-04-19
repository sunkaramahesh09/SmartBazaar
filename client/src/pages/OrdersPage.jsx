import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, ChefHat, Store } from 'lucide-react';
import api from '../services/api';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',          color: 'badge-warning', icon: Clock,        step: 1 },
  preparing: { label: 'Preparing',         color: 'badge-info',    icon: ChefHat,      step: 2 },
  ready:     { label: 'Ready for Pickup',  color: 'badge-success', icon: CheckCircle,  step: 3 },
  completed: { label: 'Completed',         color: 'badge-primary', icon: Package,      step: 4 },
};

function StatusStepper({ status }) {
  const steps = ['pending', 'preparing', 'ready', 'completed'];
  const currentStep = STATUS_CONFIG[status]?.step || 1;
  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((s, i) => {
        const done = currentStep > i + 1;
        const active = currentStep === i + 1;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0
              ${done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary/25' : 'bg-gray-100 text-gray-400'}`}>
              {done ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-1 rounded-full transition-all ${done ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(r => setOrders(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container py-10 space-y-5">
      {[1, 2, 3].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="page-container py-10 page-enter">
      <h1 className="section-title mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Package size={56} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-600">No orders yet</p>
          <p className="text-sm mt-1">Your orders will appear here after checkout</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={order._id} className="card p-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order ID: <span className="font-mono text-gray-700">{order._id.slice(-8).toUpperCase()}</span></p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${cfg.color} flex items-center gap-1.5`}>
                      <StatusIcon size={12} /> {cfg.label}
                    </span>
                    {/* Token — visible to user */}
                    <div className="token-display text-white text-xl font-black tracking-widest rounded-xl px-4 py-1.5">
                      #{order.token}
                    </div>
                  </div>
                </div>

                {/* Progress stepper */}
                <StatusStepper status={order.status} />

                {/* Items */}
                <div className="mt-5 space-y-2.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-lg">🛒</span>}
                      </div>
                      <div className="flex-1"><p className="text-sm font-medium text-gray-800">{item.name}</p></div>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Store size={15} className="text-primary" />
                    <span>{order.store?.name}</span>
                    {order.store?.address && <span className="text-gray-400">— {order.store.address.city}</span>}
                  </div>
                  <p className="font-bold text-primary text-lg">Total: ₹{order.total.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
