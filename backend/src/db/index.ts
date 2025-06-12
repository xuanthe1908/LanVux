import mysql from 'mysql2/promise';
import config from '../config';
import logger from '../utils/logger';

interface QueryResult {
  [key: string]: any;
}

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  reconnect: boolean;
  charset: string;
  timezone: string;
}

// Parse MySQL connection string or use individual config
const parseConnectionString = (connectionString: string): DatabaseConfig => {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      charset: 'utf8mb4',
      timezone: '+00:00'
    };
  } catch (error) {
    // Fallback to default config if URL parsing fails
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'e_learning',
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      charset: 'utf8mb4',
      timezone: '+00:00'
    };
  }
};

// Initialize connection pool
const dbConfig = config.databaseUrl 
  ? parseConnectionString(config.databaseUrl)
  : parseConnectionString('mysql://root:@localhost:3306/e_learning');

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  queueLimit: 0,
  multipleStatements: false,
  namedPlaceholders: false
});

// Test connection on startup
const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('MySQL database connected successfully', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });
  } catch (error) {
    logger.error('MySQL connection failed:', error);
    process.exit(1);
  }
};

// Initialize connection test
testConnection();

/**
 * Execute a SQL query with parameters
 * @param text SQL query text
 * @param params Query parameters
 * @returns Query result
 */
export async function query<T extends QueryResult = QueryResult>(
  text: string, 
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number; insertId?: number }> {
  const start = Date.now();
  
  try {
    // Convert PostgreSQL-style $1, $2 placeholders to MySQL ? placeholders
    const mysqlQuery = text.replace(/\$(\d+)/g, '?');
    
    const [rows, fields] = await pool.execute(mysqlQuery, params);
    const duration = Date.now() - start;
    
    // Handle different types of results
    let resultRows: T[] = [];
    let insertId: number | undefined;
    
    if (Array.isArray(rows)) {
      resultRows = rows as T[];
    } else if (rows && typeof rows === 'object') {
      // Handle INSERT/UPDATE/DELETE results
      const resultSetHeader = rows as mysql.ResultSetHeader;
      insertId = resultSetHeader.insertId;
      
      // For INSERT queries that need to return data, we need to fetch it
      if (mysqlQuery.toLowerCase().includes('insert') && text.toLowerCase().includes('returning')) {
        // Extract table name from INSERT query
        const tableMatch = mysqlQuery.match(/insert\s+into\s+(\w+)/i);
        if (tableMatch && insertId) {
          const tableName = tableMatch[1];
          // Get the inserted record
          const [insertedRows] = await pool.execute(`SELECT * FROM ${tableName} WHERE id = ?`, [insertId]);
          resultRows = insertedRows as T[];
        }
      }
    }
    
    // Log query for development environment
    if (config.environment === 'development') {
      logger.debug('Executed MySQL query', { 
        query: mysqlQuery, 
        duration: `${duration}ms`, 
        rowCount: resultRows.length,
        insertId
      });
    }
    
    return {
      rows: resultRows,
      rowCount: resultRows.length,
      insertId
    };
  } catch (err) {
    const error = err as Error;
    logger.error('MySQL query error:', { 
      query: text, 
      error: error.message,
      params: params
    });
    throw err;
  }
}

/**
 * Execute a transaction with multiple queries
 * @param callback Function that performs the transaction queries
 * @returns Result of the transaction
 */
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Create a query helper for the transaction
    const transactionQuery = async <R extends QueryResult = QueryResult>(
      text: string, 
      params: any[] = []
    ): Promise<{ rows: R[]; rowCount: number; insertId?: number }> => {
      const mysqlQuery = text.replace(/\$(\d+)/g, '?');
      const [rows] = await connection.execute(mysqlQuery, params);
      
      let resultRows: R[] = [];
      let insertId: number | undefined;
      
      if (Array.isArray(rows)) {
        resultRows = rows as R[];
      } else if (rows && typeof rows === 'object') {
        const resultSetHeader = rows as mysql.ResultSetHeader;
        insertId = resultSetHeader.insertId;
        
        // Handle INSERT with RETURNING simulation
        if (mysqlQuery.toLowerCase().includes('insert') && text.toLowerCase().includes('returning')) {
          const tableMatch = mysqlQuery.match(/insert\s+into\s+(\w+)/i);
          if (tableMatch && insertId) {
            const tableName = tableMatch[1];
            const [insertedRows] = await connection.execute(`SELECT * FROM ${tableName} WHERE id = ?`, [insertId]);
            resultRows = insertedRows as R[];
          }
        }
      }
      
      return {
        rows: resultRows,
        rowCount: resultRows.length,
        insertId
      };
    };
    
    // Attach query method to connection for compatibility
    (connection as any).query = transactionQuery;
    
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * Execute raw SQL query (for migrations, etc.)
 */
export async function raw(sql: string): Promise<any> {
  try {
    const [result] = await pool.execute(sql);
    return result;
  } catch (error) {
    logger.error('Raw MySQL query error:', error);
    throw error;
  }
}

/**
 * Get connection pool stats
 */
export function getPoolStats() {
  return {
    totalConnections: pool.config.connectionLimit ?? 0
    // Note: mysql2 does not expose active/idle connection counts directly.
  };
}

/**
 * Close all connections (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    logger.info('MySQL connection pool closed');
  } catch (error) {
    logger.error('Error closing MySQL pool:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing MySQL connections...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing MySQL connections...');
  await closePool();
  process.exit(0);
});

export default { query, transaction, raw, getPoolStats, closePool };