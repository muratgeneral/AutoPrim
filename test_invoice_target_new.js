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

async function searchInvoiceWorldwide() {
  const fatno = 'E0533915';
  
  try {
    const pool = await sql.connect(config);
    console.log("Connected. Fetching tables to search for E0533915...");

    const getTablesQuery = `
      SELECT * FROM OPENQUERY([37.131.251.91, 10168], '
        SELECT DISTINCT t.name AS TableName, c.name AS ColumnName
        FROM peugeotdms.sys.tables t
        INNER JOIN peugeotdms.sys.columns c ON t.object_id = c.object_id
        WHERE c.system_type_id IN (167, 231, 175, 239) -- varchar, nvarchar, char, nchar
          AND c.max_length >= 8
      ')
    `;
    
    // We will just try a few highly likely tables first to save time before a full text scan
    const likelyTables = [
        'UFATMAS0', 'UFATDET0', 'UCARIHR0', 'AARAC0', 'ATEKLIF0', 'ACSD0',
        'SSP_FATMAS0', 'SSP_FATDET0', 'SRV_FATMAS0', 'SRV_FATDET0',
        'ASIPARIS0', 'AFATURA0'
    ];

    let foundMatch = false;

    console.log("Searching likely tables first...");
    for (const tableName of likelyTables) {
      try {
        const query = `
          SELECT * FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT TOP 5 * FROM peugeotdms.dbo.${tableName}
            WHERE (
              SELECT STRING_AGG(CAST(value AS NVARCHAR(MAX)), '''')
              FROM (
                  SELECT * FROM peugeotdms.dbo.${tableName} WHERE 1=0
              ) AS tbl
              FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) IS NOT NULL -- Just a dummy check to verify table exists
          ')
        `;
        // Actually we can't easily do a generic text search without dynamic SQL on the linked server.
        // Let's do a targeted search on generic FATNO or ACIKLAMA columns if they exist.
      } catch (err) {}
    }

    // Safer approach: Let's check if there are specific invoice tables for Service or Spare Parts
    console.log("Checking Service/Spare Parts/Other tables for E0533915...");
    const targetedQuery = `
      IF OBJECT_ID('tempdb..#Results') IS NOT NULL DROP TABLE #Results;
      CREATE TABLE #Results (TableName VARCHAR(100), FoundValue VARCHAR(MAX));

      DECLARE @SearchStr VARCHAR(100) = '%E0533915%';
      
      -- We will execute this script on the actual remote server via OPENQUERY if possible, 
      -- or just query known tables individually.
    `;

    // Instead of complex dynamic SQL, let's just query a list of known invoice/accounting tables for this string.
    const tablesToSearch = ['UFATMAS0', 'UCARIHR0', 'AFATURA0', 'SRVFATMAS0', 'YDFATMAS0', 'ATEKLIF0'];
    
    for (const tbl of tablesToSearch) {
        try {
             const checkQ = `
               SELECT TOP 5 * FROM OPENQUERY([37.131.251.91, 10168], '
                 SELECT * FROM peugeotdms.dbo.${tbl}
                 WHERE 
                   (SELECT 1 FROM peugeotdms.sys.columns WHERE object_id = object_id(''peugeotdms.dbo.${tbl}'') AND name = ''FATNO'') = 1
                   AND FATNO LIKE ''%E0533915%''
               ')
             `;
             const res = await pool.request().query(checkQ);
             if (res.recordset && res.recordset.length > 0) {
                 console.log(`\n✅ FOUND in ${tbl} (FATNO)`);
                 console.log(JSON.stringify(res.recordset, null, 2));
                 foundMatch = true;
             }
        } catch(e) {}

        try {
            const checkQ2 = `
              SELECT TOP 5 * FROM OPENQUERY([37.131.251.91, 10168], '
                SELECT * FROM peugeotdms.dbo.${tbl}
                WHERE 
                  (SELECT 1 FROM peugeotdms.sys.columns WHERE object_id = object_id(''peugeotdms.dbo.${tbl}'') AND name = ''EFATNO'') = 1
                  AND EFATNO LIKE ''%E0533915%''
              ')
            `;
            const res2 = await pool.request().query(checkQ2);
            if (res2.recordset && res2.recordset.length > 0) {
                console.log(`\n✅ FOUND in ${tbl} (EFATNO)`);
                console.log(JSON.stringify(res2.recordset, null, 2));
                foundMatch = true;
            }
       } catch(e) {}
       
       try {
            const checkQ3 = `
              SELECT TOP 5 * FROM OPENQUERY([37.131.251.91, 10168], '
                SELECT * FROM peugeotdms.dbo.${tbl}
                WHERE 
                  (SELECT 1 FROM peugeotdms.sys.columns WHERE object_id = object_id(''peugeotdms.dbo.${tbl}'') AND name = ''EVRAKNO'') = 1
                  AND EVRAKNO LIKE ''%E0533915%''
              ')
            `;
            const res3 = await pool.request().query(checkQ3);
            if (res3.recordset && res3.recordset.length > 0) {
                console.log(`\n✅ FOUND in ${tbl} (EVRAKNO)`);
                console.log(JSON.stringify(res3.recordset, null, 2));
                foundMatch = true;
            }
       } catch(e) {}
    }

    if(!foundMatch) {
       console.log("Could not find invoice E0533915 in standard FATNO/EFATNO/EVRAKNO columns of major tables.");
       
       // Check if there are ANY tables with this FATNO via a quick column scan
       const getTablesQ = `
          SELECT * FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT DISTINCT t.name AS TableName, c.name AS ColumnName
            FROM peugeotdms.sys.tables t
            INNER JOIN peugeotdms.sys.columns c ON t.object_id = c.object_id
            WHERE c.name IN (''FATNO'', ''EFATNO'', ''EVRAKNO'')
          ')
        `;
        const tablesRes = await pool.request().query(getTablesQ);
        
        console.log(`Scanning ${tablesRes.recordset.length} tables exactly...`);
        for(let tbl of tablesRes.recordset) {
             try {
                 const xQ = `SELECT TOP 1 * FROM OPENQUERY([37.131.251.91, 10168], 'SELECT * FROM peugeotdms.dbo.${tbl.TableName} WHERE ${tbl.ColumnName} LIKE ''%E0533915%''')`;
                 const xRes = await pool.request().query(xQ);
                 if(xRes.recordset && xRes.recordset.length > 0) {
                      console.log(`\n✅ FOUND IN: ${tbl.TableName} (${tbl.ColumnName})`);
                      console.log(JSON.stringify(xRes.recordset[0], null, 2));
                 }
             } catch(e) {}
        }
    }

  } catch (err) {
    console.error("Error: ", err);
  } finally {
    process.exit(0);
  }
}

searchInvoiceWorldwide();
