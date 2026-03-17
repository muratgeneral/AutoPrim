const fs = require('fs');
const sql = require('mssql');

const sqlConfig = {
  user: 'alpata',
  password: 'master',
  database: 'master',
  server: '10.10.1.64',
  requestTimeout: 120000,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: { encrypt: false, trustServerCertificate: true }
};

async function checkVin(pool, sasino, label) {
    const q = await pool.request().query(`
        SELECT fm.FATNO, fm.EFATNO, fm.FATTAR, fd.SASINO, fd.BRFIYAT, fd.DMBGRUP
        FROM [37.131.251.91, 10168].[peugeotdms].[dbo].[UFATMAS0] fm
        JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[UFATDET0] fd ON fm.FATNO = fd.FATNO
        WHERE fd.SASINO = '${sasino}'
        ORDER BY fm.FATTAR DESC, fm.FATNO DESC
    `);
    fs.writeFileSync(`invoices_${label}.json`, JSON.stringify(q.recordset, null, 2));
    console.log(`Saved to invoices_${label}.json (${q.recordset.length} records)`);
}

async function run() {
    try {
        const pool = await sql.connect(sqlConfig);
        await checkVin(pool, 'VR3KBDGK9SS176682', 'vin3');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
