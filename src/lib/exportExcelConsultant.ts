import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcelConsultant = async (data: any[], month: string, year: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Satis Danisman Raporu');

  const columns = [
    { header: 'VIN', key: 'VIN', width: 22 },
    { header: 'Marka', key: 'MARKA', width: 15 },
    { header: 'Product Line', key: 'Product Line', width: 25 },
    { header: 'Model Açıklama', key: 'MODEL_ACIKLAMA', width: 45 },
    { header: 'Satış Danışmanı', key: 'SATIS_DANISMANI', width: 25 },
    { header: 'Müşteri Ünvanı', key: 'MUSTERI_UNVAN', width: 35 },
    { header: 'Teklif Tarihi', key: 'TEKLIFTAR', width: 22 },
    { header: 'CSD Date', key: 'CSDDATE', width: 22 },
  ];

  worksheet.columns = columns;

  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // Blue header for contrast
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  data.forEach((row) => {
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Satis_Danisman_Raporu_${month}_${year}.xlsx`;
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};
