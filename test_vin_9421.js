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

async function searchDatabase() {
  const vin = 'VR3USHPYXSJ976286';
  const targetValueList = [9421, 9421.00];
  const tolerance = 50; 

  try {
    const pool = await sql.connect(config);
    console.log("Connected. Searching across all VIN-related tables for approx 9421 TL...");

    const getTablesQuery = `
      SELECT * FROM OPENQUERY([37.131.251.91, 10168], '
        SELECT DISTINCT t.name AS TableName, c.name AS ColumnName
        FROM peugeotdms.sys.tables t
        INNER JOIN peugeotdms.sys.columns c ON t.object_id = c.object_id
        WHERE c.name IN (''SASINO'', ''SASENO'', ''VIN'')
      ')
    `;
    
    const tablesRes = await pool.request().query(getTablesQuery);
    const tables = tablesRes.recordset;

    let foundMatch = false;

    for (const tbl of tables) {
      const tableName = tbl.TableName;
      const colName = tbl.ColumnName;

      try {
        const query = `
          SELECT * FROM OPENQUERY([37.131.251.91, 10168], '
            SELECT * FROM peugeotdms.dbo.${tableName}
            WHERE ${colName} = ''${vin}''
          ')
        `;
        const result = await pool.request().query(query);
        
        if (result.recordset && result.recordset.length > 0) {
            for (const row of result.recordset) {
                const matches = Object.keys(row).filter(key => {
                    const val = row[key];
                    if (typeof val === 'number') {
                        return Math.abs(val - 9421) <= tolerance;
                    }
                    return false;
                });

                if (matches.length > 0) {
                    console.log(`\n✅ FOUND MATCH IN TABLE: ${tableName}`);
                    console.log(`Matching Columns: ${matches.join(', ')}`);
                    const matchData = matches.reduce((acc, k) => { acc[k] = row[k]; return acc; }, {});
                    console.log(`Values:`, matchData);
                    foundMatch = true;
                }
            }
        }
      } catch (err) {
        // Silently skip inaccessible tables
      }
    }
    
    if(!foundMatch) {
       console.log("\nNo near match for 9421 found in any table for this VIN.");
    } else {
       console.log("\nScan complete. Matches found above.");
    }

  } catch (err) {
    console.error("Critical Error: ", err);
  } finally {
    process.exit(0);
  }
}

searchDatabase();
