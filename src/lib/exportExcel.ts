import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (data: any[], month: string, year: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  // Define exactly as the image format specified
  const columns = [
    { header: 'VIN', key: 'VIN', width: 22 },
    { header: 'Sira', key: 'Sira', width: 10 },
    { header: 'Product Line', key: 'Product Line', width: 25 },
    { header: 'Class', key: 'Class', width: 10 },
    { header: 'Commercial Denomination Name', key: 'Commercial Denomination Name', width: 45 },
    { header: 'VIN_2', key: 'VIN_2', width: 22 },
    { header: 'Model Year', key: 'Model Year', width: 15 },
    { header: 'Dealer Id', key: 'Dealer Id', width: 15 },
    { header: 'Dealer Name', key: 'Dealer Name', width: 20 },
    { header: 'Invoice Date', key: 'Invoice Date', width: 15 },
    { header: 'Invoice No', key: 'Invoice No', width: 15 },
    { header: 'Preprinted Invoice Number', key: 'Preprinted Invoice Number', width: 25 },
    { header: 'Payment Term Date', key: 'Payment Term Date', width: 20 },
    { header: 'Free Interest Days', key: 'Free Interest Days', width: 15 },
    { header: 'Vehicle Nett Amount', key: 'Vehicle Nett Amount', width: 25, style: { numFmt: '#,##0.00' } },
    { header: 'Options Nett Amount', key: 'Options Nett Amount', width: 25, style: { numFmt: '#,##0.00' } },
    { header: 'Total Nett Amount', key: 'Total Nett Amount', width: 25, style: { numFmt: '#,##0.00' } },
    { header: 'HT Price', key: 'HT Price', width: 20, style: { numFmt: '#,##0.00' } },
    { header: 'Cash Payment Discount', key: 'Cash Payment Discount', width: 25, style: { numFmt: '#,##0.00' } },
    { header: 'Promotion Amount', key: 'Promotion Amount', width: 20, style: { numFmt: '#,##0.00' } },
  ];

  worksheet.columns = columns;

  // Style the header row
  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF000000' } // Black bg as in image
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' }, // White text
      bold: true
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Add data
  data.forEach((row, index) => {
    worksheet.addRow({
      ...row,
      Sira: index + 1, // Ensure sequence is correct
      VIN_2: row['VIN'] // The SQL duplicates this, map it safely
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Save file
  const fileName = `Dealer_Sales_Report_${month}_${year}.xlsx`;
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};
