import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Mic, Camera } from 'lucide-react';
import api from '../../services/api';

export default function SearchBar({ className = '' }) {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  // Voice Search
  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice search not supported on this browser');
    const recognition = new SR();
    recognition.lang = 'te-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    setListening(true);
    recognition.start();
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
      navigate(`/products?search=${encodeURIComponent(transcript)}`);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  }, [navigate]);

  // AI Image Search — replaces Tesseract OCR
  const handleImageSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data: res } = await api.post('/ai/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data && res.data.length > 0) {
        // Navigate to products page with matched product IDs
        const ids = res.data.map(p => p.id || p._id).filter(Boolean).join(',');
        if (ids) {
          navigate(`/products?ids=${ids}`);
        } else {
          // Fallback: search by name of first matched product
          navigate(`/products?search=${encodeURIComponent(res.data[0].name)}`);
        }
      } else {
        alert('No matching products found in this image. Try a clearer photo!');
      }
    } catch {
      alert('Image analysis failed. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative flex items-center w-full ${className}`}>
      <div className="relative flex items-center w-full">
        <Search size={18} className="absolute left-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search groceries..."
          className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 transition-all"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button type="button" onClick={() => setQuery('')}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={15} />
            </button>
          )}
          <button type="button" onClick={startVoice}
            className={`p-1.5 rounded-lg transition-all ${listening ? 'text-primary bg-primary-50 animate-pulse' : 'text-gray-400 hover:text-primary hover:bg-gray-100'}`}
            title="Voice search">
            <Mic size={16} />
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}
            className={`p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors ${imageLoading ? 'animate-pulse text-primary' : ''}`}
            title="AI Image search">
            <Camera size={16} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSearch} />
        </div>
      </div>
    </form>
  );
}
