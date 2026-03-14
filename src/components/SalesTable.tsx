import React from 'react';

type SalesTableProps = {
  data: any[];
};

export const SalesTable: React.FC<SalesTableProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="text-center py-12 text-gray-400">Veri bulunamadı. Lütfen başka bir ay seçin.</div>;
  }

  const columns = [
    'Sira', 'VIN', 'Product Line', 'Dealer Name', 'Invoice Date', 'Vehicle Nett Amount', 'Promotion Amount', 'Total Nett Amount', 'HT Price'
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
            <tr key={idx} className="hover:bg-blue-900/20 transition-colors">
              <td className="px-6 py-3">{idx + 1}</td>
              <td className="px-6 py-3 font-mono text-gray-300">{row.VIN}</td>
              <td className="px-6 py-3">{row['Product Line']}</td>
              <td className="px-6 py-3">{row['Dealer Name']}</td>
              <td className="px-6 py-3">{row['Invoice Date'] || '-'}</td>
              <td className="px-6 py-3 text-right tabular-nums">{row['Vehicle Nett Amount']?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
              <td className="px-6 py-3 text-right tabular-nums text-green-400">{row['Promotion Amount']?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
              <td className="px-6 py-3 text-right tabular-nums font-semibold text-blue-300">{row['Total Nett Amount']?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
              <td className="px-6 py-3 text-right tabular-nums">{row['HT Price']?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
