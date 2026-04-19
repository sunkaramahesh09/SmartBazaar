import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch {}
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 page-enter">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
              <span className="text-white font-black text-2xl">V</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join Smart Bazaar and start shopping!</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Full name" required value={form.name} onChange={set('name')}
                className="input-field pl-10" />
            </div>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" placeholder="Email address" required value={form.email} onChange={set('email')}
                className="input-field pl-10" />
            </div>
            <div className="relative">
              <Phone size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" placeholder="Phone number (optional)" value={form.phone} onChange={set('phone')}
                className="input-field pl-10" />
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPwd ? 'text' : 'password'} placeholder="Password (min 6 chars)" required minLength={6}
                value={form.password} onChange={set('password')} className="input-field pl-10 pr-11" />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
              {loading ? 'Creating account...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
