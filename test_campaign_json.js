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

async function checkCampaignCodes() {
  const resultData = { aarac: [], gnlist: [], acsd: [] };
  try {
    const pool = await sql.connect(config);
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
        resultData.aarac = resAarac.recordset;
    } catch(e) {}
    
    try {
        const qGnlist = `
            SELECT *
            FROM OPENQUERY([37.131.251.91, 10168], '
                SELECT *
                FROM peugeotdms.dbo.GNLIST0
                WHERE KOD IN (''RT30'', ''D01'') OR KOD LIKE ''%RT30%'' OR KOD LIKE ''%D01%'' OR ACIKLAMA LIKE ''%RT30%'' OR ACIKLAMA LIKE ''%ÖZEL FİYAT%'' OR ACIKLAMA LIKE ''%3GÜN%''
            ')
        `;
        const resGnlist = await pool.request().query(qGnlist);
        resultData.gnlist = resGnlist.recordset;
    } catch (e) {}
    
    try {
        const qMly = `
          SELECT *
          FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT TOP 50 *
            FROM peugeotdms.dbo.ACSD0 
            WHERE SASENO IN (''${vin1}'', ''${vin2}'')
          ')
        `;
        const resMly = await pool.request().query(qMly);
        resultData.acsd = resMly.recordset;
    } catch (e) {}

    fs.writeFileSync('campaign_results.json', JSON.stringify(resultData, null, 2), 'utf8');

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkCampaignCodes();
