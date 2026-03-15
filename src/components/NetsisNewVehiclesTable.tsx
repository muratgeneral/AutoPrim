import React from 'react';

interface Props {
  data: any[];
}

export function NetsisNewVehiclesTable({ data }: Props) {
  if (!data || data.length === 0) return null;

  // Dynamically generate headers from the first row's keys so it adapts seamlessly depending on which view answers
  const headers = Object.keys(data[0]).filter(k => k !== 'rowNum');

  return (
    <div className="bg-[#0b101e] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400">
              <th className="px-6 py-4 font-semibold">Sıra</th>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {data.map((row, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-800/40 transition-colors text-sm text-gray-300"
              >
                <td className="px-6 py-4 font-medium text-gray-400">
                  {index + 1}
                </td>
                {headers.map((h, i) => {
                  let val = row[h];
                  
                  // Simple Date Formatter - only apply to Date/Tarih columns
                  const colName = h.toLowerCase();
                  if (typeof val === 'string' && (colName.includes('tarih') || colName.includes('date'))) {
                     const d = new Date(val);
                     if (!isNaN(d.getTime())) {
                       val = d.toLocaleDateString('tr-TR');
                     }
                  }
                  
                  // Simple Currency Formatter
                  const isCurrency = h.toLowerCase().includes('tutar') || h.toLowerCase().includes('toplam') || h.toLowerCase().includes('kdv') || h.toLowerCase().includes('bedel') || h.toLowerCase() === 'araç' || h.toLowerCase() === 'nakli̇ye' || h.toLowerCase() === 'ötv' || h.toLowerCase() === 'flexcare' || h.toLowerCase().includes('karı');
                  if (typeof val === 'number' && isCurrency) {
                     val = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
                  }

                  return (
                    <td key={i} className={`px-6 py-4 whitespace-nowrap ${isCurrency ? 'text-right text-emerald-400 font-medium' : ''}`}>
                      {val || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-900/50 p-4 border-t border-gray-800 text-xs text-center text-gray-500">
        Gösterilen {data.length} kayıt.
      </div>
    </div>
  );
}
