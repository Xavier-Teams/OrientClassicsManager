-- ============================================================================
-- N8N DATABASE ABSTRACTION LAYER
-- ============================================================================
-- Giảm thiểu database coupling bằng cách tạo views và functions
-- Run in pgAdmin (connected to translation_db)
-- ============================================================================

-- ============================================================================
-- PART 0: CREATE DEPENDENCIES (Workflow Levels Table)
-- ============================================================================

-- Create workflow_levels table if not exists (required for views and functions)
CREATE TABLE IF NOT EXISTS workflow_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL,  -- 'contract', 'document', 'proposal', etc.
    level_number INTEGER NOT NULL,         -- 1, 2, 3, ... (sequential)
    level_name VARCHAR(100) NOT NULL,      -- 'Manager Approval', 'Director Approval', etc.
    role_id VARCHAR(50) NOT NULL,          -- 'manager', 'truong_ban_thu_ky', 'pho_chu_nhiem', 'chu_nhiem'
    is_required BOOLEAN DEFAULT TRUE,       -- Level có bắt buộc không
    timeout_hours INTEGER DEFAULT 48,      -- Thời gian timeout (hours)
    reminder_hours INTEGER DEFAULT 24,    -- Thời gian nhắc nhở trước khi timeout (hours)
    auto_approve_conditions JSONB DEFAULT '{}',  -- Điều kiện auto-approve (JSON)
    description TEXT,                       -- Mô tả level
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_level_number CHECK (level_number >= 1),
    CONSTRAINT valid_timeout CHECK (timeout_hours > 0),
    CONSTRAINT valid_reminder CHECK (reminder_hours >= 0 AND reminder_hours < timeout_hours),
    UNIQUE(document_type, level_number)
);

