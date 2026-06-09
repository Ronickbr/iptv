const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'iptv_user',
  password: process.env.DB_PASSWORD || 'iptv_password',
  database: process.env.DB_NAME || 'iptv_manager',
};

async function waitForDatabase(maxRetries = 30, delay = 2000) {
  console.log('🔄 Waiting for database to be ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      await connection.execute('SELECT 1');
      await connection.end();
      console.log('✅ Database is ready!');
      return true;
    } catch (error) {
      console.log(`⏳ Database not ready yet (attempt ${i + 1}/${maxRetries}): ${error.message}`);
      if (i === maxRetries - 1) {
        console.error('❌ Database failed to become ready after maximum retries');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

if (require.main === module) {
  waitForDatabase().catch(console.error);
}

module.exports = waitForDatabase;