-- ============================================================================
-- N8N DATABASE SETUP - PART 2 (Run on translation_db)
-- ============================================================================
-- After running part 1, connect to translation_db database and run this

-- Grant SELECT permissions on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO n8n_user;

-- Grant SELECT permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO n8n_user;

-- Grant USAGE on sequences (needed for some operations)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO n8n_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO n8n_user;

-- Grant USAGE on schema
GRANT USAGE ON SCHEMA public TO n8n_user;

-- Verify permissions
SELECT 
    schemaname,
    tablename,
    has_table_privilege('n8n_user', schemaname||'.'||tablename, 'SELECT') as can_select
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
