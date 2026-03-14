const sql = require('mssql');
const config = {
  user: 'alpata',
  password: 'master',
  database: 'master',
  server: '10.10.1.64',
  requestTimeout: 200000, 
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function search() {
    try {
        const pool = await sql.connect(config);
        const searchStr = 'E0533915';
        const tablesToSearch = ['UFATMAS0', 'UFATDET0', 'UCARIHR0', 'AARAC0', 'ATEKLIF0', 'ACSD0'];

        console.log("Searching ACIKLAMA columns...");
        for(let tbl of tablesToSearch) {
             const checkQ = `
               SELECT TOP 5 * FROM OPENQUERY([37.131.251.91, 10168], '
                 SELECT * FROM peugeotdms.dbo.${tbl}
                 WHERE 
                   (SELECT 1 FROM peugeotdms.sys.columns WHERE object_id = object_id(''peugeotdms.dbo.${tbl}'') AND name = ''ACIKLAMA'') = 1
                   AND ACIKLAMA LIKE ''%${searchStr}%''
               ')
             `;
             try {
                 const res = await pool.request().query(checkQ);
                 if (res.recordset && res.recordset.length > 0) {
                     console.log(`\n✅ FOUND in ${tbl} (ACIKLAMA)`);
                     console.log(JSON.stringify(res.recordset, null, 2));
                 }
             } catch(e) {}
             
             // Also check special reference fields if any
             if (tbl === 'UCARIHR0') {
                 const ccheckQ = `
                   SELECT TOP 5 * FROM OPENQUERY([37.131.251.91, 10168], '
                     SELECT * FROM peugeotdms.dbo.UCARIHR0
                     WHERE EVRAK LIKE ''%${searchStr}%'' OR REFERANS LIKE ''%${searchStr}%''
                   ')
                 `;
                 try {
                     const resC = await pool.request().query(ccheckQ);
                     if (resC.recordset && resC.recordset.length > 0) {
                         console.log(`\n✅ FOUND in UCARIHR0 (EVRAK/REFERANS)`);
                         console.log(JSON.stringify(resC.recordset, null, 2));
                     }
                 } catch(e){}
             }
        }
        console.log("Finished searching descriptions/references.");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
search();
