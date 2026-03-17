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
        
        console.log("--- SQL LIKE Test ---");
        const tbl = await pool.request().query(`
            SELECT 
                f.UNVAN,
                CASE 
                    WHEN f.UNVAN LIKE '%LEASING%' OR f.UNVAN LIKE '%FİNANSAL%KİRALAMA%' THEN 'Leasing'
                    WHEN f.UNVAN LIKE '%FINANSAL%KIRALAMA%' THEN 'Leasing (No Turkish Chars)'
                    WHEN f.UNVAN LIKE '%LEAS%ING%' OR f.UNVAN COLLATE SQL_Latin1_General_CP1254_CI_AS LIKE '%FİNANSAL%KİRALAMA%' THEN 'Leasing (Collation)'
                    ELSE 'B2C'
                END AS TestKanal
            FROM [37.131.251.91, 10168].[peugeotdms].[dbo].[ATEKLIF0] t
            LEFT JOIN [37.131.251.91, 10168].[peugeotdms].[dbo].[GNLFIRMA0] f
                ON f.VERGINO = t.FIRMA AND f.SIRKOD = t.SIRKOD
            WHERE t.SASINO = 'VR3KAHPY8SS204521'
        `);
        console.log(JSON.stringify(tbl.recordset, null, 2));

        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
run();
