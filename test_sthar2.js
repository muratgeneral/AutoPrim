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
    
    let row = result.recordset[0];
    if(row) {
       console.log("Found row. Non-zero numeric fields and their names:");
       for(let key in row) {
          if (typeof row[key] === 'number' && row[key] !== 0) {
             console.log(`${key}: ${row[key]}`);
          }
       }
    } else {
       console.log("No rows found.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSthar();
