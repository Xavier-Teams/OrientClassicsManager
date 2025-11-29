-- ============================================================================
-- APPROVAL WORKFLOW SYSTEM - DATABASE SETUP
-- ============================================================================
-- File: scripts/setup_approval_workflow.sql
-- Description: Database schema for document approval workflow system
-- Version: 1.0
-- Date: 2024-11-27
-- ============================================================================

-- Drop existing objects if they exist (for development)
DROP TABLE IF EXISTS approval_history CASCADE;
DROP TABLE IF EXISTS workflow_steps CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS approval_action CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Approval workflow status
CREATE TYPE approval_status AS ENUM (
    'pending',      -- Chờ xử lý
    'in_progress',  -- Đang xử lý
    'approved',     -- Đã phê duyệt
    'rejected',     -- Bị từ chối
    'cancelled',    -- Đã hủy
    'expired',      -- Hết hạn
    'on_hold'       -- Tạm dừng
);

-- Approval actions
CREATE TYPE approval_action AS ENUM (
    'submit',           -- Gửi phê duyệt
    'approve',          -- Phê duyệt
    'reject',           -- Từ chối
    'request_changes',  -- Yêu cầu chỉnh sửa
    'delegate',         -- Ủy quyền
    'escalate',         -- Báo cáo cấp trên
    'cancel'            -- Hủy bỏ
);

-- Priority levels
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Bảng quản lý workflow phê duyệt
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Document information
    document_type VARCHAR(50) NOT NULL, -- 'contract', 'document', 'proposal', 'report'
    document_id UUID NOT NULL,
    
    -- Workflow information
    workflow_name VARCHAR(100) NOT NULL,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    status approval_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    
    -- Timing
    deadline TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- People
    created_by_id UUID REFERENCES users(id),
    assigned_to_id UUID REFERENCES users(id),
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_step_range CHECK (current_step >= 1 AND current_step <= total_steps),
    CONSTRAINT valid_total_steps CHECK (total_steps >= 1)
);

-- Bảng định nghĩa các bước trong workflow
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    
    -- Step information
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_description TEXT,
    
    -- Approver information
    approver_role VARCHAR(50), -- 'manager', 'director', 'ceo', 'specialist'
    approver_id UUID REFERENCES users(id),
    
    -- Step configuration
    is_parallel BOOLEAN DEFAULT FALSE,    -- Can be processed in parallel with other steps
    is_optional BOOLEAN DEFAULT FALSE,    -- Step can be skipped
    is_auto_approve BOOLEAN DEFAULT FALSE, -- Auto-approve based on conditions
    
    -- Timing
    timeout_hours INTEGER DEFAULT 72,
    reminder_hours INTEGER DEFAULT 24,
    
    -- Conditions for auto-approval (JSON)
    auto_approve_conditions JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_step_number CHECK (step_number >= 1),
    CONSTRAINT valid_timeout CHECK (timeout_hours > 0),
    UNIQUE(workflow_id, step_number)
);

-- Bảng lưu lịch sử phê duyệt
CREATE TABLE approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
    
    -- Step information
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100),
    
    -- Action information
    approver_id UUID REFERENCES users(id),
    action approval_action NOT NULL,
    comments TEXT,
    
    -- Attachments and files
    attachments JSONB DEFAULT '[]',
    
    -- Audit information
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    -- Timing
    action_duration_seconds INTEGER, -- Time taken to make decision
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_step_number CHECK (step_number >= 1)
);

-- Bảng cấu hình workflow templates
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template information
    name VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    
    -- Template configuration
    steps_config JSONB NOT NULL, -- JSON configuration for workflow steps
    default_settings JSONB DEFAULT '{}',
    
    -- Conditions for template usage
    usage_conditions JSONB DEFAULT '{}', -- When to use this template
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- People
    created_by_id UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_version CHECK (version >= 1),
    UNIQUE(document_type, name, version)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Approval workflows indexes
