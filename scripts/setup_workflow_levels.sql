-- ============================================================================
-- WORKFLOW LEVELS TABLE - Dynamic Multi-Level Approval
-- ============================================================================
-- Based on N8N template: https://n8n.io/workflows/8174-automate-document-approvals-with-multi-level-workflows-using-supabase-and-gmail/
-- Run in pgAdmin (connected to translation_db)
-- ============================================================================

-- ============================================================================
-- CREATE WORKFLOW_LEVELS TABLE
-- ============================================================================

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

-- ============================================================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

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

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON workflow_levels TO n8n_user;

-- ============================================================================
-- SEED DATA - Contract Approval Levels
-- ============================================================================

-- Level 1: Manager/Trưởng ban Thư ký
INSERT INTO workflow_levels (document_type, level_number, level_name, role_id, timeout_hours, reminder_hours, description)
VALUES (
    'contract',
    1,
    'Manager Approval - Level 1',
    'truong_ban_thu_ky',
    48,
    24,
    'Initial approval by Manager/Trưởng ban Thư ký'
)
ON CONFLICT (document_type, level_number) DO UPDATE
SET level_name = EXCLUDED.level_name,
    role_id = EXCLUDED.role_id,
    timeout_hours = EXCLUDED.timeout_hours,
    reminder_hours = EXCLUDED.reminder_hours,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Level 2: Director/Phó Chủ nhiệm
INSERT INTO workflow_levels (document_type, level_number, level_name, role_id, timeout_hours, reminder_hours, description)
VALUES (
    'contract',
    2,
    'Director Approval - Level 2',
    'pho_chu_nhiem',
    72,
    24,
    'Second level approval by Director/Phó Chủ nhiệm'
)
ON CONFLICT (document_type, level_number) DO UPDATE
SET level_name = EXCLUDED.level_name,
    role_id = EXCLUDED.role_id,
    timeout_hours = EXCLUDED.timeout_hours,
    reminder_hours = EXCLUDED.reminder_hours,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Level 3: CEO/Chủ nhiệm (Optional - có thể bật/tắt)
INSERT INTO workflow_levels (document_type, level_number, level_name, role_id, timeout_hours, reminder_hours, description, is_required)
VALUES (
    'contract',
    3,
    'CEO Approval - Level 3',
    'chu_nhiem',
    96,
    48,
    'Final approval by CEO/Chủ nhiệm (for high-value contracts)',
    FALSE  -- Optional level
)
ON CONFLICT (document_type, level_number) DO UPDATE
SET level_name = EXCLUDED.level_name,
    role_id = EXCLUDED.role_id,
    timeout_hours = EXCLUDED.timeout_hours,
    reminder_hours = EXCLUDED.reminder_hours,
    description = EXCLUDED.description,
    is_required = EXCLUDED.is_required,
    updated_at = NOW();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check workflow levels created
SELECT 
    document_type,
    level_number,
    level_name,
    role_id,
    is_required,
    timeout_hours,
    reminder_hours
FROM workflow_levels
WHERE document_type = 'contract'
ORDER BY level_number;

-- Count levels per document type
SELECT 
    document_type,
    COUNT(*) as total_levels,
    SUM(CASE WHEN is_required THEN 1 ELSE 0 END) as required_levels
FROM workflow_levels
GROUP BY document_type;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get next level
CREATE OR REPLACE FUNCTION get_next_workflow_level(
    p_document_type VARCHAR(50),
    p_current_level INTEGER
)
RETURNS TABLE (
    id UUID,
    level_number INTEGER,
    level_name VARCHAR(100),
    role_id VARCHAR(50),
    timeout_hours INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wl.id,
        wl.level_number,
        wl.level_name,
        wl.role_id,
        wl.timeout_hours
    FROM workflow_levels wl
    WHERE wl.document_type = p_document_type
      AND wl.level_number = p_current_level + 1
      AND wl.is_required = TRUE
    ORDER BY wl.level_number
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get total steps for document type
CREATE OR REPLACE FUNCTION get_total_workflow_steps(
    p_document_type VARCHAR(50)
)
RETURNS INTEGER AS $$
DECLARE
    v_total_steps INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_steps
    FROM workflow_levels
    WHERE document_type = p_document_type
      AND is_required = TRUE;
    
    RETURN COALESCE(v_total_steps, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Get all levels for contracts
-- SELECT * FROM workflow_levels WHERE document_type = 'contract' ORDER BY level_number;

-- Get next level after level 1
-- SELECT * FROM get_next_workflow_level('contract', 1);

-- Get total steps for contracts
-- SELECT get_total_workflow_steps('contract');

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. Level numbers must be sequential (1, 2, 3, ...)
-- 2. Each document_type can have different number of levels
-- 3. is_required = FALSE means level can be skipped (optional)
-- 4. timeout_hours: Time before approval expires
-- 5. reminder_hours: Time before timeout to send reminder
-- 6. auto_approve_conditions: JSON for future auto-approval logic
--    Example: {"max_amount": 1000000, "auto_approve": true}

