import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingCart, Bot, Loader, Camera, ChefHat, Clock, Users, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Tomato curry',
  'Chicken masala',
  'Items under ₹500',
  'Breakfast items',
];

const DISH_KEYWORDS = [
  'curry', 'masala', 'biryani', 'dal', 'rice', 'roti', 'sabzi', 'sambar',
  'soup', 'salad', 'fry', 'recipe', 'cook', 'make', 'prepare', 'pulao',
  'upma', 'dosa', 'idli', 'paratha', 'gravy', 'chutney', 'raita', 'korma',
  'halwa', 'khichdi', 'poha', 'pongal', 'rasam', 'stir', 'bake', 'roast',
];

function parseIntent(text) {
  const lower = text.toLowerCase();
  const budgetMatch = lower.match(/under\s*[₹rs]?\s*(\d+)/i) || lower.match(/(\d+)\s*[₹rs]?\s*budget/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1]) : null;
  const isDish = DISH_KEYWORDS.some(k => lower.includes(k));
  return { budget, isDish, query: text };
}

// ── Recipe Card Component ─────────────────────────────────────────────────────
function RecipeCard({ recipe, allProducts, onAddAll }) {
  const { addItem } = useCart();

  const findProduct = (name) =>
    allProducts.find(p => p.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(p.name.toLowerCase()));

  const handleAddOne = (ingredient) => {
    const product = findProduct(ingredient.name);
    if (product) {
      addItem(product);
      toast.success(`${ingredient.name} added to cart!`);
    } else {
      toast.error(`${ingredient.name} not in stock right now`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mt-1 text-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <ChefHat size={16} className="text-white" />
          <span className="text-white font-bold text-base">{recipe.recipe_name}</span>
        </div>
        <div className="flex items-center gap-4 text-white/80 text-xs">
          <span className="flex items-center gap-1"><Users size={11} /> Serves {recipe.servings}</span>
          <span className="flex items-center gap-1"><IndianRupee size={11} /> Est. ₹{recipe.estimated_cost}</span>
        </div>
      </div>

      {/* Ingredients */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ingredients</p>
        <div className="space-y-1.5">
          {recipe.ingredients.map((ing, i) => {
            const inStore = !!findProduct(ing.name);
            return (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`text-xs flex-shrink-0 ${inStore ? 'text-green-500' : 'text-gray-300'}`}>
                    {inStore ? '✅' : '❌'}
                  </span>
                  <span className="text-xs text-gray-700 truncate">{ing.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{ing.quantity} {ing.unit}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">₹{ing.price}</span>
                  {inStore && (
                    <button
                      onClick={() => handleAddOne(ing)}
                      className="w-6 h-6 bg-primary text-white rounded-md flex items-center justify-center hover:bg-primary-dark transition-colors"
                    >
                      <ShoppingCart size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          <Clock size={11} className="inline mr-1" />Steps
        </p>
        <ol className="space-y-1.5 list-none">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-xs text-gray-600">
              <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-600 font-bold flex-shrink-0 flex items-center justify-center text-[10px]">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Add All Button */}
      <div className="px-4 py-3">
        <button
          onClick={onAddAll}
          className="w-full py-2 bg-primary text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors active:scale-95"
        >
          <ShoppingCart size={13} />
          Add All Available Ingredients to Cart
        </button>
      </div>
    </div>
  );
}

// ── Main Chatbot ──────────────────────────────────────────────────────────────
export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your Smart Bazaar assistant 🛒\nAsk me for a recipe 🍽️, budget list, or upload a food photo 📷 to find ingredients!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const bottomRef = useRef();
  const imageRef = useRef();
  const { addItem } = useCart();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pre-fetch products once for "add all" matching
  useEffect(() => {
    if (open && allProducts.length === 0) {
      api.get('/products', { params: { limit: 200 } })
        .then(({ data }) => setAllProducts(data.data || []))
        .catch(() => {});
    }
  }, [open]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const { budget, isDish, query } = parseIntent(text);

      if (isDish) {
        // ── AI Recipe Mode ──
        const { data: res } = await api.post('/ai/recipe', { user_request: query });

        if (res.fallback || !res.success) {
          // Graceful fallback to product search
          await fallbackProductSearch(query);
        } else {
          setMessages(prev => [...prev, { role: 'bot', text: `Here's a recipe for "${res.data.recipe_name}" 🍽️`, recipe: res.data }]);
        }
      } else {
        await fallbackProductSearch(query, budget);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Something went wrong. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const fallbackProductSearch = async (query, budget = null) => {
    let params = { limit: 8 };
    if (budget) params.maxPrice = budget;
    else params.search = query;

    const { data } = await api.get('/products', { params });
    const products = data.data || [];

    if (products.length === 0) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't find matching products. Try a different search! 😊" }]);
    } else {
      const reply = budget
        ? `Here are items under ₹${budget} 🛍️`
        : `Found ${products.length} items for "${query}" ✨`;
      setMessages(prev => [...prev, { role: 'bot', text: reply, products }]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    setMessages(prev => [...prev, { role: 'user', text: `📷 Uploaded: ${file.name}` }]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data: res } = await api.post('/ai/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data && res.data.length > 0) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `Found ${res.data.length} product(s) from your image 🎯`,
          products: res.data,
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: "Couldn't identify products from that image. Try a clearer photo! 📸" }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Image analysis failed. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = (recipe) => {
    const DISH_KEYWORDS_LOCAL = DISH_KEYWORDS; // used for scope
    let added = 0;
    recipe.ingredients.forEach(ing => {
      const product = allProducts.find(p =>
        p.name.toLowerCase().includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (product) { addItem(product); added++; }
    });
    if (added > 0) toast.success(`${added} ingredient${added > 1 ? 's' : ''} added to cart! 🛒`);
    else toast.error('No matching products found in store.');
  };

  return (
    <>
      {/* FAB */}
      <button onClick={() => setOpen(o => !o)}
        className="chat-bot-fab fixed bottom-6 right-6 w-14 h-14 rounded-full text-white flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-transform duration-200"
        title="AI Assistant">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col animate-slide-up overflow-hidden" style={{ maxHeight: '560px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Smart AI Assistant</p>
              <p className="text-white/70 text-xs">Recipes, products & image search!</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm'
                  : 'space-y-2 w-full'}`}>
                  {msg.role === 'bot' ? (
                    <>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-700 whitespace-pre-line">
                        {msg.text}
                      </div>

                      {/* Recipe Card */}
                      {msg.recipe && (
                        <RecipeCard
                          recipe={msg.recipe}
                          allProducts={allProducts}
                          onAddAll={() => handleAddAll(msg.recipe)}
                        />
                      )}

                      {/* Product Cards */}
                      {msg.products && (
                        <div className="space-y-2">
                          {msg.products.map(p => (
                            <div key={p._id || p.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                {p.images?.[0]
                                  ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                  : <span className="w-full h-full flex items-center justify-center text-lg">🛒</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                                <p className="text-xs text-primary font-bold">₹{p.price}</p>
                              </div>
                              <button onClick={() => { addItem(p); toast.success(`${p.name} added!`); }}
                                disabled={p.stock === 0}
                                className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors flex-shrink-0 disabled:opacity-40">
                                <ShoppingCart size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader size={14} className="animate-spin text-primary" />
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-primary-50 text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-200 font-medium">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              disabled={loading}
              className="w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:text-primary hover:border-primary flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40"
              title="Upload food photo"
            >
              <Camera size={16} />
            </button>
            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask for a recipe or product..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 flex-shrink-0">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
