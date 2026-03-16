import React from 'react';

type SalesConsultantTableProps = {
  data: any[];
};

export const SalesConsultantTable: React.FC<SalesConsultantTableProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="text-center py-12 text-gray-400">Veri bulunamadı. Lütfen başka bir ay seçin.</div>;
  }

  const columns = [
    'Sira', 'VIN', 'Marka', 'Product Line', 'Satış Danışmanı', 'Müşteri Ünvanı', 'Teklif Tarihi', 'CSD Date', 'Teslim Tarihi'
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/40 backdrop-blur-sm shadow-xl mt-6">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-900/50 text-gray-300 border-b border-gray-700/50">
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col" className="px-6 py-4 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50">
          {data.map((row, idx) => (
            <tr key={idx} className={`transition-colors border-b border-gray-800/50 last:border-0 hover:bg-white/5 ${row.TAVMAKTAR ? 'bg-emerald-900/30' : ''}`}>
              <td className="px-6 py-3">{idx + 1}</td>
              <td className="px-6 py-3 font-mono text-gray-300">{row.VIN}</td>
              <td className="px-6 py-3">{row.MARKA}</td>
              <td className="px-6 py-3">{row['Product Line']}</td>
              <td className="px-6 py-3 font-medium text-emerald-400">{row.SATIS_DANISMANI}</td>
              <td className="px-6 py-3 text-gray-300">{row.MUSTERI_UNVAN}</td>
              <td className="px-6 py-3">{row.TEKLIFTAR ? new Date(row.TEKLIFTAR).toLocaleDateString('tr-TR') : '-'}</td>
              <td className="px-6 py-3">{row.CSDDATE ? new Date(row.CSDDATE).toLocaleDateString('tr-TR') : '-'}</td>
              <td className="px-6 py-3 font-medium text-emerald-300">{row.TAVMAKTAR ? new Date(row.TAVMAKTAR).toLocaleDateString('tr-TR') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
