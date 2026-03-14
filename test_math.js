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

async function checkMath() {
  try {
    const pool = await sql.connect(config);
    const vin = 'VR3USHPYXSJ976286';

    const q = `
       SELECT *
       FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT SASINO, DISTPROMTUT, SATINALFYT, DISTALISTUT, FATNO, AFATNO, SATFATNO, ALFATNO
            FROM peugeotdms.dbo.AARAC0
            WHERE SASINO = ''${vin}''
       ')
    `;
    const res = await pool.request().query(q);
    console.log("Data from AARAC0:");
    console.log(res.recordset);
    
    // Check if the exact values exist in any AILAVEMLY0 or other vehicle related fields
    const queryMas = `
      SELECT *
      FROM OPENQUERY([37.131.251.91, 10168], '
        SELECT *
        FROM peugeotdms.dbo.AILAVEMLY0 
        WHERE SASINO = ''${vin}''
      ')
    `;
    try {
        const masRes = await pool.request().query(queryMas);
        console.log(`\nMasraflar / Ilave Maliyetler:`, masRes.recordset);
    } catch(e) {}

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkMath();
