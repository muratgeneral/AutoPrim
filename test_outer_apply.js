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

async function testOuterApply() {
  try {
    const pool = await sql.connect(config);
    const vin1 = 'VF3YDG6F8SG065660'; 

    const q = `
       SELECT *
       FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT 
                t.TEKLIFNO,
                t.SASINO,
                kamp_agg.KampanyaDetay
            FROM peugeotdms.dbo.ATEKLIF0 t
            OUTER APPLY (
                  SELECT 
                      STRING_AGG(CONVERT(NVARCHAR(MAX), kamp.ACIKLAMA + '' ('' + CAST(isk.DISTTUT AS NVARCHAR(50)) + '')''), '', '') AS KampanyaDetay
                  FROM peugeotdms.dbo.ATEKLIFISK0 isk
                  JOIN peugeotdms.dbo.AARACKAMPANYA kamp 
                      ON kamp.SIRKOD = isk.SIRKOD AND kamp.KAMPANYANO = isk.KAMPANYANO
                  WHERE isk.TEKLIFNO = t.TEKLIFNO AND isk.SIRKOD = t.SIRKOD AND isk.DISTTUT > 0
            ) kamp_agg
            WHERE t.SIRKOD = 1 AND t.SASINO = ''${vin1}''
       ')
    `;
    const res = await pool.request().query(q);
    
    console.log("Outer Apply Output:");
    console.table(res.recordset);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
testOuterApply();
