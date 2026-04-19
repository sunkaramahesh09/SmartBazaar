import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package, Star, Plus, Minus } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';

const STATUS_COLORS = { pending: 'badge-warning', preparing: 'badge-info', ready: 'badge-success', completed: 'badge-primary' };

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page-container py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded-xl" />
          <div className="skeleton h-5 w-1/2 rounded-xl" />
          <div className="skeleton h-12 w-1/3 rounded-xl" />
          <div className="skeleton h-4 rounded-xl" /><div className="skeleton h-4 w-4/5 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const images = product.images?.length > 0 ? product.images : [null];

  return (
    <div className="page-container py-10 page-enter">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-7 transition-colors text-sm font-medium">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-200">
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🛒</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary shadow-glow-primary' : 'border-gray-200 hover:border-gray-400'}`}>
                  {img ? <img src={img} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">🛒</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="text-xs font-semibold text-primary mb-2">{product.category?.name}</div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-black text-gray-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
            )}
            {discount > 0 && <span className="badge badge-danger">{discount}% off</span>}
            <span className="text-sm text-gray-500">/ {product.unit}</span>
          </div>

          {product.brand && <p className="text-sm text-gray-500 mb-3">Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>}

          {/* Stock badge */}
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? (product.stock <= 10 ? `Only ${product.stock} left` : 'In Stock') : 'Out of Stock'}
            </span>
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50 rounded-2xl p-4">{product.description}</p>
          )}

          {/* Qty + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-gray-800">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={() => addItem(product, qty)}
                className="btn-primary flex items-center gap-2 flex-1 justify-center">
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="badge badge-primary">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
