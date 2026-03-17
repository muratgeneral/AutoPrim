"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }

    if (newPassword.length < 3) {
      setMessage({ type: 'error', text: 'Yeni şifre çok kısa.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user?.username,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Bir hata oluştu.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#050810] rounded-3xl w-full max-w-md border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animation-fade-in relative block">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/60 bg-gradient-to-r from-gray-900/40 to-transparent">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <KeyRound className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold text-gray-100 tracking-wide">Şifre Değiştir</h2>
          </div>
          <button 
             onClick={handleClose}
             className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1">Kullanıcı</label>
              <input 
                type="text" 
                value={user?.username || ''} 
                disabled 
                className="w-full bg-gray-900/50 border border-gray-800 text-gray-500 rounded-xl px-4 py-2.5 outline-none cursor-not-allowed text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1">Mevcut Şifre</label>
              <input 
                type="password" 
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700/50 text-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm placeholder:text-gray-600"
                placeholder="Mevcut şifrenizi girin"
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-indigo-400 mb-1.5 ml-1">Yeni Şifre</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-indigo-900/10 border border-indigo-500/30 text-indigo-100 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm placeholder:text-indigo-900/50"
                placeholder="Yeni şifrenizi girin"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1">Yeni Şifre (Tekrar)</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800/80 border border-gray-700/50 text-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm placeholder:text-gray-600"
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors text-sm"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 text-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Şifreyi Güncelle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
