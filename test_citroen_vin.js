const sql = require('mssql');
const config = {
  user: 'alpata',
  password: 'master',
  server: '10.10.1.64',
  database: 'master',
  options: { encrypt: false, trustServerCertificate: true },
};

async function run() {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT t.DURUM, COUNT(*) as Count
      FROM [37.131.251.91, 10168].[peugeotdms].[dbo].ATEKLIF0 t
      WHERE t.CSDDATE IS NOT NULL
      GROUP BY t.DURUM
    `);
    require('fs').writeFileSync('citroen_debug.json', JSON.stringify(result.recordset, null, 2));
    console.log('Done writing citroen_debug.json');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
