import React from 'react';
import { X, CarFront } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

export function ProductLineSummaryModal({ isOpen, onClose, data }: Props) {
  if (!isOpen) return null;

  const summary = data.reduce((acc, curr) => {
    const line = curr['Product Line'] || 'Bilinmeyen Model';
    acc[line] = (acc[line] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSummary = (Object.entries(summary) as [string, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b101e] border border-gray-700/50 rounded-2xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <CarFront className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-gray-100">Model Özeti (Product Line)</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-800">
             <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {sortedSummary.map(([model, count]) => (
            <div key={model} className="flex justify-between items-center p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50 transition-colors">
               <span className="font-medium text-gray-200">{model}</span>
               <span className="bg-blue-600/20 border border-blue-500/20 text-blue-400 py-1 px-3 rounded-lg font-bold text-sm shadow-inner">{count}</span>
            </div>
          ))}
          {sortedSummary.length === 0 && (
            <div className="text-center text-gray-500 py-8 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed">
              Bu tarihler arasında araç bulunamadı.
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
           <button onClick={onClose} className="px-5 py-2 min-w-[100px] bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl border border-gray-700 transition-all font-medium text-sm">
             Kapat
           </button>
        </div>
      </div>
    </div>
  );
}
