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

async function testUserQuery() {
  try {
    const pool = await sql.connect(config);
    const vin1 = 'VF3YDG6F8SG065660'; 
    const vin2 = 'VR3USHPYXSJ976286'; 

    console.log(`Testing user's query for VINs: ${vin1}, ${vin2}`);

    const q = `
       SELECT *
       FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT 
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
    
    if (res.recordset.length > 0) {
        console.log("\n✅ AMAZING! Found Campaign Splits:");
        console.table(res.recordset);
        
        // Let's sum up to see if it matches the B2B report
        let sumDistTut1 = 0;
        let sumDistTut2 = 0;
        
        res.recordset.forEach(r => {
            if(r.SASINO === vin1) sumDistTut1 += r.DISTTUT;
            if(r.SASINO === vin2) sumDistTut2 += r.DISTTUT;
        });
        
        console.log(`\nTotals for ${vin1}: ${sumDistTut1}`);
        console.log(`Totals for ${vin2}: ${sumDistTut2}`);
    } else {
        console.log("\nQuery executed successfully, but no records matched for these specific VINs.");
        // Let's try to query ATEKLIFISK0 directly for these VINs just to see what's in there
        console.log("Checking ATEKLIFISK0 directly...");
        const q2 = `
            SELECT * FROM OPENQUERY([37.131.251.91, 10168], '
                SELECT t.SASINO, isk.*
                FROM peugeotdms.dbo.ATEKLIFISK0 isk
                JOIN peugeotdms.dbo.ATEKLIF0 t ON isk.TEKLIFNO = t.TEKLIFNO
                WHERE t.SASINO IN (''${vin1}'', ''${vin2}'')
            ')
        `;
        const res2 = await pool.request().query(q2);
        console.table(res2.recordset);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
testUserQuery();
