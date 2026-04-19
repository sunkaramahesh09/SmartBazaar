import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, clearCart, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="page-container py-24 text-center page-enter">
      <div className="text-8xl mb-5">🛒</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-7">Add some fresh groceries to get started!</p>
      <Link to="/products" className="btn-primary inline-flex items-center gap-2">
        <ShoppingBag size={18} /> Shop Now
      </Link>
    </div>
  );

  return (
    <div className="page-container py-10 page-enter">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="section-title">My Cart</h1>
          <p className="text-gray-500 text-sm mt-1">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
        </div>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors">
          <Trash2 size={15} /> Clear Cart
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="md:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item._id} className="card p-4 flex items-center gap-4 animate-fade-in">
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.images?.[0]
                  ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">🛒</div>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item._id}`}
                  className="font-semibold text-gray-800 text-sm hover:text-primary transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{item.category?.name}</p>
                <p className="text-primary font-bold mt-1">₹{item.price} / {item.unit}</p>
              </div>

              {/* Qty Controls */}
              <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <button onClick={() => updateQty(item._id, item.quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-9 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40">
                  <Plus size={14} />
                </button>
              </div>

              {/* Line total + remove */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeItem(item._id)}
                  className="text-red-400 hover:text-red-600 mt-1.5 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold text-lg text-gray-800 mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free (Store Pickup)</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span className="text-primary text-xl">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button onClick={() => user ? navigate('/checkout') : navigate('/login')}
                className="btn-primary w-full flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              <Link to="/products" className="btn-ghost w-full text-center block text-sm">
                Continue Shopping
              </Link>
            </div>

            <div className="mt-5 p-3 bg-green-50 rounded-xl text-xs text-green-700 font-medium text-center">
              ✅ Store Pickup — No delivery charges!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