CREATE INDEX IF NOT EXISTS idx_workflow_levels_document_type ON workflow_levels(document_type);
CREATE INDEX IF NOT EXISTS idx_workflow_levels_level_number ON workflow_levels(level_number);
CREATE INDEX IF NOT EXISTS idx_workflow_levels_role ON workflow_levels(role_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_workflow_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_workflow_levels_updated_at ON workflow_levels;
CREATE TRIGGER update_workflow_levels_updated_at 
    BEFORE UPDATE ON workflow_levels 
    FOR EACH ROW EXECUTE FUNCTION update_workflow_levels_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON workflow_levels TO n8n_user;

-- Seed default workflow levels for contracts (if not exists)
INSERT INTO workflow_levels (document_type, level_number, level_name, role_id, timeout_hours, reminder_hours, description, is_required)
VALUES 
    ('contract', 1, 'Manager Approval - Level 1', 'truong_ban_thu_ky', 48, 24, 'Initial approval by Manager/Trưởng ban Thư ký', TRUE),
    ('contract', 2, 'Director Approval - Level 2', 'pho_chu_nhiem', 72, 24, 'Second level approval by Director/Phó Chủ nhiệm', TRUE),
    ('contract', 3, 'CEO Approval - Level 3', 'chu_nhiem', 96, 48, 'Final approval by CEO/Chủ nhiệm (for high-value contracts)', FALSE)
ON CONFLICT (document_type, level_number) DO UPDATE
SET level_name = EXCLUDED.level_name,
    role_id = EXCLUDED.role_id,
    timeout_hours = EXCLUDED.timeout_hours,
    reminder_hours = EXCLUDED.reminder_hours,
    description = EXCLUDED.description,
    is_required = EXCLUDED.is_required,
    updated_at = NOW();

COMMENT ON TABLE workflow_levels IS 'Dynamic workflow levels for multi-level approval - defines approval hierarchy';

-- ============================================================================
-- PART 1: CREATE VIEWS (Abstraction Layer)
-- ============================================================================

-- View: Contract với approval info (thay vì query translation_contracts trực tiếp)
CREATE OR REPLACE VIEW v_contracts_for_approval AS
SELECT 
    c.id,
    c.contract_number,
    c.work_id,
    c.translator_id,
    c.status as contract_status,
    c.total_amount,
    c.advance_payment_1,
    c.advance_payment_2,
    c.final_payment,
    c.start_date,
    c.end_date,
    c.signed_at,
    c.contract_file,
    c.created_by_id,
    u.email as creator_email,
    u.full_name as creator_name,
    u.role as creator_role,
    u.id as creator_user_id,
    aw.id as workflow_id,
    aw.status as workflow_status,
    aw.current_step,
    aw.total_steps,
    aw.created_at as workflow_created_at,
    c.created_at as contract_created_at,
    c.updated_at as contract_updated_at
FROM translation_contracts c
LEFT JOIN users u ON c.created_by_id = u.id
LEFT JOIN approval_workflows aw ON aw.document_id = c.id 
    AND aw.document_type = 'contract'
    AND aw.status IN ('pending', 'in_progress');

COMMENT ON VIEW v_contracts_for_approval IS 'View for N8N to query contracts with approval info - abstracts table structure';

-- View: Approval workflow với level info
CREATE OR REPLACE VIEW v_approval_workflows_detail AS
SELECT 
    aw.id as workflow_id,
    aw.document_type,
    aw.document_id,
    aw.workflow_name,
    aw.current_step,
    aw.total_steps,
    aw.status as workflow_status,
    aw.priority,
    aw.deadline,
    aw.started_at,
    aw.completed_at,
    aw.created_by_id,
    aw.assigned_to_id,
    wl.level_number as current_level_number,
    wl.level_name as current_level_name,
    wl.role_id as current_level_role,
    wl.timeout_hours as current_level_timeout,
    aw.created_at,
    aw.updated_at
FROM approval_workflows aw
LEFT JOIN workflow_levels wl ON wl.document_type = aw.document_type 
    AND wl.level_number = aw.current_step
    AND wl.is_required = TRUE;

COMMENT ON VIEW v_approval_workflows_detail IS 'View for N8N to query workflows with current level info';

-- View: Approval tokens với workflow và approver info
CREATE OR REPLACE VIEW v_approval_tokens_detail AS
SELECT 
    at.id as token_id,
    at.token,
    at.workflow_id,
    at.approver_id,
    at.step_number,
    at.decision,
    at.expiry_date,
    at.used_at,
    at.created_at as token_created_at,
    aw.document_id,
    aw.document_type,
    aw.current_step,
    aw.total_steps,
    aw.status as workflow_status,
    u.email as approver_email,
    u.full_name as approver_name,
    u.role as approver_role,
    wl.level_name,
    wl.timeout_hours
FROM approval_tokens at
INNER JOIN approval_workflows aw ON at.workflow_id = aw.id
LEFT JOIN users u ON at.approver_id = u.id
LEFT JOIN workflow_levels wl ON wl.document_type = aw.document_type 
    AND wl.level_number = at.step_number;

COMMENT ON VIEW v_approval_tokens_detail IS 'View for N8N to query tokens with full context';

-- View: Next level info for workflow
CREATE OR REPLACE VIEW v_workflow_next_level AS
SELECT 
    aw.id as workflow_id,
    aw.document_type,
    aw.current_step,
    aw.total_steps,
    wl.level_number as next_level_number,
    wl.level_name as next_level_name,
    wl.role_id as next_role_id,
    wl.timeout_hours as next_timeout_hours,
    wl.is_required as next_is_required,
    CASE 
        WHEN wl.level_number IS NULL THEN false
        ELSE true
    END as has_next_level
FROM approval_workflows aw
LEFT JOIN workflow_levels wl ON wl.document_type = aw.document_type 
    AND wl.level_number = aw.current_step + 1
    AND wl.is_required = TRUE;

COMMENT ON VIEW v_workflow_next_level IS 'View to check if workflow has next level';

-- Grant permissions
GRANT SELECT ON v_contracts_for_approval TO n8n_user;
GRANT SELECT ON v_approval_workflows_detail TO n8n_user;
GRANT SELECT ON v_approval_tokens_detail TO n8n_user;
GRANT SELECT ON v_workflow_next_level TO n8n_user;

-- ============================================================================
-- PART 2: CREATE STORED FUNCTIONS (Business Logic Abstraction)
-- ============================================================================

-- Function: Submit contract for approval
CREATE OR REPLACE FUNCTION submit_contract_for_approval(
    p_contract_id BIGINT,
    p_created_by_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
    workflow_id UUID,
    total_steps INTEGER,
    current_step INTEGER,
    first_level_role VARCHAR
) AS $$
DECLARE
    v_workflow_id UUID;
    v_total_steps INTEGER;
    v_contract_number VARCHAR;
    v_creator_id BIGINT;
    v_first_level_role VARCHAR;
BEGIN
    -- Get contract info
    SELECT 
        contract_number,
        COALESCE(p_created_by_id, created_by_id)
    INTO 
        v_contract_number,
        v_creator_id
    FROM translation_contracts
    WHERE id = p_contract_id;
    
    IF v_contract_number IS NULL THEN
        RAISE EXCEPTION 'Contract with ID % not found', p_contract_id;
    END IF;
    
    -- Get total steps and first level role from workflow_levels
    SELECT 
        COUNT(*),
        MIN(role_id) FILTER (WHERE level_number = 1)
    INTO 
        v_total_steps,
        v_first_level_role
    FROM workflow_levels
    WHERE document_type = 'contract' AND is_required = TRUE;
    
    IF v_total_steps = 0 THEN
        RAISE EXCEPTION 'No workflow levels configured for contract type';
    END IF;
    
    -- Create workflow
    INSERT INTO approval_workflows (
        document_type,
        document_id,
        workflow_name,
        total_steps,
        current_step,
        created_by_id,
        assigned_to_id,
        status,
        started_at
    ) VALUES (
        'contract',
        p_contract_id,
        'Contract Approval - ' || v_contract_number,
        v_total_steps,
        1,
        v_creator_id,
        v_creator_id,
        'in_progress',
        NOW()
    ) RETURNING id INTO v_workflow_id;
    
    RETURN QUERY
    SELECT 
        v_workflow_id,
        v_total_steps,
        1 as current_step,
        v_first_level_role;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION submit_contract_for_approval IS 'Submit contract for approval - abstracts workflow creation logic';

-- Function: Get approver for specific level
CREATE OR REPLACE FUNCTION get_approver_for_level(
    p_document_type VARCHAR(50),
    p_level_number INTEGER
)
RETURNS TABLE (
    user_id BIGINT,
    email VARCHAR,
    full_name VARCHAR,
    role VARCHAR,
    level_name VARCHAR,
    timeout_hours INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        wl.level_name,
        wl.timeout_hours
    FROM users u
    INNER JOIN workflow_levels wl ON u.role = wl.role_id
    WHERE wl.document_type = p_document_type
      AND wl.level_number = p_level_number
      AND wl.is_required = TRUE
    ORDER BY 
        CASE u.role
            WHEN 'truong_ban_thu_ky' THEN 1
            WHEN 'pho_chu_nhiem' THEN 2
            WHEN 'chu_nhiem' THEN 3
            WHEN 'manager' THEN 4
            ELSE 5
        END
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_approver_for_level IS 'Get approver for specific workflow level - abstracts user query logic';

-- Function: Process approval decision and return next level info
CREATE OR REPLACE FUNCTION process_approval_decision(
    p_token VARCHAR(64),
    p_decision VARCHAR(20)
)
RETURNS TABLE (
    workflow_id UUID,
    document_id BIGINT,
    document_type VARCHAR,
    current_step INTEGER,
    total_steps INTEGER,
    has_next_level BOOLEAN,
    next_level_number INTEGER,
    next_level_name VARCHAR,
    next_role_id VARCHAR,
    next_timeout_hours INTEGER
) AS $$
DECLARE
    v_workflow_id UUID;
    v_document_id BIGINT;
    v_document_type VARCHAR;
    v_current_step INTEGER;
    v_total_steps INTEGER;
    v_next_level_number INTEGER;
    v_next_level_name VARCHAR;
    v_next_role_id VARCHAR;
    v_next_timeout_hours INTEGER;
BEGIN
    -- Validate token and get workflow info
    SELECT 
        at.workflow_id,
        aw.document_id,
        aw.document_type,
        aw.current_step,
        aw.total_steps
    INTO 
        v_workflow_id,
        v_document_id,
        v_document_type,
        v_current_step,
        v_total_steps
    FROM approval_tokens at
    INNER JOIN approval_workflows aw ON at.workflow_id = aw.id
    WHERE at.token = p_token
      AND at.expiry_date > NOW()
      AND at.used_at IS NULL;
    
    IF v_workflow_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired token: %', p_token;
    END IF;
    
    -- Validate decision
    IF p_decision NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'Invalid decision: %. Must be "approved" or "rejected"', p_decision;
    END IF;
    
    -- Update token decision
    UPDATE approval_tokens
    SET decision = p_decision,
        used_at = NOW()
    WHERE token = p_token;
    
    -- If approved, check for next level
    IF p_decision = 'approved' THEN
        SELECT 
            wl.level_number,
            wl.level_name,
            wl.role_id,
            wl.timeout_hours
        INTO 
            v_next_level_number,
            v_next_level_name,
            v_next_role_id,
            v_next_timeout_hours
        FROM workflow_levels wl
        WHERE wl.document_type = v_document_type
          AND wl.level_number = v_current_step + 1
          AND wl.is_required = TRUE
        LIMIT 1;
    END IF;
    
    RETURN QUERY
    SELECT 
        v_workflow_id,
        v_document_id,
        v_document_type,
        v_current_step,
        v_total_steps,
        (v_next_level_number IS NOT NULL) as has_next_level,
        v_next_level_number,
        v_next_level_name,
        v_next_role_id,
        v_next_timeout_hours;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_approval_decision IS 'Process approval decision and return next level info - abstracts decision logic';

-- Function: Create approval token for level
CREATE OR REPLACE FUNCTION create_approval_token(
    p_workflow_id UUID,
    p_approver_id BIGINT,
    p_step_number INTEGER,
    p_timeout_hours INTEGER DEFAULT 48
)
RETURNS TABLE (
    token VARCHAR,
    expiry_date TIMESTAMP,
    token_id UUID
) AS $$
DECLARE
    v_token VARCHAR(64);
    v_expiry_date TIMESTAMP;
    v_token_id UUID;
BEGIN
    -- Generate token (simple version - in production use crypto)
    v_token := encode(gen_random_bytes(32), 'hex');
    v_expiry_date := NOW() + (p_timeout_hours || ' hours')::INTERVAL;
    
    -- Insert token
    INSERT INTO approval_tokens (
        token,
        workflow_id,
        approver_id,
        step_number,
        decision,
        expiry_date
    ) VALUES (
        v_token,
        p_workflow_id,
        p_approver_id,
        p_step_number,
        'pending',
        v_expiry_date
    ) RETURNING id, token, expiry_date INTO v_token_id, v_token, v_expiry_date;
    
    RETURN QUERY
    SELECT 
        v_token,
        v_expiry_date,
        v_token_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_approval_token IS 'Create approval token - abstracts token generation';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION submit_contract_for_approval TO n8n_user;
GRANT EXECUTE ON FUNCTION get_approver_for_level TO n8n_user;
GRANT EXECUTE ON FUNCTION process_approval_decision TO n8n_user;
GRANT EXECUTE ON FUNCTION create_approval_token TO n8n_user;

-- ============================================================================
-- PART 3: CREATE AUDIT LOGGING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS n8n_workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(100) NOT NULL,
    execution_id VARCHAR(100),
    node_name VARCHAR(100),
    node_type VARCHAR(50),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'warning', 'info')),
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    error_stack TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_n8n_logs_workflow ON n8n_workflow_logs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_n8n_logs_execution ON n8n_workflow_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_n8n_logs_status ON n8n_workflow_logs(status);
CREATE INDEX IF NOT EXISTS idx_n8n_logs_created_at ON n8n_workflow_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_n8n_logs_node ON n8n_workflow_logs(node_name);

