const sql = require('mssql');
const config = {
  user: 'alpata',
  password: 'master',
  database: 'master',
  server: '10.10.1.64',
  requestTimeout: 120000,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function checkCashPaymentDiscount() {
  try {
    const pool = await sql.connect(config);
    const vin = 'VF3YDG6F8SG065660';

    const query = `
      SELECT 
          ISNULL(inv_agg.SumISKONTO, 0) AS [Cash Payment Discount],
          ISNULL(a.DISTPROMTUT, 0) AS [Promotion Amount]
      FROM OPENQUERY([37.131.251.91, 10168], 'SELECT SASINO, SIRKOD FROM peugeotdms.dbo.ATEKLIF0 WHERE SASINO = ''${vin}''') t
      JOIN OPENQUERY([37.131.251.91, 10168], 'SELECT SASINO, SIRKOD, DISTPROMTUT FROM peugeotdms.dbo.AARAC0 WHERE SASINO = ''${vin}''') a
          ON a.SASINO = t.SASINO AND a.SIRKOD = t.SIRKOD
      OUTER APPLY (
          SELECT TOP 1 fm_sub.FATNO
          FROM OPENQUERY([37.131.251.91, 10168], 'SELECT FATNO, FATTAR, EFATNO FROM peugeotdms.dbo.UFATMAS0 WHERE EFATNO LIKE ''PE0%''') fm_sub
          JOIN OPENQUERY([37.131.251.91, 10168], 'SELECT FATNO, SASINO FROM peugeotdms.dbo.UFATDET0 WHERE SASINO = ''${vin}''') fd_sub 
              ON fm_sub.FATNO = fd_sub.FATNO
          ORDER BY fm_sub.FATTAR DESC, fm_sub.FATNO DESC
      ) fm
      OUTER APPLY (
          SELECT SUM(fd_agg.ISKONTO) AS SumISKONTO
          FROM OPENQUERY([37.131.251.91, 10168], 'SELECT FATNO, SASINO, ISKONTO FROM peugeotdms.dbo.UFATDET0 WHERE SASINO = ''${vin}''') fd_agg
          WHERE fd_agg.FATNO = fm.FATNO AND fd_agg.SASINO = a.SASINO
      ) inv_agg
    `;
    const res = await pool.request().query(query);
    console.log(`\nReport Query Calculation for VIN ${vin}:`);
    console.log(JSON.stringify(res.recordset, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkCashPaymentDiscount();
