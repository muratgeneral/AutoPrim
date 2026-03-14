const sql = require('mssql');
const config = {
  user: 'alpata',
  password: 'master',
  database: 'master',
  server: '10.10.1.64',
  requestTimeout: 300000, 
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function searchDiscountNames() {
  const searchTerm1 = 'RT30';
  const searchTerm2 = 'D01 - B2C';
  
  try {
    const pool = await sql.connect(config);
    console.log(`Connected. Searching database for '${searchTerm1}' and '${searchTerm2}'...`);

    const getTablesQuery = `
      SELECT * FROM OPENQUERY([37.131.251.91, 10168], '
        SELECT DISTINCT t.name AS TableName, c.name AS ColumnName
        FROM peugeotdms.sys.tables t
        INNER JOIN peugeotdms.sys.columns c ON t.object_id = c.object_id
        WHERE c.system_type_id IN (167, 231, 175, 239) -- string types
          AND c.max_length >= 10
      ')
    `;
    
    // Check known tables first
    const knownTables = ['AILAVEMLY0', 'UFATDET0', 'UCARIHR0', 'AARAC0', 'ATEKLIF0', 'ACSD0', 'GNLIST0', 'AOPR0'];
    let found = false;
    
    console.log("Checking likely tables first...");
    for (const tbl of knownTables) {
         const checkQ = `
           SELECT TOP 10 * FROM OPENQUERY([37.131.251.91, 10168], '
             SELECT * FROM peugeotdms.dbo.${tbl}
             WHERE 1=0
           ')
         `;
         try {
             const headRes = await pool.request().query(checkQ);
             // Table exists, query it by converting rows to JSON to search all columns
             const searchQ = `
                 SELECT TOP 5 * FROM OPENQUERY([37.131.251.91, 10168], '
                    SELECT * 
                    FROM peugeotdms.dbo.${tbl}
                    WHERE (
                        SELECT STRING_AGG(CAST(value AS NVARCHAR(MAX)), '' '')
                        FROM (
                            SELECT * FROM peugeotdms.dbo.${tbl} AS innerTbl WHERE innerTbl.INCKEY = peugeotdms.dbo.${tbl}.INCKEY
                        ) AS tbl
                        FOR JSON AUTO
                    ) LIKE ''%${searchTerm1}%'' OR 
                    (
                        SELECT STRING_AGG(CAST(value AS NVARCHAR(MAX)), '' '')
                        FROM (
                            SELECT * FROM peugeotdms.dbo.${tbl} AS innerTbl WHERE innerTbl.INCKEY = peugeotdms.dbo.${tbl}.INCKEY
                        ) AS tbl
                        FOR JSON AUTO
                    ) LIKE ''%${searchTerm2}%''
                 ')
             `;
             // The above JSON trick might fail if INCKEY diesn't exist. Let's do a safer targeted query.
         } catch(e) {}
    }
    
    // Use an explicit query against GNLIST0 (General Lists - Often holds campaigns)
    const gnlistQ = `
        SELECT TOP 10 * FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT * FROM peugeotdms.dbo.GNLIST0
            WHERE KOD LIKE ''%RT30%'' OR ACIKLAMA LIKE ''%RT30%'' OR KOD LIKE ''%D01%'' OR ACIKLAMA LIKE ''%D01%''
        ')
    `;
    try {
        const resList = await pool.request().query(gnlistQ);
        if (resList.recordset.length > 0) {
            console.log("\n✅ FOUND IN GNLIST0 (Definitions):");
            console.log(resList.recordset);
        }
    } catch(e) {}

    // Check specific columns in main tables
    const colsToCheck = [
        { t: 'UFATDET0', c: 'ACIKLAMA' },
        { t: 'UFATDET0', c: 'DMBGRUP' },
        { t: 'AILAVEMLY0', c: 'ACIKLAMA' },
        { t: 'ATEKLIF0', c: 'ACIKLAMA' },
        { t: 'AARAC0', c: 'ACIKLAMA' },
        { t: 'ACSD0', c: 'ACSDNO' }  // sometimes campaign code is in ACSD
    ];
    
    for (const item of colsToCheck) {
        const q = `
            SELECT TOP 5 * FROM OPENQUERY([37.131.251.91, 10168], '
                SELECT * FROM peugeotdms.dbo.${item.t}
                WHERE ${item.c} LIKE ''%RT30%'' OR ${item.c} LIKE ''%D01%''
            ')
        `;
        try {
            const res = await pool.request().query(q);
            if (res.recordset && res.recordset.length > 0) {
                console.log(`\n✅ FOUND IN ${item.t}.${item.c}:`);
                console.log(JSON.stringify(res.recordset, null, 2));
                found = true;
            }
        } catch(e){}
    }

    if(!found) {
        console.log("Searching all text columns dynamically...");
        const tablesRes = await pool.request().query(getTablesQuery);
        for(let tbl of tablesRes.recordset) {
             const xQ = `SELECT TOP 1 * FROM OPENQUERY([37.131.251.91, 10168], 'SELECT * FROM peugeotdms.dbo.${tbl.TableName} WHERE ${tbl.ColumnName} LIKE ''%RT30%'' OR ${tbl.ColumnName} LIKE ''%D01 - B2C%''')`;
             try {
                 const xRes = await pool.request().query(xQ);
                 if(xRes.recordset && xRes.recordset.length > 0) {
                      console.log(`\n✅ FOUND GLOBALLY IN: ${tbl.TableName} (${tbl.ColumnName})`);
                      console.log(JSON.stringify(xRes.recordset[0], null, 2));
                 }
             } catch(e) {}
        }
    }

    console.log("\nScan complete.");

  } catch (err) {
    console.error("Error: ", err);
  } finally {
    process.exit(0);
  }
}

searchDiscountNames();