GRANT INSERT, SELECT ON n8n_workflow_logs TO n8n_user;

COMMENT ON TABLE n8n_workflow_logs IS 'Audit logging for N8N workflows - helps with debugging';

-- ============================================================================
-- PART 4: HELPER FUNCTIONS FOR LOGGING
-- ============================================================================

-- Function: Log workflow execution
CREATE OR REPLACE FUNCTION log_workflow_execution(
    p_workflow_name VARCHAR(100),
    p_execution_id VARCHAR(100),
    p_node_name VARCHAR(100),
    p_node_type VARCHAR(50),
    p_status VARCHAR(20),
    p_input_data JSONB DEFAULT NULL,
    p_output_data JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_error_stack TEXT DEFAULT NULL,
    p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO n8n_workflow_logs (
        workflow_name,
        execution_id,
        node_name,
        node_type,
        status,
        input_data,
        output_data,
        error_message,
        error_stack,
        execution_time_ms
    ) VALUES (
        p_workflow_name,
        p_execution_id,
        p_node_name,
        p_node_type,
        p_status,
        p_input_data,
        p_output_data,
        p_error_message,
        p_error_stack,
        p_execution_time_ms
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION log_workflow_execution TO n8n_user;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check views created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'v_%'
ORDER BY table_name;

-- Check functions created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'submit_contract_for_approval',
    'get_approver_for_level',
    'process_approval_decision',
    'create_approval_token',
    'log_workflow_execution'
  )
ORDER BY routine_name;

-- Test views
-- SELECT * FROM v_contracts_for_approval WHERE id = 3;
-- SELECT * FROM v_approval_workflows_detail LIMIT 5;
-- SELECT * FROM v_approval_tokens_detail WHERE token = 'test';

-- Test functions
-- SELECT * FROM submit_contract_for_approval(3, 1);
-- SELECT * FROM get_approver_for_level('contract', 1);
-- SELECT * FROM process_approval_decision('token', 'approved');

