-- ============================================================================
-- APPROVAL WORKFLOW TABLES - FIXED VERSION
-- ============================================================================
-- Run in pgAdmin connected to translation_db
-- Note: users.id is BIGINT, translation_contracts.id is BIGINT
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE ENUM TYPES
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM (
            'pending', 'in_progress', 'approved', 'rejected', 
            'cancelled', 'expired', 'on_hold'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_action') THEN
        CREATE TYPE approval_action AS ENUM (
            'submit', 'approve', 'reject', 'request_changes', 
            'delegate', 'escalate', 'cancel'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
    END IF;
END $$;

-- ============================================================================
-- PART 2: CREATE APPROVAL_WORKFLOWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL,
    document_id BIGINT NOT NULL,  -- BIGINT to match translation_contracts.id
    workflow_name VARCHAR(100) NOT NULL,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    status approval_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    deadline TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by_id BIGINT REFERENCES users(id),  -- BIGINT to match users.id
    assigned_to_id BIGINT REFERENCES users(id),  -- BIGINT to match users.id
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_step_range CHECK (current_step >= 1 AND current_step <= total_steps),
    CONSTRAINT valid_total_steps CHECK (total_steps >= 1)
);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_assigned ON approval_workflows(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_document ON approval_workflows(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_created_at ON approval_workflows(created_at);

-- ============================================================================
-- PART 3: CREATE APPROVAL_HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100),
    approver_id BIGINT REFERENCES users(id),  -- BIGINT to match users.id
    action approval_action NOT NULL,
    comments TEXT,
    attachments JSONB DEFAULT '[]',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    action_duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_step_number CHECK (step_number >= 1)
);

CREATE INDEX IF NOT EXISTS idx_approval_history_workflow ON approval_history(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_approver ON approval_history(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_action ON approval_history(action);
CREATE INDEX IF NOT EXISTS idx_approval_history_created_at ON approval_history(created_at);

-- ============================================================================
-- PART 4: CREATE APPROVAL_TOKENS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS approval_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) UNIQUE NOT NULL,
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    approver_id BIGINT REFERENCES users(id),  -- BIGINT to match users.id
    step_number INTEGER NOT NULL,
    decision VARCHAR(20) DEFAULT 'pending',
    expiry_date TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_decision CHECK (decision IN ('approved', 'rejected', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_approval_tokens_token ON approval_tokens(token);
CREATE INDEX IF NOT EXISTS idx_approval_tokens_workflow ON approval_tokens(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_tokens_expiry ON approval_tokens(expiry_date) WHERE used_at IS NULL;

-- ============================================================================
-- PART 5: GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON approval_workflows TO n8n_user;
GRANT SELECT, INSERT, UPDATE ON approval_history TO n8n_user;
GRANT SELECT, INSERT, UPDATE ON approval_tokens TO n8n_user;

-- Grant sequence permissions (if sequences exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'approval_workflows_id_seq') THEN
        GRANT USAGE ON SEQUENCE approval_workflows_id_seq TO n8n_user;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'approval_history_id_seq') THEN
        GRANT USAGE ON SEQUENCE approval_history_id_seq TO n8n_user;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'approval_tokens_id_seq') THEN
        GRANT USAGE ON SEQUENCE approval_tokens_id_seq TO n8n_user;
    END IF;
END $$;

-- ============================================================================
-- PART 6: CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_approval_workflows_updated_at ON approval_workflows;
CREATE TRIGGER update_approval_workflows_updated_at 
    BEFORE UPDATE ON approval_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check tables created
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('approval_workflows', 'approval_history', 'approval_tokens')
ORDER BY table_name;

-- Check column types
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('approval_workflows', 'approval_history', 'approval_tokens')
  AND column_name IN ('id', 'document_id', 'created_by_id', 'assigned_to_id', 'approver_id')
ORDER BY table_name, column_name;
