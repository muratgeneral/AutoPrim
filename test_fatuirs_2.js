const sql = require('mssql');
async function run() {
  let p = await sql.connect({user:'alpata',password:'master',database:'GIDA2026',server:'10.10.1.64',options:{encrypt:false,trustServerCertificate:true}});
  let r = await p.request().query("SELECT TOP 1 FATIRS_NO, BRUTTUTAR, GENELTOPLAM, KDV FROM TBLFATUIRS WHERE FTIRSIP='1' AND SUBE_KODU=6 ORDER BY TARIH DESC");
  console.log(r.recordset[0]);
  process.exit();
}
run();
