const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

const setupDatabase = () => {
  let connection;
  
  try {
    console.log('🚀 Setting up Pamoontoy Database...');
    
    // Connect to MySQL server (without database)
    connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
      authPlugins: {
        mysql_native_password: () => () => Buffer.from([0x00])
      }
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);

    // Use the database
    connection.query(`USE ${process.env.DB_NAME}`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executing database schema...');
    
    // Execute entire schema at once
    connection.query(schema, (error, results) => {
      if (error) {
        console.error(`❌ Error executing schema: ${error.message}`);
        connection.end();
        return;
      }
      
      console.log('🎉 Database setup completed successfully!');
      console.log('📊 Tables created:');
      console.log('   - users');
      console.log('   - products');
      console.log('   - product_images');
      console.log('   - bids');
      console.log('   - categories');
      
      connection.end();
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (connection) {
      connection.end();
    }
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;




