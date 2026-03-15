const sql = require('mssql');

const config = {
  user: 'alpata',
  password: 'master',
  database: 'GIDA2026',
  server: '10.10.1.64',
  options: {
        encrypt: false,
        trustServerCertificate: true,
      },
};

async function run() {
  try {
    let pool = await sql.connect(config);
    // Let's pick a known chassis from our January results
    // We want to find the Alış Faturası for a chassis. Let's look up any FATIRS_NO or ACIK13 matching.
    
    console.log("Looking up purchase invoice for chassis VR3EDYHP3SJ754371");
    // Union to check both years for the chassis in TBLFATUEK but with FTIRSIP from TBLFATUIRS
    const result = await pool.request().query(`
      SELECT m.FATIRS_NO, m.FTIRSIP, m.TARIH, e.ACIK13, e.ACIK2, m.SUBE_KODU, m.PROJE_KODU
      FROM GIDA2026..TBLFATUIRS m
      JOIN GIDA2026..TBLFATUEK e ON m.FATIRS_NO = e.FATIRSNO
      WHERE e.ACIK13 = 'VR3EDYHP3SJ754371'
        AND m.FTIRSIP != '1'

      UNION ALL

      SELECT m.FATIRS_NO, m.FTIRSIP, m.TARIH, e.ACIK13, e.ACIK2, m.SUBE_KODU, m.PROJE_KODU
      FROM GIDA2025..TBLFATUIRS m
      JOIN GIDA2025..TBLFATUEK e ON m.FATIRS_NO = e.FATIRSNO
      WHERE e.ACIK13 = 'VR3EDYHP3SJ754371'
        AND m.FTIRSIP != '1'
    `);
    
    console.log("Purchase Invoices:");
    console.dir(result.recordset);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
