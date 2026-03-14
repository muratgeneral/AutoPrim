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
  });

  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };
    
    if (colNumber === 4 || colNumber === 5 || colNumber === 7 || colNumber === 8) {
       cell.numFmt = '#,##0.00_"₺"';
    }
  });

  // Add Metadata Title
  worksheet.insertRow(1, [`Prim Raporu (${startDate} - ${endDate})`]);
  worksheet.mergeCells('A1:I1');
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
