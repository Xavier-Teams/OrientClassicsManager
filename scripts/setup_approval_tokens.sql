-- ============================================================================
-- APPROVAL TOKENS TABLE FOR N8N WORKFLOW
-- ============================================================================
-- Run this in translation_db to support approval token system

-- Create approval_tokens table
CREATE TABLE IF NOT EXISTS approval_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) UNIQUE NOT NULL,
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES users(id),
    step_number INTEGER NOT NULL,
    decision VARCHAR(20), -- 'approved', 'rejected', 'pending'
    expiry_date TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_decision CHECK (decision IN ('approved', 'rejected', 'pending'))
);

-- Create indexes
CREATE INDEX idx_approval_tokens_token ON approval_tokens(token);
CREATE INDEX idx_approval_tokens_workflow ON approval_tokens(workflow_id);
CREATE INDEX idx_approval_tokens_expiry ON approval_tokens(expiry_date) WHERE used_at IS NULL;

-- Grant permissions to n8n_user
GRANT SELECT, INSERT, UPDATE ON approval_tokens TO n8n_user;
GRANT USAGE ON SEQUENCE approval_tokens_id_seq TO n8n_user;

-- Function to check if token is valid
CREATE OR REPLACE FUNCTION is_token_valid(p_token VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM approval_tokens 
        WHERE token = p_token 
          AND expiry_date > NOW() 
          AND used_at IS NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_token_valid(VARCHAR) TO n8n_user;
