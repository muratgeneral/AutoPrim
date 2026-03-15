const sql = require('mssql');

const sqlConfig = {
  user: 'alpata',
  password: 'master',
  database: 'GIDA2026',
  server: '10.10.1.64',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function testMagicFilter() {
  try {
    let pool = await sql.connect(sqlConfig);
    
    // Check how many invoices match this specific string in ACIK7
    let qMagic = `
      SELECT COUNT(DISTINCT m.FATIRS_NO) as MagicCount
      FROM GIDA2026..TBLFATUIRS m
      JOIN GIDA2026..TBLFATUEK e ON m.FATIRS_NO = e.FATIRSNO
      WHERE m.FTIRSIP = '1' 
        AND m.SUBE_KODU = 6 
        AND m.PROJE_KODU = '98-91' 
        AND m.TARIH >= '2026-01-01' 
        AND m.TARIH <= '2026-01-31'
        AND e.ACIK13 IS NOT NULL 
        AND e.ACIK13 != ''
        AND e.ACIK7 LIKE '%ARAÇ SATIS FATURASI TEKLIF NO%'
    `;
    
    let resMagic = await pool.request().query(qMagic);
    console.log("Count with Magic Filter:", resMagic.recordset[0].MagicCount);
    
    if (resMagic.recordset[0].MagicCount > 0) {
        let qList = `
          SELECT TOP 10 
            m.FATIRS_NO, 
            e.ACIK13 as Chassis,
            e.ACIK7
          FROM GIDA2026..TBLFATUIRS m
          JOIN GIDA2026..TBLFATUEK e ON m.FATIRS_NO = e.FATIRSNO
          WHERE m.FTIRSIP = '1' 
            AND m.SUBE_KODU = 6 
            AND m.PROJE_KODU = '98-91' 
            AND m.TARIH >= '2026-01-01' 
            AND m.TARIH <= '2026-01-31'
            AND e.ACIK13 IS NOT NULL 
            AND e.ACIK13 != ''
            AND e.ACIK7 LIKE '%ARAÇ SATIS FATURASI TEKLIF NO%'
        `;
        let resList = await pool.request().query(qList);
        console.table(resList.recordset);
    }
    await pool.close();
  } catch (err) {
    console.log(`Failed: ${err.message}`);
  }
}

testMagicFilter();
