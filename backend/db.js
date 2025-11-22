// In production (Railway/Heroku), DATABASE_URL is provided automatically.
// We also need to enable SSL for most cloud databases.
const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for many managed Postgres services
      },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'surveyuser',
      password: process.env.DB_PASS || 'surveypass',
      database: process.env.DB_NAME || 'surveydb',
    };

const pool = new Pool(connectionConfig);

module.exports = pool;
