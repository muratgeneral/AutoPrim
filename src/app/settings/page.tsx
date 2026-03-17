"use client";

import React, { useState, useEffect } from 'react';
import { Save, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MonthSetting {
  id: string;
  name: string;
  csdStartDate: string;
  csdEndDate: string;
  offerStartDate: string;
  offerEndDate: string;
  peugeotTarget?: number;
  dealerPerc?: number;
  teamPerc?: number;
  managerPerc?: number;
  consultantPerc?: number;
  supportPerc?: number;
  opelMatrixMultiplier?: number;
  opelSmPerc?: number;
  opelSdPerc?: number;
  opelSupportPerc?: number;
  citroenDealerPerc?: number;
  citroenSmPerc?: number;
  citroenSdPerc?: number;
  citroenSupportPerc?: number;
  opelPassengerBasePerc?: number;
  opelFronteraBasePerc?: number;
  opelCommercialBasePerc?: number;
  opelPassengerTeamFixed?: number;
  opelFronteraTeamFixed?: number;
  opelCommercialTeamFixed?: number;
}

export default function SettingsPage() {
  const { user } = useAuth();
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

  const handleDateChange = (id: string, field: keyof MonthSetting, value: string | number) => {
    setMonths(prev => 
      prev.map(m => m.id === id ? { ...m, [field]: value } : m)
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
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

                      {/* Targets & Percentages */}
                      {(user?.role === 'superadmin' || user?.allowedBrands.includes('1')) && (
                      <div className="pt-3 border-t border-gray-800/60">
                        <label className="text-xs text-purple-400 font-semibold mb-3 block uppercase tracking-wider">Peugeot Hedef & Prim Oranları</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Araç Hedefi */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Araç Hedefi (Adet)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-purple-900/40 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-purple-500/50 block w-full px-3 py-2 outline-none transition-all pl-9"
                                value={month.peugeotTarget || 0} 
                                onChange={(e) => handleDateChange(month.id, 'peugeotTarget', parseInt(e.target.value) || 0)}
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-500/60">
                                🎯
                              </div>
                            </div>
                          </div>

                          {/* Dealer % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Bayi Prim Oranı (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-purple-900/40 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-purple-500/50 block w-full px-3 py-2 outline-none transition-all pl-9"
                                value={month.dealerPerc || 0} 
                                onChange={(e) => handleDateChange(month.id, 'dealerPerc', parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-500/60">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Team Base % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Ekip Prim Oranı (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-purple-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.teamPerc || 0} 
                                onChange={(e) => handleDateChange(month.id, 'teamPerc', parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Manager % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Satış Müdürü (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-purple-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.managerPerc || 0} 
                                onChange={(e) => handleDateChange(month.id, 'managerPerc', parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Consultant % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Satış Danışmanı (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-purple-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.consultantPerc || 0} 
                                onChange={(e) => handleDateChange(month.id, 'consultantPerc', parseFloat(e.target.value) || 0)}
                              />
                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Support % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Destek Personeli (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-purple-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.supportPerc || 0} 
                                onChange={(e) => handleDateChange(month.id, 'supportPerc', parseFloat(e.target.value) || 0)}
                              />
                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                      )}

                      {/* Citroen Targets & Percentages */}
                      {(user?.role === 'superadmin' || user?.allowedBrands.includes('2')) && (
                      <div className="pt-3 border-t border-gray-800/60 mt-4">
                        <label className="text-xs text-red-400 font-semibold mb-3 block uppercase tracking-wider">Citroen Prim Oranları</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Dealer % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Bayi Prim Oranı (Çarpan) (%)</span>
                            <div className="relative">
                              <input 
                                type="number" step="0.001"
                                className="bg-gray-800/50 border border-red-900/40 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-red-500/50 block w-full px-3 py-2 outline-none transition-all pl-9"
                                value={month.citroenDealerPerc !== undefined ? month.citroenDealerPerc : 0} 
                                onChange={(e) => handleDateChange(month.id, 'citroenDealerPerc', parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-red-500/60">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Manager % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Satış Müdürü (%)</span>
                            <div className="relative">
                              <input 
                                type="number" step="0.001"
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-red-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.citroenSmPerc !== undefined ? month.citroenSmPerc : 0} 
                                onChange={(e) => handleDateChange(month.id, 'citroenSmPerc', parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Consultant % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Satış Danışmanı (%)</span>
                            <div className="relative">
                              <input 
                                type="number" step="0.001"
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-red-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.citroenSdPerc !== undefined ? month.citroenSdPerc : 0} 
                                onChange={(e) => handleDateChange(month.id, 'citroenSdPerc', parseFloat(e.target.value) || 0)}
                              />
                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Support % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Destek Personeli (%)</span>
                            <div className="relative">
                              <input 
                                type="number" step="0.001"
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-red-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.citroenSupportPerc !== undefined ? month.citroenSupportPerc : 0} 
                                onChange={(e) => handleDateChange(month.id, 'citroenSupportPerc', parseFloat(e.target.value) || 0)}
                              />
                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                      )}


                      {/* Opel Targets & Percentages */}
                      {(user?.role === 'superadmin' || user?.allowedBrands.includes('3')) && (
                      <div className="pt-3 border-t border-gray-800/60 mt-4">
                        <label className="text-xs text-yellow-400 font-semibold mb-3 block uppercase tracking-wider">Opel (Matris) Çarpan & Prim Oranları</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Matrix Multiplier */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Bayi Prim Oranı (Hedef Çarpanı) (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-yellow-900/40 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-yellow-500/50 block w-full px-3 py-2 outline-none transition-all pl-9"
                                value={month.opelMatrixMultiplier || 0} 
                                onChange={(e) => handleDateChange(month.id, 'opelMatrixMultiplier', parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-yellow-500/60">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Opel Manager % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Satış Müdürü (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-yellow-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.opelSmPerc || 0} 
                                onChange={(e) => handleDateChange(month.id, 'opelSmPerc', parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Opel Consultant % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Satış Danışmanı (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-yellow-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.opelSdPerc || 0} 
                                onChange={(e) => handleDateChange(month.id, 'opelSdPerc', parseFloat(e.target.value) || 0)}
                              />
                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                          {/* Opel Support % */}
                          <div>
                            <span className="text-[11px] text-gray-500 font-medium mb-1 block">Destek Personeli (%)</span>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-yellow-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                value={month.opelSupportPerc || 0} 
                                onChange={(e) => handleDateChange(month.id, 'opelSupportPerc', parseFloat(e.target.value) || 0)}
                              />
                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                %
                              </div>
                            </div>
                          </div>

                        </div>
                        
                        {/* Opel Vehicle Category Specific Rules */}
                        <div className="mt-4 pt-3 border-t border-gray-800/60">
                           <label className="text-xs text-blue-400 font-semibold mb-3 block uppercase tracking-wider">Araç Tipi Baz Primleri & Sabit Ekip Tutarları</label>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              
                              {/* Binek Base % */}
                              <div>
                                <span className="text-[11px] text-gray-500 font-medium mb-1 block">Binek Baz Prim (%)</span>
                                <div className="relative">
                                  <input 
                                    type="number" step="0.1"
                                    className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/50 block w-full px-3 py-2 outline-none transition-all pl-9"
                                    value={month.opelPassengerBasePerc !== undefined ? month.opelPassengerBasePerc : 0.5} 
                                    onChange={(e) => handleDateChange(month.id, 'opelPassengerBasePerc', parseFloat(e.target.value) || 0)}
                                  />
                                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 font-medium text-xs">
                                    %
                                  </div>
                                </div>
                              </div>
                              
                              {/* Binek Team Fixed */}
                              <div>
                                <span className="text-[11px] text-gray-500 font-medium mb-1 block">Binek Sabit Ekip Tipi (TL)</span>
                                <div className="relative">
                                  <input 
                                    type="number"
                                    className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                    value={month.opelPassengerTeamFixed !== undefined ? month.opelPassengerTeamFixed : 6000} 
                                    onChange={(e) => handleDateChange(month.id, 'opelPassengerTeamFixed', parseInt(e.target.value) || 0)}
                                  />
                                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                    ₺
                                  </div>
                                </div>
                              </div>
                              
                              {/* Frontera Base % */}
                              <div>
                                <span className="text-[11px] text-gray-500 font-medium mb-1 block">Frontera Baz Prim (%)</span>
                                <div className="relative">
                                  <input 
                                    type="number" step="0.1"
                                    className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/50 block w-full px-3 py-2 outline-none transition-all pl-9"
                                    value={month.opelFronteraBasePerc !== undefined ? month.opelFronteraBasePerc : 1.0} 
                                    onChange={(e) => handleDateChange(month.id, 'opelFronteraBasePerc', parseFloat(e.target.value) || 0)}
                                  />
                                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 font-medium text-xs">
                                    %
                                  </div>
                                </div>
                              </div>
                              
                              {/* Frontera Team Fixed */}
                              <div>
                                <span className="text-[11px] text-gray-500 font-medium mb-1 block">Frontera Sabit Ekip Primi (TL)</span>
                                <div className="relative">
                                  <input 
                                    type="number"
                                    className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                    value={month.opelFronteraTeamFixed !== undefined ? month.opelFronteraTeamFixed : 6000} 
                                    onChange={(e) => handleDateChange(month.id, 'opelFronteraTeamFixed', parseInt(e.target.value) || 0)}
                                  />
                                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                    ₺
                                  </div>
                                </div>
                              </div>
                              
                              {/* HTA Base % */}
                              <div>
                                <span className="text-[11px] text-gray-500 font-medium mb-1 block">HTA (Ticari) Baz Prim (%)</span>
                                <div className="relative">
                                  <input 
                                    type="number" step="0.1"
                                    className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/50 block w-full px-3 py-2 outline-none transition-all pl-9"
                                    value={month.opelCommercialBasePerc !== undefined ? month.opelCommercialBasePerc : 1.0} 
                                    onChange={(e) => handleDateChange(month.id, 'opelCommercialBasePerc', parseFloat(e.target.value) || 0)}
                                  />
                                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 font-medium text-xs">
                                    %
                                  </div>
                                </div>
                              </div>
                              
                              {/* HTA Team Fixed */}
                              <div>
                                <span className="text-[11px] text-gray-500 font-medium mb-1 block">HTA (Ticari) Sabit Ekip Primi (TL)</span>
                                <div className="relative">
                                  <input 
                                    type="number"
                                    className="bg-gray-800/50 border border-gray-700/50 text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/50 block w-full px-3 py-2 outline-none transition-all pr-8"
                                    value={month.opelCommercialTeamFixed !== undefined ? month.opelCommercialTeamFixed : 10000} 
                                    onChange={(e) => handleDateChange(month.id, 'opelCommercialTeamFixed', parseInt(e.target.value) || 0)}
                                  />
                                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 font-medium text-xs">
                                    ₺
                                  </div>
                                </div>
                              </div>

                           </div>
                        </div>
                      </div>
                      )}
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
