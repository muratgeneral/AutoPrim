import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelNetsis = async (data: any[], title: string, sirkodStr: string) => {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Netsis Satışları');

  // Dynamically generate column headers based on data object keys
  const keys = Object.keys(data[0]);
  
  worksheet.columns = [
    { header: 'Sıra', key: 'Sıra', width: 10 },
    ...keys.map(key => ({
      header: key,
      key: key,
      // Adjust width based on typical data content
      width: key.toLowerCase().includes('tutar') || key.toLowerCase().includes('toplam') || key.toLowerCase().includes('bedel') || key.toLowerCase() === 'araç' || key.toLowerCase() === 'nakli̇ye' || key.toLowerCase() === 'ötv' || key.toLowerCase().includes('kar') ? 20 
             : key.toLowerCase().includes('isim') || key.toLowerCase().includes('model') ? 35 
             : key.toLowerCase().includes('şasi') || key.toLowerCase().includes('sasi') ? 25
             : 15
    }))
  ];

  // Header Styling
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }, // Emerald tone for Netsis Report
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Calculate totals for any numeric column if needed
  const totals: Record<string, number> = {};
  keys.forEach(k => {
    const isNumeric = Object.values(data).some(row => typeof row[k] === 'number' && !k.toLowerCase().includes('kodu'));
    if (isNumeric) totals[k] = 0;
  });

  // Add Data
  data.forEach((row, index) => {
    const rowData: Record<string, any> = { 'Sıra': index + 1 };
    
    keys.forEach(k => {
      let val = row[k];
      
      // Calculate totals
      if (typeof val === 'number' && totals[k] !== undefined) {
         totals[k] += val;
      }
      
      // Format dates simply as strings to prevent Excel timezone shifts
      const lower = k.toLowerCase();
      if (typeof val === 'string' && (lower.includes('tarih') || lower.includes('date'))) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
             val = d.toLocaleDateString('tr-TR');
          }
      }
      
      rowData[k] = val;
    });

    const addedRow = worksheet.addRow(rowData);

    // Format money cells
    keys.forEach(k => {
       if (totals[k] !== undefined) {
          const cell = addedRow.getCell(k);
          cell.numFmt = '#,##0.00_"₺"';
       }
    });
  });

  // Add Totals Row if we tracked any numeric currencies
  if (Object.keys(totals).length > 0) {
    const totalRowData: Record<string, any> = { 'Sıra': '', 'FaturaNo': 'TOPLAM' };
    keys.forEach(k => {
       if (totals[k] !== undefined) {
          totalRowData[k] = totals[k];
       } else if (k !== 'FaturaNo') {
          totalRowData[k] = '';
       }
    });
    
    const totalRow = worksheet.addRow(totalRowData);

    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' }
      };
      
      // Apply money format to tracked columns
      const headerKey = worksheet.columns[colNumber - 1].key as string;
      if (totals[headerKey] !== undefined) {
         cell.numFmt = '#,##0.00_"₺"';
      }
    });
  }

  // Add Metadata Title
  worksheet.insertRow(1, [`${sirkodStr} Netsis Raporu (${title})`]);
  const totalCols = keys.length + 1; // +1 for Sira
  worksheet.mergeCells(1, 1, 1, totalCols);
  
  const titleCell = worksheet.getCell('A1');
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E7EB' }
  };
  worksheet.getRow(1).height = 30;

  // Generate and Save excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Netsis_${sirkodStr}_${title.replace(/ /g, '_')}.xlsx`);
};
