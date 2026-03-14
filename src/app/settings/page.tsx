"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Save, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface MonthSetting {
  id: string;
  name: string;
  csdStartDate: string;
  csdEndDate: string;
  offerStartDate: string;
  offerEndDate: string;
}

export default function SettingsPage() {
  const [months, setMonths] = useState<MonthSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setMonths(data);
    } catch (err: any) {
      setMessage({ text: 'Ayarlar yüklenirken bir hata oluştu: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(months)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      setMessage({ text: 'Aylık parametreler başarıyla kaydedildi!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: 'Kaydedilirken hata oluştu: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (id: string, field: keyof MonthSetting, value: string) => {
    setMonths(prev => 
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  return (
    <div className="flex h-screen bg-[#050810] overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-screen p-4 md:p-8 font-sans selection:bg-blue-500/30 w-full mb-20">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                    Aylık Parametre Ayarları
                  </h1>
                  <p className="text-sm text-gray-400">Raporlarda kullanılacak varsayılan aylık tarih aralıklarını (Bildirim ve Teklif) tanımlayın.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {message && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                    message.type === 'success' ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-red-900/30 border-red-800 text-red-400'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-sm font-medium">{message.text}</span>
                  </div>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={loading || saving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(79,70,229,0.2)] flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Değişiklikleri Kaydet
                </button>
              </div>
            </header>

            {loading ? (
              <div className="flex justify-center py-20">
                 <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                {months.map((month) => (
                  <div key={month.id} className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800/80 shadow-lg hover:border-indigo-500/30 transition-colors group">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 pb-3 border-b border-gray-800 flex justify-between items-center">
                      <span>{month.name}</span>
                      <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-md">ID: {month.id}</span>
                    </h3>
                    
                    <div className="space-y-4">
                      {/* CSD Dates */}
                      <div>
                        <label className="text-xs text-blue-400 font-semibold mb-1.5 block">Satış Bildirilen Tarih (CSDDATE)</label>
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                          <input 
                            type="date" 
                            className="bg-gray-800/80 border border-gray-700/50 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block w-full px-3 py-2 outline-none transition-all"
                            value={month.csdStartDate} 
                            onChange={(e) => handleDateChange(month.id, 'csdStartDate', e.target.value)}
                          />
                          <span className="text-gray-500 font-medium hidden md:block">-</span>
                          <input 
                            type="date" 
                            className="bg-gray-800/80 border border-gray-700/50 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block w-full px-3 py-2 outline-none transition-all"
                            value={month.csdEndDate} 
                            onChange={(e) => handleDateChange(month.id, 'csdEndDate', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Offer Dates */}
                      <div>
                        <label className="text-xs text-emerald-400 font-semibold mb-1.5 block">Teklif Tarihi (GECERTAR)</label>
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
                          <input 
                            type="date" 
                            className="bg-gray-800/80 border border-gray-700/50 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 block w-full px-3 py-2 outline-none transition-all"
                            value={month.offerStartDate} 
                            onChange={(e) => handleDateChange(month.id, 'offerStartDate', e.target.value)}
                          />
                          <span className="text-gray-500 font-medium hidden md:block">-</span>
                          <input 
                            type="date" 
                            className="bg-gray-800/80 border border-gray-700/50 text-gray-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/50 block w-full px-3 py-2 outline-none transition-all"
                            value={month.offerEndDate} 
                            onChange={(e) => handleDateChange(month.id, 'offerEndDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
