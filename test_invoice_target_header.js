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
    const targetValue = 9421;
    let found = false;
    
    // First check the invoice header
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
    
    console.log(`Searching UFATMAS0 (Header) for 9421...`);
    const headerRow = resMas.recordset[0];
    const headerMatches = Object.keys(headerRow).filter(key => {
        const val = headerRow[key];
        if (typeof val === 'number') {
            return Math.abs(val - targetValue) <= 50; 
        }
        return false;
    });

    if (headerMatches.length > 0) {
        console.log(`✅ FOUND 9421 NEAR MATCH IN HEADER (UFATMAS0):`);
        console.log(`Matching Columns: ${headerMatches.join(', ')}`);
        const matchData = headerMatches.reduce((acc, k) => { acc[k] = headerRow[k]; return acc; }, {});
        console.log(`Values:`, matchData);
        found = true;
    } else {
        console.log('Not in UFATMAS0 numeric fields. Header numerics:');
        let nums = Object.keys(headerRow).filter(k => typeof headerRow[k] === 'number').reduce((acc, k) => { acc[k] = headerRow[k]; return acc; }, {});
        console.log(nums);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkSpecificInvoice();
