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
    
    const result = await pool.request().query(`
        SELECT COUNT(*) as Count2026
        FROM GIDA2026..TBLSTHAR 
        WHERE EKALAN_NEDEN='1'
    `);
    console.log("2026 Ekalan Neden 1 Count: ", result.recordset[0]);

    const result2 = await pool.request().query(`
        SELECT COUNT(*) as Count2025
        FROM GIDA2025..TBLSTHAR 
        WHERE EKALAN_NEDEN='1'
    `);
    console.log("2025 Ekalan Neden 1 Count: ", result2.recordset[0]);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSthar();
