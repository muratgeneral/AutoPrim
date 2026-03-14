"use client";

import React, { useState, useEffect } from 'react';
import { SalesTable } from './SalesTable';
import { exportToExcel } from '@/lib/exportExcel';
import { Calendar, Download, RefreshCw, Car, Code } from 'lucide-react';
import { ProductLineSummaryModal } from './ProductLineSummaryModal';

export default function Dashboard() {
  const [sirkod, setSirkod] = useState<string>("1");
  const [selectedMonthId, setSelectedMonthId] = useState<string>("1");
  const [monthsData, setMonthsData] = useState<any[]>([]);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);

  const pad = (num: number) => num < 10 ? '0' + num : num;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          setMonthsData(settings);
          
          // Optionally auto-select current month (1-12)
          const currentMonth = new Date().getMonth() + 1;
          setSelectedMonthId(currentMonth.toString());
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setMounted(true);
      }
    };
    
    loadSettings();
  }, []);

  const fetchData = async () => {
    if (!selectedMonthId || monthsData.length === 0) return;
    
    const month = monthsData.find(m => m.id === selectedMonthId);
    if (!month) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sales?csdStartDate=${month.csdStartDate}&csdEndDate=${month.csdEndDate}&offerStartDate=${month.offerStartDate}&offerEndDate=${month.offerEndDate}&sirkod=${sirkod}`);
      if (!res.ok) throw new Error('API request failed');
      const responseBody = await res.json();
      if (responseBody.error) throw new Error(responseBody.error);
      setData(responseBody.data || []);
      setSqlQuery(responseBody.sqlQuery || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Removed automatic fetching
  // useEffect(() => {
  //   if (mounted) {
  //     fetchData();
  //   }
  // }, [startDate, endDate, mounted]);

  const handleFetchClick = () => {
    fetchData();
  };

  const handleExport = () => {
    const month = monthsData.find(m => m.id === selectedMonthId);
    const monthName = month ? month.name : "Rapor";
    exportToExcel(data, monthName, "");
  };

  const totalSalesVolume = data.reduce((acc, curr) => acc + (curr['Total Nett Amount'] || 0), 0);

  if (!mounted) {
    return null; // Prevents hydration mismatch by not rendering until client is ready
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-gray-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                Dealer Sales Overview
              </h1>
              <p className="text-sm text-gray-400">Export and analyze vehicle invoice data.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-end gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800/80 shadow-lg w-full lg:w-auto shrink-0">
            
            {/* Brand Dropdown */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px] md:flex-none">
              <label className="text-xs text-gray-500 font-semibold ml-1">Marka (SIRKOD)</label>
              <div className="h-[38px] flex items-center bg-gray-800/80 border border-gray-700/50 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
                <Car className="w-5 h-5 text-blue-400 mr-2 shrink-0" />
                <select 
                  className="bg-transparent text-gray-200 text-sm outline-none w-full appearance-none cursor-pointer"
                  value={sirkod}
                  onChange={(e) => setSirkod(e.target.value)}
                >
                  <option value="1" className="bg-gray-800">Peugeot</option>
                  <option value="2" className="bg-gray-800">Citroen</option>
                  <option value="3" className="bg-gray-800">Opel</option>
                </select>
              </div>
            </div>

            {/* Month Dropdown */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px] md:flex-none">
              <label className="text-xs text-gray-500 font-semibold ml-1">Rapor Ayı</label>
              <div className="h-[38px] flex items-center bg-gray-800/80 border border-gray-700/50 rounded-xl px-3 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all">
                <Calendar className="w-5 h-5 text-blue-400 mr-2 shrink-0" />
                <select 
                  className="bg-transparent text-gray-200 text-sm outline-none w-full appearance-none cursor-pointer"
                  value={selectedMonthId}
                  onChange={(e) => setSelectedMonthId(e.target.value)}
                  disabled={monthsData.length === 0}
                >
                  {monthsData.length === 0 ? (
                    <option value="">Yükleniyor...</option>
                  ) : (
                    monthsData.map((m) => (
                      <option key={m.id} value={m.id} className="bg-gray-800">{m.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleFetchClick}
              disabled={loading || monthsData.length === 0}
              className="w-full md:w-auto px-6 h-[38px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.15)] flex justify-center items-center shrink-0"
            >
              Verileri Getir
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setShowSummary(true)}
            className="text-left bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-gray-400 text-sm font-medium">Listelenen Teklif / Araç Sayısı</h3>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity">Model Özeti</span>
            </div>
            <p className="text-3xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">{data.length}</p>
          </button>
          <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/80 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-md shadow-lg">
            <h3 className="text-blue-300/80 text-sm font-medium mb-1">Total Monthly Nett Volume</h3>
            <p className="text-3xl font-bold text-blue-100">
              {totalSalesVolume.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-lg text-blue-300">₺</span>
            </p>
          </div>
          <div className="flex items-center justify-end">
             <button 
                onClick={handleExport}
                disabled={data.length === 0 || loading}
                className="flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:shadow-none cursor-pointer"
              >
                <Download className="w-5 h-5" />
                Export to Excel
             </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="relative min-h-[400px]">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-xl mb-6">
              Error fetching data: {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800/50 mt-6">
               <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
               <p className="text-gray-400 font-medium">Veritabani sorgulanıyor, lütfen bekleyin...</p>
            </div>
          ) : (
             <>
               {sqlQuery && (
                 <div className="mb-4">
                   <button 
                     onClick={() => setShowSql(!showSql)} 
                     className="text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1.5 transition-colors bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50"
                   >
                     <Code className="w-3.5 h-3.5" />
                     {showSql ? "Geliştirici: SQL Sorgusunu Gizle" : "Geliştirici: SQL Sorgusunu Göster"}
                   </button>
                   {showSql && (
                     <div className="mt-2 bg-[#050810]/80 p-5 rounded-xl border border-gray-700/80 shadow-inner">
                        <pre className="text-[11px] leading-relaxed text-emerald-400 font-mono whitespace-pre-wrap overflow-x-auto">
                          {sqlQuery}
                        </pre>
                     </div>
                   )}
                 </div>
               )}
               <SalesTable data={data} />
             </>
          )}
        </main>
        
        <ProductLineSummaryModal 
          isOpen={showSummary} 
          onClose={() => setShowSummary(false)} 
          data={data} 
        />
        
      </div>
    </div>
  );
}
