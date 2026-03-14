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

async function checkSpecificInvoice() {
  try {
    const pool = await sql.connect(config);
    const invoiceNo = 'PE02026000001365';
    
    console.log(`Connected. Looking up invoice ${invoiceNo} to find 9421...`);

    // First check the invoice header (pulling top 5 to avoid column name mismatch)
    const queryMas = `
      SELECT *
      FROM OPENQUERY([37.131.251.91, 10168], '
        SELECT *
        FROM peugeotdms.dbo.UFATMAS0 
        WHERE EFATNO = ''${invoiceNo}'' OR FATNO = ''${invoiceNo}''
      ')
    `;
    const resMas = await pool.request().query(queryMas);
    
    if (resMas.recordset.length === 0) {
        console.log(`Invoice ${invoiceNo} not found in UFATMAS0.`);
        process.exit(0);
    }
    
    const internalFatno = resMas.recordset[0].FATNO;
    let nums = Object.keys(resMas.recordset[0]).filter(k => typeof resMas.recordset[0][k] === 'number').reduce((acc, k) => { acc[k] = resMas.recordset[0][k]; return acc; }, {});
    console.log(`Invoice Details NUMERICS: `, nums);
    console.log(`Internal FATNO is: ${internalFatno}`);
    
    // Now check the details
    const queryDet = `
      SELECT *
      FROM OPENQUERY([37.131.251.91, 10168], '
        SELECT *
        FROM peugeotdms.dbo.UFATDET0 
        WHERE FATNO = ''${internalFatno}''
      ')
    `;
    const resDet = await pool.request().query(queryDet);
    console.log(`\nFound ${resDet.recordset.length} line items.`);
    
    // Check for any number close to 9421 in the lines
    const targetValue = 9421;
    let found = false;
    resDet.recordset.forEach((row, idx) => {
        const matches = Object.keys(row).filter(key => {
            const val = row[key];
            if (typeof val === 'number') {
                return Math.abs(val - targetValue) <= 50; 
            }
            return false;
        });

        if (matches.length > 0) {
            console.log(`\n✅ FOUND 9421 NEAR MATCH IN LINE ${idx + 1}:`);
            console.log(`Matching Columns: ${matches.join(', ')}`);
            const matchData = matches.reduce((acc, k) => { acc[k] = row[k]; return acc; }, {});
            console.log(`Values:`, matchData);
            console.log(`DMBGRUP: ${row.DMBGRUP}, SASINO: ${row.SASINO}`);
            found = true;
        }
    });

    if (!found) {
        console.log(`\n9421 NOT directly found in ${invoiceNo} lines. Aggregating values to check if it's a sum...`);
        
        let totalIskonto = 0;
        let totalHiskonto = 0;
        let totalBrfiyat = 0;
        let totalInpIskonto = 0;
        
        resDet.recordset.forEach((row, idx) => {
            totalIskonto += row.ISKONTO || 0;
            totalHiskonto += row.HISKONTO || 0;
            totalBrfiyat += row.BRFIYAT || 0;
            totalInpIskonto += row.INPISKONTO || 0;
            
            // Print individual discounts just to see
            if ((row.ISKONTO || 0) > 0 || (row.INPISKONTO || 0) > 0) {
                 console.log(`Line ${idx+1} [${row.DMBGRUP}]: ISKONTO=${row.ISKONTO}, INPISKONTO=${row.INPISKONTO}, BRFIYAT=${row.BRFIYAT}`);
            }
        });
        
        console.log(`\nTotal ISKONTO: ${totalIskonto.toFixed(2)}`);
        console.log(`Total HISKONTO: ${totalHiskonto.toFixed(2)}`);
        console.log(`Total BRFIYAT: ${totalBrfiyat.toFixed(2)}`);
        console.log(`Total INPISKONTO: ${totalInpIskonto.toFixed(2)}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkSpecificInvoice();
