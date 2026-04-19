import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Mic, Camera } from 'lucide-react';
import { createWorker } from 'tesseract.js';

export default function SearchBar({ className = '' }) {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
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
    recognition.lang = 'te-IN'; // Telugu first, falls back to English
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

  // Image/OCR Search
  const handleImageSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      const cleaned = text.replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
      if (cleaned) {
        setQuery(cleaned);
        navigate(`/products?search=${encodeURIComponent(cleaned)}`);
      }
    } catch (err) {
      alert('Could not extract text from image');
    } finally {
      setOcrLoading(false);
      e.target.value = '';
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
            className={`p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors ${ocrLoading ? 'animate-pulse text-primary' : ''}`}
            title="Image search">
            <Camera size={16} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSearch} />
        </div>
      </div>
    </form>
  );
}
