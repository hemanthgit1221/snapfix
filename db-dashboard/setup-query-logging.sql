-- Create a table to log all database queries
CREATE TABLE IF NOT EXISTS query_log (
    id SERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    query_params JSONB,
    execution_time INTERVAL,
    rows_affected INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'snapfix-website',
    status VARCHAR(20) DEFAULT 'success'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_query_log_timestamp ON query_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_query_log_source ON query_log(source);

-- Create a function to log queries
CREATE OR REPLACE FUNCTION log_query(
    p_query_text TEXT,
    p_query_params JSONB DEFAULT NULL,
    p_execution_time INTERVAL DEFAULT NULL,
    p_rows_affected INTEGER DEFAULT NULL,
    p_source VARCHAR(50) DEFAULT 'snapfix-website',
    p_status VARCHAR(20) DEFAULT 'success'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO query_log (query_text, query_params, execution_time, rows_affected, source, status)
    VALUES (p_query_text, p_query_params, p_execution_time, p_rows_affected, p_source, p_status);
END;
$$ LANGUAGE plpgsql;

-- Create a view for recent queries
CREATE OR REPLACE VIEW recent_query_log AS
SELECT 
    id,
    query_text,
    query_params,
    execution_time,
    rows_affected,
    timestamp,
    source,
    status,
    EXTRACT(EPOCH FROM execution_time) * 1000 as duration_ms
FROM query_log 
ORDER BY timestamp DESC 
LIMIT 100;

-- Function to get recent queries for dashboard
CREATE OR REPLACE FUNCTION get_recent_queries(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id INTEGER,
    query_text TEXT,
    query_params JSONB,
    execution_time INTERVAL,
    rows_affected INTEGER,
    timestamp TIMESTAMP,
    source VARCHAR(50),
    status VARCHAR(20),
    duration_ms NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ql.id,
        ql.query_text,
        ql.query_params,
        ql.execution_time,
        ql.rows_affected,
        ql.timestamp,
        ql.source,
        ql.status,
        EXTRACT(EPOCH FROM ql.execution_time) * 1000 as duration_ms
    FROM query_log ql
    ORDER BY ql.timestamp DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Clean up old query logs (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_query_logs()
RETURNS VOID AS $$
BEGIN
    DELETE FROM query_log 
    WHERE timestamp < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (this would need to be run periodically)
-- For now, we'll clean up manually or through the application
