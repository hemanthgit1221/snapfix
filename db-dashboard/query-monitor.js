const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class QueryMonitor {
    constructor(pool, io) {
        this.pool = pool;
        this.io = io;
        this.queryLog = [];
        this.maxLogEntries = 200;
        this.isMonitoring = false;
        this.logFile = '/var/lib/postgresql/data/log/postgresql-*.log';
        this.lastPosition = 0;
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('🔍 Starting real-time query monitoring...');
        
        // Start monitoring PostgreSQL logs
        this.monitorPostgresLogs();
        
        // Also monitor queries through connection pooling
        this.monitorConnectionQueries();
    }

    stopMonitoring() {
        this.isMonitoring = false;
        console.log('⏹️ Stopped query monitoring');
    }

    monitorPostgresLogs() {
        // Since we can't directly access PostgreSQL log files in Docker,
        // we'll use a different approach - monitor through pg_stat_statements
        this.setupPgStatStatements();
    }

    async setupPgStatStatements() {
        try {
            // Try to enable pg_stat_statements extension
            await this.pool.query(`
                CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
            `);
            
            // Test if it actually works
            await this.pool.query(`SELECT 1 FROM pg_stat_statements LIMIT 1;`);
            
            console.log('✅ pg_stat_statements extension enabled');
            
            // Start polling for query statistics
            this.pollQueryStats();
            
        } catch (error) {
            console.log('⚠️ pg_stat_statements not available, using alternative monitoring');
            console.log('Error:', error.message);
            this.monitorDatabaseActivity();
        }
    }

    async pollQueryStats() {
        if (!this.isMonitoring) return;
        
        try {
            const result = await this.pool.query(`
                SELECT 
                    query,
                    calls,
                    total_exec_time,
                    mean_exec_time,
                    rows,
                    NOW() as timestamp
                FROM pg_stat_statements 
                WHERE calls > 0
                ORDER BY calls DESC
                LIMIT 10;
            `);
            
            // Process and emit new queries (only if they're different from last poll)
            result.rows.forEach(row => {
                const queryKey = `${row.query}-${row.calls}`;
                if (!this.lastPolledQueries || !this.lastPolledQueries.has(queryKey)) {
                    if (!this.lastPolledQueries) this.lastPolledQueries = new Set();
                    this.lastPolledQueries.add(queryKey);
                    
                    this.addQueryToLog({
                        id: Date.now() + Math.random(),
                        query: row.query.substring(0, 200) + (row.query.length > 200 ? '...' : ''),
                        timestamp: row.timestamp,
                        duration: row.mean_exec_time,
                        rowCount: row.rows,
                        calls: row.calls,
                        source: 'snapfix-website',
                        status: 'success'
                    });
                }
            });
            
        } catch (error) {
            console.error('Error polling query stats:', error);
        }
        
        // Poll every 3 seconds
        setTimeout(() => this.pollQueryStats(), 3000);
    }

    monitorDatabaseActivity() {
        console.log('🔍 Starting database activity monitoring...');
        
        // Monitor database activity through system views
        this.pollDatabaseActivity();
    }

    async pollDatabaseActivity() {
        if (!this.isMonitoring) return;
        
        try {
            // Get current database activity
            const activityResult = await this.pool.query(`
                SELECT 
                    pid,
                    usename,
                    application_name,
                    client_addr,
                    state,
                    query_start,
                    state_change,
                    query
                FROM pg_stat_activity 
                WHERE state = 'active' 
                AND query NOT LIKE '%pg_stat_activity%'
                AND pid <> pg_backend_pid()
                ORDER BY query_start DESC
                LIMIT 5;
            `);
            
            // Get recent table statistics
            const tableStatsResult = await this.pool.query(`
                SELECT 
                    schemaname,
                    relname as tablename,
                    n_tup_ins as inserts,
                    n_tup_upd as updates,
                    n_tup_del as deletes,
                    n_live_tup as live_rows,
                    n_dead_tup as dead_rows
                FROM pg_stat_user_tables 
                WHERE n_tup_ins + n_tup_upd + n_tup_del > 0
                ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
                LIMIT 5;
            `);
            
            // Process active queries
            activityResult.rows.forEach(row => {
                if (row.query && row.query.trim()) {
                    this.addQueryToLog({
                        id: Date.now() + Math.random(),
                        query: row.query.substring(0, 200) + (row.query.length > 200 ? '...' : ''),
                        timestamp: new Date().toISOString(),
                        duration: null,
                        rowCount: null,
                        calls: 1,
                        source: 'snapfix-website',
                        status: 'active',
                        application: row.application_name || 'snapfix-backend'
                    });
                }
            });
            
            // Process table statistics as activity indicators
            tableStatsResult.rows.forEach(row => {
                const totalOps = row.inserts + row.updates + row.deletes;
                if (totalOps > 0) {
                    this.addQueryToLog({
                        id: Date.now() + Math.random(),
                        query: `Table Activity: ${row.tablename} (${row.inserts} inserts, ${row.updates} updates, ${row.deletes} deletes)`,
                        timestamp: new Date().toISOString(),
                        duration: null,
                        rowCount: row.live_rows,
                        calls: totalOps,
                        source: 'snapfix-website',
                        status: 'activity',
                        table: row.tablename
                    });
                }
            });
            
        } catch (error) {
            console.error('Error monitoring database activity:', error);
        }
        
        // Poll every 5 seconds
        setTimeout(() => this.pollDatabaseActivity(), 5000);
    }

    monitorConnectionQueries() {
        // Monitor queries through the connection pool
        const originalQuery = this.pool.query.bind(this.pool);
        
        this.pool.query = async (text, params) => {
            const startTime = Date.now();
            const queryId = Date.now() + Math.random();
            
            // Add query to log
            this.addQueryToLog({
                id: queryId,
                query: typeof text === 'string' ? text : text.text,
                params: params,
                timestamp: new Date().toISOString(),
                source: 'dashboard',
                status: 'executing'
            });
            
            try {
                const result = await originalQuery(text, params);
                const duration = Date.now() - startTime;
                
                // Update query in log
                this.updateQueryInLog(queryId, {
                    status: 'success',
                    duration: duration,
                    rowCount: result.rowCount
                });
                
                return result;
            } catch (error) {
                const duration = Date.now() - startTime;
                
                // Update query in log
                this.updateQueryInLog(queryId, {
                    status: 'error',
                    duration: duration,
                    error: error.message
                });
                
                throw error;
            }
        };
    }

    addQueryToLog(queryEntry) {
        // Avoid duplicates by checking recent queries
        const recentQuery = this.queryLog.find(q => 
            q.query === queryEntry.query && 
            q.source === queryEntry.source &&
            Date.now() - new Date(q.timestamp).getTime() < 1000
        );
        
        if (recentQuery) {
            // Update existing entry
            recentQuery.calls = (recentQuery.calls || 1) + 1;
            recentQuery.timestamp = queryEntry.timestamp;
            this.io.emit('queryUpdate', recentQuery);
            return;
        }
        
        // Add new query
        this.queryLog.unshift(queryEntry);
        if (this.queryLog.length > this.maxLogEntries) {
            this.queryLog.pop();
        }
        
        // Emit to all connected clients
        this.io.emit('queryLog', queryEntry);
    }

    updateQueryInLog(queryId, updates) {
        const queryIndex = this.queryLog.findIndex(q => q.id === queryId);
        if (queryIndex !== -1) {
            Object.assign(this.queryLog[queryIndex], updates);
            this.io.emit('queryUpdate', this.queryLog[queryIndex]);
        }
    }

    getQueryLog() {
        return this.queryLog;
    }

    clearQueryLog() {
        this.queryLog = [];
        this.io.emit('queryLogCleared');
    }
}

module.exports = QueryMonitor;
