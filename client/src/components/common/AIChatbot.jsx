import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingCart, Bot, Loader } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const SUGGESTIONS = [
  'Items under ₹500',
  'Chicken curry ingredients',
  'Breakfast items',
  'Healthy snacks',
];

function parseIntent(text) {
  const lower = text.toLowerCase();
  const budgetMatch = lower.match(/under\s*[₹rs]?\s*(\d+)/i) || lower.match(/(\d+)\s*[₹rs]?\s*budget/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1]) : null;
  const dishKeywords = ['curry', 'masala', 'biryani', 'dal', 'rice', 'roti', 'sabzi', 'sambar'];
  const isDish = dishKeywords.some(k => lower.includes(k));
  return { budget, isDish, query: text };
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your Smart Bazaar assistant 🛒\nAsk me for product suggestions, budget lists, or dish ingredients!" }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const { addItem } = useCart();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { budget, isDish, query } = parseIntent(text);
      let params = { limit: 8 };
      if (budget) { params.maxPrice = budget; }
      else { params.search = query; }

      const { data } = await api.get('/products', { params });
      const products = data.data || [];

      let reply = '';
      if (products.length === 0) {
        reply = "Sorry, I couldn't find matching products right now. Try a different search! 😊";
        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      } else {
        if (budget) reply = `Here are items under ₹${budget} 🛍️`;
        else if (isDish) reply = `Ingredients for "${query}" 🍽️`;
        else reply = `Found ${products.length} items for "${query}" ✨`;

        setMessages(prev => [...prev, { role: 'bot', text: reply, products }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Something went wrong. Please try again!' }]);
    } finally {
      setLoading(false);
    }
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
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col animate-slide-up overflow-hidden" style={{ maxHeight: '520px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Smart AI Assistant</p>
              <p className="text-white/70 text-xs">Ask me anything about groceries!</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '340px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm'
                  : 'space-y-2'}`}>
                  {msg.role === 'bot' ? (
                    <>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-700 whitespace-pre-line">
                        {msg.text}
                      </div>
                      {msg.products && (
                        <div className="space-y-2">
                          {msg.products.map(p => (
                            <div key={p._id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                {p.images?.[0]
                                  ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                  : <span className="w-full h-full flex items-center justify-center text-lg">🛒</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                                <p className="text-xs text-primary font-bold">₹{p.price}</p>
                              </div>
                              <button onClick={() => addItem(p)}
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
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader size={16} className="animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-primary-50 text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-200 font-medium">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="e.g. naaku chicken masala kavali..."
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
