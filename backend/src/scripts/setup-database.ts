// src/scripts/setup-database.ts
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import config from '../config';
import logger from '../utils/logger';

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

// Parse connection string for database setup
const parseConnectionForSetup = (connectionString: string): DatabaseConfig => {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) || 'e_learning'
    };
  } catch (error) {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'e_learning'
    };
  }
};

/**
 * Setup MySQL database and execute schema
 */
async function setupDatabase(): Promise<void> {
  const dbConfig = config.databaseUrl 
    ? parseConnectionForSetup(config.databaseUrl)
    : parseConnectionForSetup('mysql://root:@localhost:3306/e_learning');

  let connection: mysql.Connection | null = null;

  try {
    logger.info('Setting up MySQL database...');

    // Connect without specifying database to create it if needed
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    logger.info('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    logger.info(`Database '${dbConfig.database}' created or already exists`);

    // Switch to the database
    await connection.execute(`USE \`${dbConfig.database}\``);
    logger.info(`Switched to database '${dbConfig.database}'`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    
    // Create database directory if it doesn't exist
    const dbDir = path.dirname(schemaPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create schema file if it doesn't exist (you'll need to copy the SQL from the first artifact)
    if (!fs.existsSync(schemaPath)) {
      logger.warn(`Schema file not found at ${schemaPath}. Please create the file with the database schema.`);
      logger.info('You can copy the schema from the MySQL Database Schema artifact.');
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements (simple approach)
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    logger.info(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          logger.debug(`Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Log error but continue with other statements
          logger.warn(`Failed to execute statement ${i + 1}: ${error}`);
        }
      }
    }

    logger.info('Database schema setup completed successfully!');

    // Verify tables were created
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);

    logger.info(`Created ${(tables as any[]).length} tables:`, (tables as any[]).map(t => t.TABLE_NAME));

  } catch (error) {
    logger.error('Database setup failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      logger.info('Database connection closed');
    }
  }
}

/**
 * Reset database (drop and recreate)
 */
async function resetDatabase(): Promise<void> {
  const dbConfig = config.databaseUrl 
    ? parseConnectionForSetup(config.databaseUrl)
    : parseConnectionForSetup('mysql://root:@localhost:3306/e_learning');

  let connection: mysql.Connection | null = null;

  try {
    logger.info('Resetting MySQL database...');

    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // Drop database if exists
    await connection.execute(`DROP DATABASE IF EXISTS \`${dbConfig.database}\``);
    logger.info(`Database '${dbConfig.database}' dropped`);

    // Recreate database
    await connection.execute(`CREATE DATABASE \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    logger.info(`Database '${dbConfig.database}' recreated`);

    await connection.end();

    // Setup the database again
    await setupDatabase();

  } catch (error) {
    logger.error('Database reset failed:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore connection close errors
      }
    }
  }
}

/**
 * Check database connection and status
 */
async function checkDatabase(): Promise<void> {
  const dbConfig = config.databaseUrl 
    ? parseConnectionForSetup(config.databaseUrl)
    : parseConnectionForSetup('mysql://root:@localhost:3306/e_learning');

  let connection: mysql.Connection | null = null;

  try {
    logger.info('Checking database connection...');

    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });

    // Test connection
    await connection.ping();
    logger.info('✅ Database connection successful');

    // Check database version
    const [version] = await connection.execute('SELECT VERSION() as version');
    logger.info(`MySQL Version: ${(version as any[])[0].version}`);

    // Check tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);

    logger.info(`Database has ${(tables as any[]).length} tables:`);
    (tables as any[]).forEach(table => {
      logger.info(`  - ${table.TABLE_NAME} (${table.TABLE_ROWS || 0} rows)`);
    });

  } catch (error) {
    logger.error('❌ Database check failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  const runCommand = async () => {
    try {
      switch (command) {
        case 'setup':
          await setupDatabase();
          break;
        case 'reset':
          await resetDatabase();
          break;
        case 'check':
          await checkDatabase();
          break;
        default:
          console.log('Usage: npm run db:setup|db:reset|db:check');
          console.log('Commands:');
          console.log('  setup  - Create database and tables');
          console.log('  reset  - Drop and recreate database');
          console.log('  check  - Check database connection and status');
          process.exit(1);
      }
      process.exit(0);
    } catch (error) {
      logger.error('Command failed:', error);
      process.exit(1);
    }
  };

  runCommand();
}

export { setupDatabase, resetDatabase, checkDatabase };