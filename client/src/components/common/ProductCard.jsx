import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const imageUrl = product.images?.[0]
    ? product.images[0].startsWith('http') ? product.images[0] : product.images[0]
    : null;

  return (
    <div className="product-card card group overflow-hidden rounded-2xl">
      {/* Image */}
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden bg-gray-50 aspect-square">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-gray-50 to-gray-100">
            🛒
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/70 px-3 py-1 rounded-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="text-xs text-primary font-medium mb-1 truncate">
          {product.category?.name || 'Grocery'}
        </div>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-primary transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1.5">₹{product.mrp}</span>
            )}
            <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center
              hover:bg-primary-dark active:scale-90 transition-all duration-200 shadow-sm
              disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-primary"
            title="Add to cart">
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-orange-500 font-medium mt-2">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}
