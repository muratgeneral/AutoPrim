"use client";

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Car, Code, FileSpreadsheet, Download } from 'lucide-react';
import { NetsisNewVehiclesTable } from '@/components/NetsisNewVehiclesTable';
import { exportToExcelNetsis } from '@/lib/exportExcelNetsis';

export default function NetsisNewVehiclesReport() {
  const [sirkod, setSirkod] = useState<string>("1"); // 1=Peugeot, 2=Citroen, 3=Opel
  const [selectedMonthId, setSelectedMonthId] = useState<string>("1");
  const [monthsData, setMonthsData] = useState<any[]>([]);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
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
    setWarning(null);

    try {
      // Calculate normal calendar dates for the selected month to filter TBLFATUIRS TARIH
      const year = new Date().getFullYear();
      const monthNum = parseInt(selectedMonthId, 10);
      
      const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
      // Get the last day of that month
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const res = await fetch(`/api/reports/netsis/new-vehicles?startDate=${startDate}&endDate=${endDate}&sirkod=${sirkod}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      const json = await res.json();
      
      if (json.error) {
         throw new Error(json.error);
      }
      
      setData(json.data || []);
      setSqlQuery(json.sqlQuery || null);
      if (json.warning) {
        setWarning(json.warning);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data || data.length === 0) return;
    const month = monthsData.find(m => m.id === selectedMonthId);
    if (!month) return;
    
    let brandName = "Peugeot";
    if (sirkod === "2") brandName = "Citroen";
    if (sirkod === "3") brandName = "Opel";

    exportToExcelNetsis(data, month.name, brandName);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050810] text-gray-200">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <FileSpreadsheet className="w-4 h-4" />
              Netsis Modülü (GIDA2026)
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Sıfır Araç Satışları</h1>
            <p className="text-gray-400 text-sm">Netsis veritabanı üzerinden çekilen resmi araç satış faturaları listesi.</p>
          </div>
          
          <div className="flex flex-wrap items-end gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800/80 shadow-lg w-full lg:w-auto shrink-0">
            {/* Brand Dropdown */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px] md:flex-none">
              <label className="text-xs text-gray-500 font-semibold ml-1">Marka (SIRKOD)</label>
              <div className="h-[38px] flex items-center bg-gray-800/80 border border-gray-700/50 rounded-xl px-3 focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50 transition-all">
                <Car className="w-5 h-5 text-emerald-400 mr-2 shrink-0" />
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
              <div className="h-[38px] flex items-center bg-gray-800/80 border border-gray-700/50 rounded-xl px-3 focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50 transition-all">
                <Calendar className="w-5 h-5 text-emerald-400 mr-2 shrink-0" />
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
              onClick={fetchData}
              disabled={loading || monthsData.length === 0}
              className="w-full md:w-auto px-6 h-[38px] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.15)] flex justify-center items-center shrink-0 cursor-pointer"
            >
              Verileri Getir
            </button>
          </div>
        </header>

        {warning && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl mb-6 flex items-center gap-3">
             <span className="bg-amber-500/20 p-2 rounded-lg">⚠️</span>
             <p>{warning}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="bg-red-500/20 p-2 rounded-lg">🚨</span>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="animate-in fade-in duration-700 delay-150 fill-mode-both">
          
          <div className="mt-8 mb-4 flex justify-between items-end">
             <h2 className="text-xl font-semibold text-white/90">Araç Listesi</h2>
             <button 
                onClick={handleExport}
                disabled={data.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#171f32] hover:bg-[#1e293b] border border-gray-700 hover:border-emerald-500/50 text-gray-200 text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                title="Tablodaki verileri Excel olarak indir"
              >
                <Download className="w-4 h-4 text-gray-400 group-hover:text-emerald-400" />
                Excel'e Aktar
              </button>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800/50 mt-6">
               <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
               <p className="text-gray-400 font-medium">10.10.1.34 - GIDA2026 sorgulanıyor, lütfen bekleyin...</p>
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
               <NetsisNewVehiclesTable data={data} />
             </>
          )}
        </main>
      </div>
    </div>
  );
}
