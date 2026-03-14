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

async function checkVinAarac() {
  try {
    const pool = await sql.connect(config);
    const vin = 'VR3USHPYXSJ976286';

    console.log(`Checking AARAC0 for VIN ${vin}`);
    const queryAarac = `
      SELECT *
      FROM OPENQUERY([37.131.251.91, 10168], '
        SELECT * FROM peugeotdms.dbo.AARAC0 WHERE SASINO = ''${vin}''
      ')
    `;
    const resAarac = await pool.request().query(queryAarac);
    if(resAarac.recordset.length > 0) {
        let nums = Object.keys(resAarac.recordset[0])
            .filter(k => typeof resAarac.recordset[0][k] === 'number')
            .reduce((acc, k) => { acc[k] = resAarac.recordset[0][k]; return acc; }, {});
        
        console.log('AARAC0 Numerics:');
        for (const [key, val] of Object.entries(nums)) {
            if (val > 0) {
                console.log(`${key}: ${val}`);
            }
        }
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkVinAarac();