CREATE INDEX idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX idx_approval_workflows_assigned ON approval_workflows(assigned_to_id);
CREATE INDEX idx_approval_workflows_creator ON approval_workflows(created_by_id);
CREATE INDEX idx_approval_workflows_document ON approval_workflows(document_type, document_id);
CREATE INDEX idx_approval_workflows_priority ON approval_workflows(priority);
CREATE INDEX idx_approval_workflows_deadline ON approval_workflows(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_approval_workflows_created_at ON approval_workflows(created_at);

-- Workflow steps indexes
CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_approver ON workflow_steps(approver_id);
CREATE INDEX idx_workflow_steps_role ON workflow_steps(approver_role);

-- Approval history indexes
CREATE INDEX idx_approval_history_workflow ON approval_history(workflow_id);
CREATE INDEX idx_approval_history_approver ON approval_history(approver_id);
CREATE INDEX idx_approval_history_action ON approval_history(action);
CREATE INDEX idx_approval_history_created_at ON approval_history(created_at);

-- Workflow templates indexes
CREATE INDEX idx_workflow_templates_document_type ON workflow_templates(document_type);
CREATE INDEX idx_workflow_templates_active ON workflow_templates(is_active);
CREATE INDEX idx_workflow_templates_default ON workflow_templates(document_type, is_default);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_approval_workflows_updated_at 
    BEFORE UPDATE ON approval_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at 
    BEFORE UPDATE ON workflow_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update workflow status
CREATE OR REPLACE FUNCTION update_workflow_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is an approval action, check if workflow should be marked as approved
    IF NEW.action = 'approve' THEN
        -- Check if this was the last step
        UPDATE approval_workflows 
        SET 
            status = CASE 
                WHEN current_step >= total_steps THEN 'approved'::approval_status
                ELSE 'in_progress'::approval_status
            END,
            current_step = CASE 
                WHEN current_step < total_steps THEN current_step + 1
                ELSE current_step
            END,
            completed_at = CASE 
                WHEN current_step >= total_steps THEN NOW()
                ELSE completed_at
            END
        WHERE id = NEW.workflow_id;
        
    -- If this is a rejection, mark workflow as rejected
    ELSIF NEW.action = 'reject' THEN
        UPDATE approval_workflows 
        SET 
            status = 'rejected'::approval_status,
            completed_at = NOW()
        WHERE id = NEW.workflow_id;
        
    -- If this is a cancellation, mark workflow as cancelled
    ELSIF NEW.action = 'cancel' THEN
        UPDATE approval_workflows 
        SET 
            status = 'cancelled'::approval_status,
            completed_at = NOW()
        WHERE id = NEW.workflow_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to update workflow status when history is added
CREATE TRIGGER update_workflow_status_trigger
    AFTER INSERT ON approval_history
    FOR EACH ROW EXECUTE FUNCTION update_workflow_status();

-- Function to set workflow start time
CREATE OR REPLACE FUNCTION set_workflow_start_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Set started_at when status changes from pending to in_progress
    IF OLD.status = 'pending' AND NEW.status = 'in_progress' AND NEW.started_at IS NULL THEN
        NEW.started_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to set workflow start time
CREATE TRIGGER set_workflow_start_time_trigger
    BEFORE UPDATE ON approval_workflows
    FOR EACH ROW EXECUTE FUNCTION set_workflow_start_time();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample workflow templates
INSERT INTO workflow_templates (name, document_type, description, steps_config, is_default) VALUES
(
    'Standard Contract Approval',
    'contract',
    'Standard 2-level approval process for contracts',
    '{
        "steps": [
            {
                "step_number": 1,
                "step_name": "Manager Review",
                "approver_role": "manager",
                "timeout_hours": 72,
                "is_parallel": false,
                "is_optional": false
            },
            {
                "step_number": 2,
                "step_name": "Director Approval",
                "approver_role": "director",
                "timeout_hours": 48,
                "is_parallel": false,
                "is_optional": false
            }
        ]
    }',
    true
),
(
    'High Value Contract Approval',
    'contract',
    '3-level approval process for high-value contracts',
    '{
        "steps": [
            {
                "step_number": 1,
                "step_name": "Manager Review",
                "approver_role": "manager",
                "timeout_hours": 48,
                "is_parallel": false,
                "is_optional": false
            },
            {
                "step_number": 2,
                "step_name": "Director Approval",
                "approver_role": "director",
                "timeout_hours": 48,
                "is_parallel": false,
                "is_optional": false
            },
            {
                "step_number": 3,
                "step_name": "CEO Final Approval",
                "approver_role": "ceo",
                "timeout_hours": 72,
                "is_parallel": false,
                "is_optional": false
            }
        ]
    }',
    false
),
(
    'Document Review Process',
    'document',
    'Standard document review and approval process',
    '{
        "steps": [
            {
                "step_number": 1,
                "step_name": "Content Review",
                "approver_role": "editor",
                "timeout_hours": 48,
                "is_parallel": false,
                "is_optional": false
            },
            {
                "step_number": 2,
                "step_name": "Final Approval",
                "approver_role": "manager",
                "timeout_hours": 24,
                "is_parallel": false,
                "is_optional": false
            }
        ]
    }',
    true
);

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View for workflow summary
CREATE VIEW workflow_summary AS
SELECT 
    w.id,
    w.workflow_name,
    w.document_type,
    w.status,
    w.priority,
    w.current_step,
    w.total_steps,
    ROUND((w.current_step::DECIMAL / w.total_steps) * 100, 2) as progress_percentage,
    creator.full_name as created_by_name,
    assignee.full_name as assigned_to_name,
    w.created_at,
    w.deadline,
    CASE 
        WHEN w.deadline IS NOT NULL AND w.deadline < NOW() AND w.status NOT IN ('approved', 'rejected', 'cancelled')
        THEN true 
        ELSE false 
    END as is_overdue,
    CASE 
        WHEN w.started_at IS NOT NULL AND w.completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (w.completed_at - w.started_at))/3600 
        ELSE NULL 
    END as completion_time_hours
