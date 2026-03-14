"use client";

import { useState, useEffect } from 'react';
import { CommissionTable } from './CommissionTable';
import { exportToExcelCommission } from '@/lib/exportExcelCommission';
import { Calendar, Download, RefreshCw, BadgeDollarSign, Car, Code } from 'lucide-react';
import { ProductLineSummaryModal } from './ProductLineSummaryModal';

export default function CommissionReport() {
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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          setMonthsData(settings);
          
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
      const res = await fetch(`/api/sales/commission?csdStartDate=${month.csdStartDate}&csdEndDate=${month.csdEndDate}&offerStartDate=${month.offerStartDate}&offerEndDate=${month.offerEndDate}&sirkod=${sirkod}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.error) {
         throw new Error(json.error);
      }
      setData(json.data || []);
      setSqlQuery(json.sqlQuery || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchClick = () => {
    fetchData();
  };

  const handleExport = () => {
    const month = monthsData.find(m => m.id === selectedMonthId);
    const monthName = month ? month.name : "Rapor";
    exportToExcelCommission(data, monthName, "");
  };

  if (!mounted) {
    return null;
  }

  const totalSalesVolume = data.reduce((acc, curr) => acc + (curr['Vehicle Nett Amount'] || 0), 0);
  const totalPromotion = data.reduce((acc, curr) => acc + (curr['Promotion Amount'] || 0), 0);

  return (
    <div className="min-h-screen bg-[#050810] text-gray-200">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <BadgeDollarSign className="w-4 h-4" />
              Muhasebe
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Prim Raporu</h1>
            <p className="text-gray-400 text-sm">Araç başına net tutarlar ve promosyonlar ile personel bazlı rapor.</p>
          </div>
          
          <div className="flex flex-wrap items-end gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800/80 shadow-lg w-full lg:w-auto shrink-0">
            
            {/* Brand Dropdown */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px] md:flex-none">
              <label className="text-xs text-gray-500 font-semibold ml-1">Marka (SIRKOD)</label>
              <div className="h-[38px] flex items-center bg-gray-800/80 border border-gray-700/50 rounded-xl px-3 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500/50 transition-all">
                <Car className="w-5 h-5 text-purple-400 mr-2 shrink-0" />
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
              <div className="h-[38px] flex items-center bg-gray-800/80 border border-gray-700/50 rounded-xl px-3 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500/50 transition-all">
                <Calendar className="w-5 h-5 text-purple-400 mr-2 shrink-0" />
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
              className="w-full md:w-auto px-6 h-[38px] bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.15)] flex justify-center items-center shrink-0"
            >
              Verileri Getir
            </button>
          </div>
        </header>

        {/* Loading / Error States */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="bg-red-500/20 p-2 rounded-lg">🚨</span>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="animate-in fade-in duration-700 delay-150 fill-mode-both">
          
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setShowSummary(true)}
            className="text-left bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-500/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-gray-400 text-sm font-medium">Satılan Araç Sayısı</h3>
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity">Model Özeti</span>
            </div>
            <p className="text-3xl font-bold text-gray-100 group-hover:text-purple-400 transition-colors">{data.length}</p>
          </button>
          <div className="bg-gradient-to-br from-blue-900/40 to-gray-900/80 rounded-2xl p-6 border border-blue-800/30 backdrop-blur-md shadow-lg">
            <h3 className="text-blue-300/80 text-sm font-medium mb-1">Toplam Araç Net Tutarı</h3>
            <p className="text-3xl font-bold text-blue-100">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalSalesVolume)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/40 to-gray-900/80 rounded-2xl p-6 border border-emerald-800/30 backdrop-blur-md shadow-lg">
            <h3 className="text-emerald-300/80 text-sm font-medium mb-1">Toplam PromosyonTutarı</h3>
            <p className="text-3xl font-bold text-emerald-100">
               {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(totalPromotion)}
            </p>
          </div>
        </div>

          <div className="mt-8 mb-4 flex justify-between items-end">
             <h2 className="text-xl font-semibold text-white/90">Araç Listesi</h2>
             <button 
                onClick={handleExport}
                disabled={data.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#171f32] hover:bg-[#1e293b] border border-gray-700 text-gray-200 text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                <Download className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
                Excel'e Aktar
              </button>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800/50 mt-6">
               <RefreshCw className="w-10 h-10 text-purple-500 animate-spin mb-4" />
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
               <CommissionTable data={data} />
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
