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

async function run() {
    try {
        const pool = await sql.connect(sqlConfig);
        const tbl = await pool.request().query(`
            SELECT 
                t.SASINO,
                t.SATISTIPI,
                f.VERGINO,
                f.UNVAN,
                t.FILOKANAL,
                t.FILO,
                t.SMEKREDI,
                t.KAMPGRUP,
                t.PRKOZLPRK
            FROM [37.131.251.91, 10168].[peugeotdms].[dbo].[ATEKLIF0] t
            LEFT JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[GNLFIRMA0] f
                ON f.VERGINO = t.FIRMA AND f.SIRKOD = t.SIRKOD
            WHERE t.SASINO IN ('VR3KAHPY8SS204521', 'VR3KAHPY5SS211765')
        `);
        fs.writeFileSync('b2c_leasing_test.json', JSON.stringify(tbl.recordset, null, 2));
        console.log("Written to b2c_leasing_test.json");

        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
run();
