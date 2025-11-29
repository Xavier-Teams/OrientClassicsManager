-- =====================================================
-- WORKFLOW MONITORING DASHBOARD
-- =====================================================
-- Tạo views và functions để monitoring N8N workflows
-- Last Updated: 2024-12-XX

-- =====================================================
-- PART 1: WORKFLOW EXECUTION STATISTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW v_workflow_execution_stats AS
SELECT 
    workflow_name,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
    COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count,
    ROUND(
        COUNT(CASE WHEN status = 'success' THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as success_rate,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
    MIN(started_at) as first_execution,
    MAX(started_at) as last_execution,
    MAX(completed_at) as last_completion
FROM workflow_execution_logs
GROUP BY workflow_name
ORDER BY total_executions DESC;

-- =====================================================
-- PART 2: RECENT WORKFLOW EXECUTIONS VIEW
-- =====================================================

CREATE OR REPLACE VIEW v_recent_workflow_executions AS
SELECT 
    id,
    workflow_name,
    execution_id,
    step_name,
    status,
    started_at,
    completed_at,
    EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds,
    error_message,
    metadata
FROM workflow_execution_logs
ORDER BY started_at DESC
LIMIT 100;

-- =====================================================
-- PART 3: WORKFLOW ERROR SUMMARY VIEW
-- =====================================================

CREATE OR REPLACE VIEW v_workflow_errors AS
SELECT 
    workflow_name,
    step_name,
    error_message,
    COUNT(*) as error_count,
    MAX(started_at) as last_occurrence,
    MIN(started_at) as first_occurrence
FROM workflow_execution_logs
WHERE status = 'error'
GROUP BY workflow_name, step_name, error_message
ORDER BY error_count DESC, last_occurrence DESC;

-- =====================================================
-- PART 4: WORKFLOW PERFORMANCE METRICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW v_workflow_performance AS
SELECT 
    workflow_name,
    step_name,
    COUNT(*) as execution_count,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
    MIN(EXTRACT(EPOCH FROM (completed_at - started_at))) as min_duration_seconds,
    MAX(EXTRACT(EPOCH FROM (completed_at - started_at))) as max_duration_seconds,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at))) as median_duration_seconds,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at))) as p95_duration_seconds,
    COUNT(CASE WHEN EXTRACT(EPOCH FROM (completed_at - started_at)) > 5 THEN 1 END) as slow_executions_count
FROM workflow_execution_logs
WHERE completed_at IS NOT NULL
GROUP BY workflow_name, step_name
ORDER BY avg_duration_seconds DESC;

-- =====================================================
-- PART 5: NOTIFICATION STATISTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW v_notification_stats AS
SELECT 
    workflow_name,
    step_name,
    COUNT(*) as notification_count,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
    COUNT(DISTINCT DATE(started_at)) as days_active,
    MAX(started_at) as last_notification
FROM workflow_execution_logs
WHERE step_type = 'notification'
GROUP BY workflow_name, step_name
ORDER BY notification_count DESC;

-- =====================================================
-- PART 6: DASHBOARD SUMMARY FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_workflow_dashboard_summary(
    p_days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    total_workflows INTEGER,
    total_executions BIGINT,
    success_rate NUMERIC,
    error_count BIGINT,
    avg_duration_seconds NUMERIC,
    active_workflows INTEGER,
    recent_errors JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(DISTINCT workflow_name) as total_workflows,
            COUNT(*) as total_executions,
            COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
            COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
            AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration
        FROM workflow_execution_logs
        WHERE started_at >= CURRENT_DATE - (p_days_back || ' days')::INTERVAL
    ),
    active_workflows_count AS (
        SELECT COUNT(DISTINCT workflow_name) as active_count
        FROM workflow_execution_logs
        WHERE started_at >= CURRENT_DATE - (p_days_back || ' days')::INTERVAL
    ),
    recent_errors_json AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'workflow_name', workflow_name,
                'step_name', step_name,
                'error_message', error_message,
                'occurred_at', started_at
            )
        ) as errors
        FROM (
            SELECT 
                workflow_name,
                step_name,
                error_message,
                started_at
            FROM workflow_execution_logs
            WHERE status = 'error'
                AND started_at >= CURRENT_DATE - (p_days_back || ' days')::INTERVAL
            ORDER BY started_at DESC
            LIMIT 10
        ) sub
    )
    SELECT 
        stats.total_workflows::INTEGER,
        stats.total_executions,
        ROUND(
            stats.success_count::numeric / 
            NULLIF(stats.total_executions, 0) * 100, 
            2
        ) as success_rate,
        stats.error_count,
        ROUND(stats.avg_duration, 2) as avg_duration_seconds,
        active_workflows_count.active_count::INTEGER,
        COALESCE(recent_errors_json.errors, '[]'::jsonb) as recent_errors
    FROM stats, active_workflows_count, recent_errors_json;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 7: GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON v_workflow_execution_stats TO n8n_user;
GRANT SELECT ON v_recent_workflow_executions TO n8n_user;
GRANT SELECT ON v_workflow_errors TO n8n_user;
GRANT SELECT ON v_workflow_performance TO n8n_user;
GRANT SELECT ON v_notification_stats TO n8n_user;
GRANT EXECUTE ON FUNCTION get_workflow_dashboard_summary TO n8n_user;

-- =====================================================
-- PART 8: INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for workflow_execution_logs (if not exists)
CREATE INDEX IF NOT EXISTS idx_workflow_logs_workflow_name ON workflow_execution_logs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_status ON workflow_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_started_at ON workflow_execution_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_execution_id ON workflow_execution_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_step_type ON workflow_execution_logs(step_type);

-- =====================================================
-- PART 9: COMMENTS
-- =====================================================

COMMENT ON VIEW v_workflow_execution_stats IS 'Statistics summary for each workflow';
COMMENT ON VIEW v_recent_workflow_executions IS 'Most recent 100 workflow executions';
COMMENT ON VIEW v_workflow_errors IS 'Error summary grouped by workflow, step, and error message';
COMMENT ON VIEW v_workflow_performance IS 'Performance metrics for each workflow step';
COMMENT ON VIEW v_notification_stats IS 'Notification statistics by workflow and step';
COMMENT ON FUNCTION get_workflow_dashboard_summary IS 'Get dashboard summary for the last N days';

