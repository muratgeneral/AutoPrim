"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.user);
      } else {
        setError(data.error || 'Giriş yapılamadı.');
      }
    } catch (err) {
      setError('Bir sunucu hatası oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen items-center justify-center bg-[#050812] font-sans selection:bg-indigo-500/30">
      <div className="w-full max-w-md p-8 bg-gray-900/40 rounded-2xl border border-gray-800/80 shadow-[0_0_50px_rgba(79,70,229,0.05)] backdrop-blur-xl">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-500 mb-4 border border-indigo-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
            Panele Giriş
          </h1>
          <p className="text-sm text-gray-400 mt-2">Lütfen devam etmek için bilgilerinizi girin.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-900/30 border border-red-800 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Kullanıcı Adı</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11 py-3"
                placeholder="Örn: admin"
                required
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Şifre</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11 py-3"
                placeholder="••••••"
                required
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(79,70,229,0.2)]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Giriş Yap
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
