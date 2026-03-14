import sql from 'mssql';

const sqlConfig = {
  user: 'alpata',
  password: 'master',
  database: 'master',
  server: '10.10.1.64',
  requestTimeout: 120000, // 2 minutes for slow report queries
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for linux environments
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

let globalPool: sql.ConnectionPool | null = null;

export async function getConnection() {
  try {
    if (!globalPool) {
        globalPool = await sql.connect(sqlConfig);
    }
    return globalPool;
  } catch (err) {
    console.error('Database Connection Failed!', err);
    throw err;
  }
}
