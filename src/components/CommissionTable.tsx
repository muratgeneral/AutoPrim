import React from 'react';

interface Props {
  data: any[];
}

export function CommissionTable({ data }: Props) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#0b101e] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400">
              <th className="px-6 py-4 font-semibold">Sıra</th>
              <th className="px-6 py-4 font-semibold">Şasi No</th>
              <th className="px-6 py-4 font-semibold">Model</th>
              <th className="px-6 py-4 font-semibold text-right">Net Tutar</th>
              <th className="px-6 py-4 font-semibold text-right">Promosyon</th>
              <th className="px-6 py-4 font-semibold">Kampanya</th>
              <th className="px-6 py-4 font-semibold text-right">Kampanya Toplamı</th>
              <th className="px-6 py-4 font-semibold text-right">Prime Esas Tutar</th>
              <th className="px-6 py-4 font-semibold">Satış Danışmanı</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {data.map((row, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-800/40 transition-colors text-sm text-gray-300"
              >
                <td className="px-6 py-4 font-medium text-gray-400">
                  {row['Sira'] || (index + 1)}
                </td>
                <td className="px-6 py-4 font-medium text-purple-400">
                  {row['Şasi No']}
                </td>
                <td className="px-6 py-4">
                  {row['Model']}
                </td>
                <td className="px-6 py-4 text-right font-medium text-blue-400">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row['Net Tutar'] || 0)}
                </td>
                <td className="px-6 py-4 text-right font-emerald text-emerald-400">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row['Promosyon'] || 0)}
                </td>
                <td className="px-6 py-4 font-medium text-xs text-gray-400 max-w-[200px] truncate" title={row['Kampanya']}>
                  {row['Kampanya'] || '-'}
                </td>
                <td className="px-6 py-4 text-right font-medium text-purple-400">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row['Kampanya Toplamı'] || 0)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-amber-500">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format((row['Net Tutar'] || 0) - (row['Promosyon'] || 0) - (row['Kampanya Toplamı'] || 0))}
                </td>
                <td className="px-6 py-4 font-medium text-gray-200">
                  {row['Satış Danışmanı']}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-900/50 p-4 border-t border-gray-800 text-xs text-center text-gray-500">
        Gösterilen {data.length} kayıt. Sadece önizlemedir, Excel çıktısı veri setinin tamamını içerir.
      </div>
    </div>
  );
}
