const sql = require('mssql');
const fs = require('fs');
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

async function testUserQueryFull() {
  try {
    const pool = await sql.connect(config);
    const vin1 = 'VF3YDG6F8SG065660'; 
    const vin2 = 'VR3USHPYXSJ976286'; 

    const q = `
       SELECT *
       FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT 
                t.TEKLIFNO,
                isk.KAMPANYANO,
                kamp.ACIKLAMA,
                arac.SASINO,
                t.ANAHTESFIY,
                isk.BAYITUT,
                isk.DISTTUT
            FROM peugeotdms.dbo.ATEKLIF0 t
            JOIN peugeotdms.dbo.AARAC0 arac 
                ON t.SIRKOD = arac.SIRKOD 
               AND t.SASINO = arac.SASINO
            JOIN peugeotdms.dbo.ATEKLIFISK0 isk 
                ON t.SIRKOD = isk.SIRKOD 
               AND t.TEKLIFNO = isk.TEKLIFNO
            JOIN peugeotdms.dbo.AARACKAMPANYA kamp 
                ON kamp.SIRKOD = isk.SIRKOD 
               AND kamp.KAMPANYANO = isk.KAMPANYANO
            WHERE 
                t.SIRKOD = 1
                AND arac.SASINO IN (''${vin1}'', ''${vin2}'')
       ')
    `;
    const res = await pool.request().query(q);
    
    fs.writeFileSync('campaign_breakdown.json', JSON.stringify(res.recordset, null, 2), 'utf8');

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
testUserQueryFull();
