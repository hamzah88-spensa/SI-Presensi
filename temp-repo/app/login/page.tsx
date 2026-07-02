'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Lock, User, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop');
  const [showBgInput, setShowBgInput] = useState(false);
  const [newBg, setNewBg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedBg = localStorage.getItem('loginBgImage');
    if (savedBg) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBgImage(savedBg);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === '4dm1n' && password === '40202005*') {
      Cookies.set('auth_token', 'authenticated', { 
        expires: 1, 
        path: '/',
        secure: true,
        sameSite: 'none'
      });
      window.location.href = '/';
    } else {
      setError('Username atau password salah!');
    }
  };

  const handleSaveBg = () => {
    if (newBg) {
      setBgImage(newBg);
      localStorage.setItem('loginBgImage', newBg);
      setShowBgInput(false);
      setNewBg('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Background"
          fill
          className="object-cover"
          priority
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 m-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Selamat Datang</h1>
          <p className="text-slate-500 mt-2">Silakan masuk ke akun Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Masuk
          </button>
        </form>

        {/* Change Background Toggle */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowBgInput(!showBgInput)}
            className="text-sm text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Ganti Gambar Latar
          </button>

          {showBgInput && (
            <div className="mt-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
              <input
                type="url"
                value={newBg}
                onChange={(e) => setNewBg(e.target.value)}
                placeholder="Masukkan URL gambar..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBg}
                  className="flex-1 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" /> Simpan
                </button>
                <button
                  onClick={() => setShowBgInput(false)}
                  className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
