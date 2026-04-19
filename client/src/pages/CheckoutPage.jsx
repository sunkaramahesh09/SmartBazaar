import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Loader, Store } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get('/stores').then(r => setStores(r.data.data || []));
    if (items.length === 0) navigate('/cart');
  }, []);

  const placeOrder = async () => {
    if (!selectedStore) return alert('Please select a pickup store');
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: items.map(i => ({ product: i._id, quantity: i.quantity })),
        storeId: selectedStore,
        notes
      });
      setOrder(data.data);
      clearCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  // Success screen
  if (order) return (
    <div className="page-container py-20 text-center page-enter max-w-lg mx-auto">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={48} className="text-green-500" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed! 🎉</h1>
      <p className="text-gray-500 mb-8">Your order has been received. Pick up from the store below.</p>

      <div className="card p-8 mb-6">
        <p className="text-sm text-gray-500 mb-2">Your Pickup Token</p>
        <div className="token-display text-white text-5xl font-black tracking-widest rounded-2xl py-6 px-8 mb-4">
          {order.token}
        </div>
        <p className="text-xs text-gray-400">Show this token at the store counter</p>
      </div>

      <div className="card p-5 mb-6 text-left">
        <div className="flex items-start gap-3">
          <Store size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-800">{order.store?.name}</p>
            <p className="text-sm text-gray-500">{order.store?.address?.street}, {order.store?.address?.city}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/orders')} className="btn-primary flex-1">View My Orders</button>
        <button onClick={() => navigate('/')} className="btn-outline flex-1">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="page-container py-10 page-enter">
      <h1 className="section-title mb-8">Checkout</h1>
      <div className="grid md:grid-cols-5 gap-8">
        {/* Store Selection */}
        <div className="md:col-span-3 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-lg text-gray-800 mb-5 flex items-center gap-2">
              <MapPin size={20} className="text-primary" /> Select Pickup Store
            </h2>
            {stores.length === 0 ? (
              <p className="text-gray-400 text-sm">No stores available. Please contact support.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {stores.map(store => (
                  <button key={store._id} onClick={() => setSelectedStore(store._id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedStore === store._id
                      ? 'border-primary bg-primary-50 shadow-glow-primary'
                      : 'border-gray-200 hover:border-primary/50'}`}>
                    <p className="font-semibold text-gray-800 text-sm">{store.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{store.address.street}</p>
                    <p className="text-xs text-gray-500">{store.address.city}, {store.address.state} — {store.address.pincode}</p>
                    {store.timings && (
                      <p className="text-xs text-green-600 font-medium mt-2">🕐 {store.timings.open} – {store.timings.close}</p>
                    )}
                    {store.uniqueId && <p className="text-xs text-gray-400 mt-1">Store ID: {store.uniqueId}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-gray-800 mb-3">Order Notes (optional)</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Any special requests or notes for your order..."
              className="input-field resize-none" />
          </div>
        </div>

        {/* Summary */}
        <div className="md:col-span-2">
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-5">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🛒</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span><span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span><span className="text-primary text-xl">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={placeOrder} disabled={loading || !selectedStore}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              {loading ? <><Loader size={18} className="animate-spin" /> Placing Order...</> : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
