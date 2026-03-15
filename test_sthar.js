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

async function checkSthar() {
  try {
    let pool = await sql.connect(config);
    console.log("Looking up campaign amount in TBLSTHAR for 194014...");
    
    // Union to check both years for the chassis
    const result = await pool.request().query(`
      SELECT TOP 1 * FROM (
        SELECT * FROM GIDA2025..TBLSTHAR WHERE EKALAN LIKE '%194014%' AND EKALAN_NEDEN='1'
        UNION ALL
        SELECT * FROM GIDA2026..TBLSTHAR WHERE EKALAN LIKE '%194014%' AND EKALAN_NEDEN='1'
      ) t
    `);
    
    console.log("Campaign records:");
    console.log(JSON.stringify(result.recordset, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSthar();
