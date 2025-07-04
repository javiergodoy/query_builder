import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ Database connection error:', err));

// Routes

// Get database schema information
app.get('/api/schema', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        tc.constraint_type
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
      LEFT JOIN information_schema.key_column_usage kcu ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
      LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name, c.ordinal_position;
    `;
    
    const result = await pool.query(query);
    
    // Group by table
    const tables = {};
    result.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = {
          name: row.table_name,
          columns: []
        };
      }
      
      if (row.column_name) {
        tables[row.table_name].columns.push({
          name: row.column_name,
          type: mapPostgreSQLTypeByName(row.data_type), // Use the new mapping function
          nullable: row.is_nullable === 'YES',
          default: row.column_default,
          constraint: row.constraint_type
        });
      }
    });
    
    res.json(Object.values(tables));
  } catch (error) {
    console.error('Schema error:', error);
    res.status(500).json({ error: 'Failed to fetch schema' });
  }
});

// Execute SQL query
app.post('/api/execute', async (req, res) => {
  try {
    const { sql } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }
    
    console.log('Executing SQL:', sql);
    
    const startTime = Date.now();
    const result = await pool.query(sql);
    const executionTime = Date.now() - startTime;
    
    const columns = result.fields.map(field => ({
      name: field.name,
      type: getPostgreSQLType(field.dataTypeID)
    }));
    
    res.json({
      columns,
      rows: result.rows,
      rowCount: result.rowCount,
      executionTime
    });
    
  } catch (error) {
    console.error('Query execution error:', error);
    res.status(500).json({ 
      error: error.message,
      detail: error.detail,
      hint: error.hint
    });
  }
});

// Get table data preview
app.get('/api/tables/:tableName/preview', async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const query = `SELECT * FROM ${tableName} LIMIT $1`;
    const result = await pool.query(query, [limit]);
    
    const columns = result.fields.map(field => ({
      name: field.name,
      type: getPostgreSQLType(field.dataTypeID)
    }));
    
    res.json({
      columns,
      rows: result.rows,
      rowCount: result.rowCount
    });
    
  } catch (error) {
    console.error('Table preview error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to map PostgreSQL data types
function getPostgreSQLType(dataTypeID) {
  const typeMap = {
    20: 'number',    // bigint
    21: 'number',    // smallint
    23: 'number',    // integer
    25: 'string',    // text
    700: 'number',   // real
    701: 'number',   // double precision
    1043: 'string',  // varchar
    1082: 'date',    // date
    1114: 'date',    // timestamp
    1184: 'date',    // timestamptz
    16: 'boolean',   // boolean
  };
  
  return typeMap[dataTypeID] || 'string';
}

// Helper function to map PostgreSQL type names to simple types
function mapPostgreSQLTypeByName(typeName) {
  const lowerType = typeName.toLowerCase();
  
  if (lowerType.includes('int') || lowerType.includes('numeric') || lowerType.includes('decimal') || lowerType.includes('real') || lowerType.includes('double')) {
    return 'number';
  }
  
  if (lowerType.includes('date') || lowerType.includes('time')) {
    return 'date';
  }
  
  if (lowerType.includes('bool')) {
    return 'boolean';
  }
  
  // Default to string for text, varchar, char, etc.
  return 'string';
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
