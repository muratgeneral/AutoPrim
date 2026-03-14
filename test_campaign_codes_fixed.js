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

async function checkCampaignCodes() {
  try {
    const pool = await sql.connect(config);

    console.log("Looking up VIN Campaign Codes in AARAC0...");
    const vin1 = 'VF3YDG6F8SG065660'; 
    const vin2 = 'VR3USHPYXSJ976286'; 

    try {
        const qAarac = `
           SELECT *
           FROM OPENQUERY([37.131.251.91, 10168], '
                SELECT SASINO, DISTPROMKOD, DISTPROMTUT
                FROM peugeotdms.dbo.AARAC0
                WHERE SASINO IN (''${vin1}'', ''${vin2}'')
           ')
        `;
        const resAarac = await pool.request().query(qAarac);
        console.log("Campaign Codes stored in Vehicles Table:");
        console.log(JSON.stringify(resAarac.recordset, null, 2));
    } catch(e) { console.log("AARAC0 failed:", e.message); }
    
    // Check GNLIST0 to see string mappings
    console.log("\nLooking up string definitions in GNLIST0...");
    try {
        const qGnlist = `
            SELECT *
            FROM OPENQUERY([37.131.251.91, 10168], '
                SELECT *
                FROM peugeotdms.dbo.GNLIST0
                WHERE KOD IN (''RT30'', ''D01'') OR KOD LIKE ''%RT30%'' OR ACIKLAMA LIKE ''%RT30%'' OR ACIKLAMA LIKE ''%ÖZEL FİYAT%'' OR ACIKLAMA LIKE ''%3GÜN%''
            ')
        `;
        const resGnlist = await pool.request().query(qGnlist);
        console.log(`GNLIST0 matches for RT30 and D01: ${resGnlist.recordset.length} rows`);
        console.log(JSON.stringify(resGnlist.recordset, null, 2));
    } catch (e) {
        console.log("GNLIST0 query failed: ", e.message);
    }
    
    // Attempting to see if there is a separate detail table for split campaigns
    console.log("\nChecking ACSD0 for campaign split definitions...");
    try {
        const qMly = `
          SELECT *
          FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT TOP 5 *
            FROM peugeotdms.dbo.ACSD0 
            WHERE SASENO IN (''${vin1}'', ''${vin2}'')
          ')
        `;
        const resMly = await pool.request().query(qMly);
        console.log(`Campaign/Cost records in ACSD0: ${resMly.recordset.length} rows`);
        if(resMly.recordset.length > 0) {
            console.log(JSON.stringify(resMly.recordset, null, 2));
        }
    } catch (e) { console.log("ACSD0 failed: ", e.message); }

    // Let's check AFATDET0 which is vehicle purchase invoice details
    console.log("\nChecking AALFATDET0 (Vehicle Purchase Details) for splits...");
    try {
        const qAfat = `
          SELECT *
          FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT TOP 5 *
            FROM peugeotdms.dbo.AALFATDET0 
            WHERE SASINO IN (''${vin1}'', ''${vin2}'')
          ')
        `;
        const resAfat = await pool.request().query(qAfat);
        console.log(`Campaign/Cost records in AALFATDET0: ${resAfat.recordset.length} rows`);
        if(resAfat.recordset.length > 0) {
            console.log(JSON.stringify(resAfat.recordset, null, 2));
        }
    } catch (e) { console.log("AALFATDET0 failed: ", e.message); }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkCampaignCodes();
