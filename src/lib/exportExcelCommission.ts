import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelCommission = async (data: any[], startDate: string, endDate: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Prim Raporu');

  // Define Columns
  worksheet.columns = [
    { header: 'Sıra', key: 'Sıra', width: 10 },
    { header: 'Şasi No', key: 'Şasi No', width: 20 },
    { header: 'Model', key: 'Model', width: 25 },
    { header: 'Net Tutar', key: 'Net Tutar', width: 25 },
    { header: 'Promosyon', key: 'Promosyon', width: 25 },
    { header: 'Kampanya', key: 'Kampanya', width: 40 },
    { header: 'Kampanya Toplamı', key: 'Kampanya Toplamı', width: 25 },
    { header: 'Prime Esas Tutar', key: 'Prime Esas Tutar', width: 25 },
    { header: 'Satış Danışmanı', key: 'Satış Danışmanı', width: 30 },
    { header: 'Kanal', key: 'Kanal', width: 15 },
    { header: 'Bayi Prim', key: 'Bayi Prim', width: 20 },
    { header: 'SD Prim', key: 'SD Prim', width: 20 },
    { header: 'SM Prim', key: 'SM Prim', width: 20 },
    { header: 'Destek Prim', key: 'Destek Prim', width: 20 },
    { header: 'Bonus Prim', key: 'Bonus Prim', width: 20 },
  ];

  // Header Styling
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B5CF6' }, // Purple tone for Commission Report
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Calculate totals
  let totalNett = 0;
  let totalPromo = 0;
  let totalKampanyaSum = 0;
  let totalPrimeEsas = 0;
  
  let totalBayiPrim = 0;
  let totalSdPrim = 0;
  let totalSmPrim = 0;
  let totalDestekPrim = 0;
  let totalBonusPrim = 0;

  // Add Data
  data.forEach((row) => {
    const nett = row['Net Tutar'] || 0;
    const promo = row['Promosyon'] || 0;
    const kampToplam = row['Kampanya Toplamı'] || 0;
    const primeEsas = nett - promo - kampToplam;
    
    totalNett += nett;
    totalPromo += promo;
    totalKampanyaSum += kampToplam;
    totalPrimeEsas += primeEsas;
    
    totalBayiPrim += row['Bayi Prim'] || 0;
    totalSdPrim += row['SD Prim'] || 0;
    totalSmPrim += row['SM Prim'] || 0;
    totalDestekPrim += row['Destek Prim'] || 0;
    totalBonusPrim += row['Bonus Prim'] || 0;

    const addedRow = worksheet.addRow({
      'Sıra': row['Sira'],
      'Şasi No': row['Şasi No'],
      'Model': row['Model'],
      'Net Tutar': nett,
      'Promosyon': promo,
      'Kampanya': row['Kampanya'] || '',
      'Kampanya Toplamı': kampToplam,
      'Prime Esas Tutar': primeEsas,
      'Satış Danışmanı': row['Satış Danışmanı'],
      'Kanal': row['Kanal'] || '-',
      'Bayi Prim': row['Bayi Prim'] || 0,
      'SD Prim': row['SD Prim'] || 0,
      'SM Prim': row['SM Prim'] || 0,
      'Destek Prim': row['Destek Prim'] || 0,
      'Bonus Prim': row['Bonus Prim'] || 0,
    });

    // Formatting currency cells
    const nettCell = addedRow.getCell('Net Tutar');
    nettCell.numFmt = '#,##0.00_"₺"';
    
    const promoCell = addedRow.getCell('Promosyon');
    promoCell.numFmt = '#,##0.00_"₺"';
    
    const kampCell = addedRow.getCell('Kampanya Toplamı');
    kampCell.numFmt = '#,##0.00_"₺"';
    
    const primeCell = addedRow.getCell('Prime Esas Tutar');
    primeCell.numFmt = '#,##0.00_"₺"';
    
    ['Bayi Prim', 'SD Prim', 'SM Prim', 'Destek Prim', 'Bonus Prim'].forEach((col) => {
      const cell = addedRow.getCell(col);
      cell.numFmt = '#,##0.00_"₺"';
    });
  });

  // Add Totals Row
  const totalRow = worksheet.addRow({
    'Sıra': '',
    'Şasi No': '',
    'Model': 'TOPLAM',
    'Net Tutar': totalNett,
    'Promosyon': totalPromo,
    'Kampanya': '',
    'Kampanya Toplamı': totalKampanyaSum,
    'Prime Esas Tutar': totalPrimeEsas,
    'Satış Danışmanı': '',
    'Kanal': '',
    'Bayi Prim': totalBayiPrim,
    'SD Prim': totalSdPrim,
    'SM Prim': totalSmPrim,
    'Destek Prim': totalDestekPrim,
    'Bonus Prim': totalBonusPrim,
  });

  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };
    
    if (colNumber === 4 || colNumber === 5 || colNumber === 7 || colNumber === 8 || colNumber >= 10) {
       cell.numFmt = '#,##0.00_"₺"';
    }
  });

  // Add Metadata Title
  worksheet.insertRow(1, [`Prim Raporu (${startDate} - ${endDate})`]);
  worksheet.mergeCells('A1:O1');
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
  saveAs(blob, `Prim_Raporu_${startDate}_${endDate}.xlsx`);
};