FROM approval_workflows w
LEFT JOIN users creator ON w.created_by_id = creator.id
LEFT JOIN users assignee ON w.assigned_to_id = assignee.id;

-- View for approval statistics
CREATE VIEW approval_statistics AS
SELECT 
    document_type,
    status,
    COUNT(*) as count,
    AVG(CASE 
        WHEN started_at IS NOT NULL AND completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (completed_at - started_at))/3600 
        ELSE NULL 
    END) as avg_completion_time_hours
FROM approval_workflows
GROUP BY document_type, status;

-- ============================================================================
-- FUNCTIONS FOR WORKFLOW MANAGEMENT
-- ============================================================================

-- Function to create workflow from template
CREATE OR REPLACE FUNCTION create_workflow_from_template(
    p_template_id UUID,
    p_document_id UUID,
    p_created_by_id UUID,
    p_workflow_name VARCHAR DEFAULT NULL,
    p_priority priority_level DEFAULT 'normal',
    p_deadline TIMESTAMP DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_workflow_id UUID;
    v_template RECORD;
    v_step RECORD;
    v_step_config JSONB;
BEGIN
    -- Get template
    SELECT * INTO v_template FROM workflow_templates WHERE id = p_template_id AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template not found or inactive: %', p_template_id;
    END IF;
    
    -- Create workflow
    INSERT INTO approval_workflows (
        document_type,
        document_id,
        workflow_name,
        total_steps,
        priority,
        deadline,
        created_by_id,
        assigned_to_id
    ) VALUES (
        v_template.document_type,
        p_document_id,
        COALESCE(p_workflow_name, v_template.name),
        jsonb_array_length(v_template.steps_config->'steps'),
        p_priority,
        p_deadline,
        p_created_by_id,
        p_created_by_id -- Initially assigned to creator
    ) RETURNING id INTO v_workflow_id;
    
    -- Create workflow steps from template
    FOR v_step_config IN SELECT * FROM jsonb_array_elements(v_template.steps_config->'steps')
    LOOP
        INSERT INTO workflow_steps (
            workflow_id,
            step_number,
            step_name,
            approver_role,
            is_parallel,
            is_optional,
            timeout_hours
        ) VALUES (
            v_workflow_id,
            (v_step_config->>'step_number')::INTEGER,
            v_step_config->>'step_name',
            v_step_config->>'approver_role',
            COALESCE((v_step_config->>'is_parallel')::BOOLEAN, false),
            COALESCE((v_step_config->>'is_optional')::BOOLEAN, false),
            COALESCE((v_step_config->>'timeout_hours')::INTEGER, 72)
        );
    END LOOP;
    
    -- Log workflow creation
    INSERT INTO approval_history (
        workflow_id,
        step_number,
        step_name,
        approver_id,
        action,
        comments
    ) VALUES (
        v_workflow_id,
        0,
        'Workflow Created',
        p_created_by_id,
        'submit',
        'Workflow created from template: ' || v_template.name
    );
    
    RETURN v_workflow_id;
END;
$$ LANGUAGE 'plpgsql';

-- ============================================================================
-- PERMISSIONS (Run as superuser)
-- ============================================================================

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO orient_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO orient_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO orient_user;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Approval Workflow System setup completed successfully!';
    RAISE NOTICE '📊 Tables created: approval_workflows, workflow_steps, approval_history, workflow_templates';
    RAISE NOTICE '🔧 Functions created: create_workflow_from_template, update_workflow_status';
    RAISE NOTICE '📈 Views created: workflow_summary, approval_statistics';
    RAISE NOTICE '📝 Sample templates inserted: Standard Contract Approval, High Value Contract Approval, Document Review Process';
    RAISE NOTICE '🚀 System is ready for use!';
END $$;
