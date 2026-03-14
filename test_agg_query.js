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

async function testJoinAgg() {
  try {
    const pool = await sql.connect(config);
    const vin1 = 'VF3YDG6F8SG065660'; 

    const q = `
       SELECT *
       FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT 
                t.SASINO,
                SUM(isk.DISTTUT) AS TOTAL_DISTTUT,
                STRING_AGG(CONVERT(NVARCHAR(MAX), kamp.ACIKLAMA + '' ('' + CAST(isk.DISTTUT AS NVARCHAR(50)) + '')''), '', '') AS KAMPANYA_DETAY
            FROM peugeotdms.dbo.ATEKLIF0 t
            JOIN peugeotdms.dbo.ATEKLIFISK0 isk 
                ON t.SIRKOD = isk.SIRKOD 
               AND t.TEKLIFNO = isk.TEKLIFNO
            JOIN peugeotdms.dbo.AARACKAMPANYA kamp 
                ON kamp.SIRKOD = isk.SIRKOD 
               AND kamp.KAMPANYANO = isk.KAMPANYANO
            WHERE 
                t.SIRKOD = 1
                AND t.SASINO = ''${vin1}''
                AND isk.DISTTUT > 0
            GROUP BY t.SASINO
       ')
    `;
    const res = await pool.request().query(q);
    
    console.log("Aggregated Campaign Output:");
    console.log(res.recordset);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
testJoinAgg();
