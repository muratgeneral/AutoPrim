import sql from 'mssql';

const sqlConfig = {
  user: 'alpata',
  password: 'master',
  database: 'GIDA2026',
  server: '10.10.1.64',
  requestTimeout: 120000, // 2 minutes for slow report queries
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let netsisPool: sql.ConnectionPool | null = null;

export async function getNetsisConnection() {
  try {
    if (!netsisPool) {
      netsisPool = await sql.connect(sqlConfig);
    }
    return netsisPool;
  } catch (err) {
    console.error('Netsis Database Connection Failed!', err);
    throw err;
  }
}
