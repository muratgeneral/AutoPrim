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
        SELECT TOP 10 EKALAN
        FROM GIDA2026..TBLSTHAR 
        WHERE EKALAN_NEDEN='1'
    `);
    
    console.log("Top 10 EKALAN values:");
    console.dir(result.recordset);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSthar();
