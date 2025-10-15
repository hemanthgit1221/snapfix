const express = require('express');
const { Pool } = require('pg');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const QueryMonitor = require('./query-monitor');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'snapfix',
  user: process.env.DB_USER || 'snapfix_user',
  password: process.env.DB_PASSWORD || 'snapfix_password',
});

// Initialize query monitor
const queryMonitor = new QueryMonitor(pool, io);

// Enhanced query execution with logging
async function executeQuery(query, params = []) {
  const startTime = Date.now();
  const logEntry = {
    id: Date.now(),
    query: query,
    params: params,
    timestamp: new Date().toISOString(),
    status: 'executing',
    source: 'dashboard'
  };
  
  queryMonitor.addQueryToLog(logEntry);
  
  try {
    const result = await pool.query(query, params);
    const duration = Date.now() - startTime;
    
    queryMonitor.updateQueryInLog(logEntry.id, {
      status: 'success',
      duration: duration,
      rowCount: result.rowCount
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    queryMonitor.updateQueryInLog(logEntry.id, {
      status: 'error',
      duration: duration,
      error: error.message
    });
    
    throw error;
  }
}

// API Routes
app.get('/api/tables', async (req, res) => {
  try {
    const result = await executeQuery(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await executeQuery(`
      SELECT * FROM ${tableName} 
      ORDER BY id DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const countResult = await executeQuery(`SELECT COUNT(*) FROM ${tableName}`);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/table-structure/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await executeQuery(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/query-log', (req, res) => {
  res.json(queryMonitor.getQueryLog());
});

app.post('/api/execute-query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const result = await executeQuery(query);
    res.json({
      data: result.rows,
      rowCount: result.rowCount,
      command: result.command
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected to dashboard');
  
  // Send initial query log
  socket.emit('queryLog', queryMonitor.getQueryLog());
  
  // Handle query log clearing
  socket.on('clearQueryLog', () => {
    queryMonitor.clearQueryLog();
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected from dashboard');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Database Dashboard running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
  
  // Start query monitoring
  queryMonitor.startMonitoring();
});
