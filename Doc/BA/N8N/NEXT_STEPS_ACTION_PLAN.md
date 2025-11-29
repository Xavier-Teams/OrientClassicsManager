# 🎯 Next Steps Action Plan - Document Approval Workflow

> **Kế hoạch hành động cụ thể** để triển khai hệ thống quản lý luồng phê duyệt văn bản

## 📋 Mục lục

- [📝 Step 1: Stakeholder Review](#-step-1-stakeholder-review)
- [👥 Step 2: Team Setup](#-step-2-team-setup)
- [🏗️ Step 3: Phase 1 Kickoff](#️-step-3-phase-1-kickoff)
- [🔬 Step 4: Proof of Concept](#-step-4-proof-of-concept)
- [📊 Progress Tracking](#-progress-tracking)

---

## 📝 Step 1: Stakeholder Review

### **Mục tiêu**: Đảm bảo alignment và approval từ stakeholders

#### **Checklist Review:**
- [ ] **Technical Architecture** - Kiến trúc tích hợp N8N
- [ ] **Budget Approval** - Chi phí $0 cho N8N self-hosted
- [ ] **Timeline Approval** - 20 tuần implementation
- [ ] **Resource Allocation** - Team members và roles
- [ ] **Success Metrics** - KPIs và measurement criteria
- [ ] **Risk Assessment** - Risk mitigation strategies

#### **Documents to Review:**
1. **HE_THONG_QUAN_LY_LUONG_PHE_DUYET_VAN_BAN.md** - Main strategy document
2. **N8N_AUTOMATION_STRATEGY.md** - Technical implementation details
3. **IMPLEMENTATION_ROADMAP.md** - Detailed timeline và budget

#### **Review Meeting Agenda:**
```
📅 Stakeholder Review Meeting (2 hours)

1. Project Overview (15 mins)
   - Business objectives
   - Expected ROI: 300-500%
   - Competitive advantages

2. Technical Architecture (30 mins)
   - N8N integration approach
   - Database schema extensions
   - Security considerations

3. Implementation Plan (30 mins)
   - 20-week timeline
   - Phase-by-phase deliverables
   - Resource requirements

4. Budget & ROI (15 mins)
   - $0 software cost (N8N self-hosted)
   - Infrastructure costs
   - Expected savings: $77,000/year

5. Risk Management (15 mins)
   - Technical risks và mitigation
   - Business risks và contingency

6. Q&A và Decision (15 mins)
   - Address concerns
   - Final approval
   - Next steps authorization
```

#### **Decision Points:**
- [ ] **GO/NO-GO Decision**
- [ ] **Budget Approval**
- [ ] **Timeline Confirmation**
- [ ] **Team Authorization**

---

## 👥 Step 2: Team Setup

### **Team Structure & Roles:**

#### **Core Team (Full-time)**

##### **Project Manager** (1 person - 20 weeks)
**Responsibilities:**
- Overall project coordination
- Stakeholder communication
- Timeline và budget tracking
- Risk management
- Daily standups và weekly reports

**Skills Required:**
- Project management experience
- Technical background preferred
- Stakeholder management
- Agile/Scrum methodology

##### **Backend Developer** (1 person - 16 weeks)
**Responsibilities:**
- Django API extensions
- Database schema design
- N8N integration
- Webhook development
- Security implementation

**Skills Required:**
- Python/Django expertise
- PostgreSQL database design
- REST API development
- N8N/workflow automation
- Security best practices

##### **Frontend Developer** (1 person - 12 weeks)
**Responsibilities:**
- React component development
- Approval workflow UI
- Real-time notifications
- Mobile optimization
- User experience

**Skills Required:**
- React/TypeScript expertise
- TailwindCSS
- WebSocket integration
- Responsive design
- UI/UX principles

#### **Support Team (Part-time)**

##### **DevOps Engineer** (0.5 person - 8 weeks)
**Responsibilities:**
- N8N setup và configuration
- Docker containerization
- Production deployment
- Monitoring setup
- Backup procedures

##### **Business Analyst** (0.5 person - 8 weeks)
**Responsibilities:**
- Requirements gathering
- Process documentation
- UAT coordination
- User training materials

##### **QA Engineer** (0.5 person - 6 weeks)
**Responsibilities:**
- Test plan creation
- Testing execution
- Bug tracking
- Quality assurance

### **Environment Setup Checklist:**

#### **Development Environment:**
- [ ] **Git Repository** - Branch strategy và access
- [ ] **Development Servers** - Local và staging environments
- [ ] **Database Setup** - PostgreSQL development instance
- [ ] **N8N Development** - Local N8N instance
- [ ] **Communication Tools** - Slack/Teams channels
- [ ] **Project Management** - Jira/Trello board setup

#### **Tools và Access:**
- [ ] **Code Repository**: GitHub/GitLab access
- [ ] **Database Access**: PostgreSQL admin rights
- [ ] **Server Access**: Development và staging servers
- [ ] **Email Service**: SMTP configuration for testing
- [ ] **Documentation**: Confluence/Notion workspace

---

## 🏗️ Step 3: Phase 1 Kickoff

### **Week 1-2: Foundation Setup**

#### **Database Design & Migration**

##### **New Tables Schema:**
```sql
-- File: migrations/001_approval_workflow_tables.sql

-- Bảng quản lý workflow phê duyệt
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(50) NOT NULL, -- 'contract', 'document', etc.
    document_id UUID NOT NULL,
    workflow_name VARCHAR(100) NOT NULL,
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    status approval_status DEFAULT 'pending',
    priority priority_level DEFAULT 'normal',
    deadline TIMESTAMP,
    created_by_id UUID REFERENCES users(id),
    assigned_to_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bảng định nghĩa các bước trong workflow
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id),
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    approver_role VARCHAR(50), -- 'manager', 'director', 'ceo'
    approver_id UUID REFERENCES users(id),
    is_parallel BOOLEAN DEFAULT FALSE,
    is_optional BOOLEAN DEFAULT FALSE,
    timeout_hours INTEGER DEFAULT 72,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng lưu lịch sử phê duyệt
CREATE TABLE approval_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id),
    step_number INTEGER NOT NULL,
    approver_id UUID REFERENCES users(id),
    action approval_action NOT NULL,
    comments TEXT,
    attachments JSONB DEFAULT '[]',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bảng cấu hình workflow templates
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    description TEXT,
    steps_config JSONB NOT NULL, -- JSON config for steps
    is_active BOOLEAN DEFAULT TRUE,
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enum types
CREATE TYPE approval_status AS ENUM (
    'pending', 'in_progress', 'approved', 'rejected', 
    'cancelled', 'expired', 'on_hold'
);

CREATE TYPE approval_action AS ENUM (
    'submit', 'approve', 'reject', 'request_changes', 
    'delegate', 'escalate', 'cancel'
);

CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');

-- Indexes for performance
CREATE INDEX idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX idx_approval_workflows_assigned ON approval_workflows(assigned_to_id);
CREATE INDEX idx_approval_workflows_document ON approval_workflows(document_type, document_id);
CREATE INDEX idx_approval_history_workflow ON approval_history(workflow_id);
CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_approval_workflows_updated_at 
    BEFORE UPDATE ON approval_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at 
    BEFORE UPDATE ON workflow_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### **N8N Setup Script:**
```bash
#!/bin/bash
# File: scripts/setup_n8n_dev.sh

echo "🚀 Setting up N8N Development Environment..."

# Create N8N data directory
mkdir -p ./n8n-data

# Create docker-compose.yml for N8N
cat > docker-compose.n8n.yml << EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: orient-n8n-dev
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=Asia/Ho_Chi_Minh
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=orient2024
      # Database connection
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=host.docker.internal
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=orient_classics_manager
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=your_password
      # Email configuration
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=smtp.gmail.com
      - N8N_SMTP_PORT=587
      - N8N_SMTP_USER=your_email@gmail.com
      - N8N_SMTP_PASS=your_app_password
    volumes:
      - ./n8n-data:/home/node/.n8n
    networks:
      - orient-network

networks:
  orient-network:
    driver: bridge
EOF

# Start N8N
echo "🐳 Starting N8N container..."
docker-compose -f docker-compose.n8n.yml up -d

# Wait for N8N to start
echo "⏳ Waiting for N8N to start..."
sleep 30

# Check if N8N is running
if curl -f http://localhost:5678 > /dev/null 2>&1; then
    echo "✅ N8N is running at http://localhost:5678"
    echo "👤 Username: admin"
    echo "🔑 Password: orient2024"
else
    echo "❌ N8N failed to start. Check docker logs:"
    docker logs orient-n8n-dev
fi
```

#### **API Development Kickoff:**
```python
# File: backend-django/approvals/models.py

from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class ApprovalWorkflow(models.Model):
    DOCUMENT_TYPES = [
        ('contract', 'Hợp đồng'),
        ('document', 'Tài liệu'),
        ('proposal', 'Đề xuất'),
        ('report', 'Báo cáo'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('in_progress', 'Đang xử lý'),
        ('approved', 'Đã phê duyệt'),
        ('rejected', 'Bị từ chối'),
        ('cancelled', 'Đã hủy'),
        ('expired', 'Hết hạn'),
        ('on_hold', 'Tạm dừng'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Thấp'),
        ('normal', 'Bình thường'),
        ('high', 'Cao'),
        ('urgent', 'Khẩn cấp'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    document_id = models.UUIDField()
    workflow_name = models.CharField(max_length=100)
    current_step = models.IntegerField(default=1)
    total_steps = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    deadline = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_workflows')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_workflows')
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'approval_workflows'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['document_type', 'document_id']),
        ]
    
    def __str__(self):
        return f"{self.workflow_name} - {self.get_status_display()}"

class WorkflowStep(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField()
    step_name = models.CharField(max_length=100)
    approver_role = models.CharField(max_length=50, null=True, blank=True)
    approver = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    is_parallel = models.BooleanField(default=False)
    is_optional = models.BooleanField(default=False)
    timeout_hours = models.IntegerField(default=72)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'workflow_steps'
        ordering = ['step_number']
        unique_together = ['workflow', 'step_number']

class ApprovalHistory(models.Model):
    ACTION_CHOICES = [
        ('submit', 'Gửi phê duyệt'),
        ('approve', 'Phê duyệt'),
        ('reject', 'Từ chối'),
        ('request_changes', 'Yêu cầu chỉnh sửa'),
        ('delegate', 'Ủy quyền'),
        ('escalate', 'Báo cáo cấp trên'),
        ('cancel', 'Hủy bỏ'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.CASCADE, related_name='history')
    step_number = models.IntegerField()
    approver = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    comments = models.TextField(blank=True)
    attachments = models.JSONField(default=list)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'approval_history'
        ordering = ['-created_at']
```

---

## 🔬 Step 4: Proof of Concept

### **Contract Approval Workflow POC**

#### **Objective**: Tạo workflow đầu tiên để phê duyệt hợp đồng

#### **POC Scope:**
1. **Simple Contract Approval** (2 levels)
   - Manager approval
   - Director approval
2. **Email Notifications**
3. **Basic UI** cho approval actions
4. **Database tracking**

#### **N8N Workflow Template:**
```json
{
  "name": "Contract Approval POC",
  "nodes": [
    {
      "parameters": {
        "path": "contract-approval",
        "options": {}
      },
      "name": "Contract Submitted",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT c.*, u.email as creator_email, u.full_name as creator_name FROM contracts c JOIN users u ON c.created_by_id = u.id WHERE c.id = $1",
        "additionalFields": {
          "values": "={{ $json.contract_id }}"
        }
      },
      "name": "Get Contract Details",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "approval_workflows",
        "columns": "document_type, document_id, workflow_name, total_steps, created_by_id, assigned_to_id",
        "additionalFields": {
          "values": "contract, {{ $json.contract_id }}, Contract Approval, 2, {{ $json.created_by_id }}, {{ $json.manager_id }}"
        }
      },
      "name": "Create Workflow",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "to": "{{ $json.manager_email }}",
        "subject": "Contract Approval Required: {{ $json.contract_number }}",
        "text": "Dear {{ $json.manager_name }},\n\nA new contract requires your approval:\n\nContract: {{ $json.contract_number }}\nCreated by: {{ $json.creator_name }}\nAmount: {{ $json.total_amount }}\n\nPlease review and approve at: http://localhost:3000/approvals/{{ $json.workflow_id }}\n\nBest regards,\nOrientClassicsManager System"
      },
      "name": "Send Manager Notification",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "resume": "webhook",
        "limit": 3600
      },
      "name": "Wait for Manager Response",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.action }}",
              "operation": "equal",
              "value2": "approved"
            }
          ]
        }
      },
      "name": "Manager Approved?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1340, 300]
    }
  ],
  "connections": {
    "Contract Submitted": {
      "main": [
        [
          {
            "node": "Get Contract Details",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Contract Details": {
      "main": [
        [
          {
            "node": "Create Workflow",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Workflow": {
      "main": [
        [
          {
            "node": "Send Manager Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send Manager Notification": {
      "main": [
        [
          {
            "node": "Wait for Manager Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Wait for Manager Response": {
      "main": [
        [
          {
            "node": "Manager Approved?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

#### **Frontend POC Component:**
```typescript
// File: client/src/components/ApprovalWorkflow.tsx

import React, { useState, useEffect } from 'react';
import { Button, Card, Timeline, Badge, Modal, TextArea } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface ApprovalWorkflowProps {
  contractId: string;
}

interface WorkflowData {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  created_at: string;
  history: ApprovalHistoryItem[];
}

interface ApprovalHistoryItem {
  id: string;
  action: string;
  approver_name: string;
  comments: string;
  created_at: string;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ contractId }) => {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    action: 'approve' | 'reject' | null;
  }>({ visible: false, action: null });
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchWorkflowData();
  }, [contractId]);

  const fetchWorkflowData = async () => {
    try {
      const response = await fetch(`/api/approvals/contract/${contractId}/`);
      const data = await response.json();
      setWorkflow(data);
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/approvals/${workflow?.id}/${action}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: comments,
        }),
      });

      if (response.ok) {
        setActionModal({ visible: false, action: null });
        setComments('');
        fetchWorkflowData(); // Refresh data
      }
    } catch (error) {
      console.error('Error submitting approval:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ xử lý' },
      in_progress: { color: 'blue', text: 'Đang xử lý' },
      approved: { color: 'green', text: 'Đã phê duyệt' },
      rejected: { color: 'red', text: 'Bị từ chối' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Badge color={config.color} text={config.text} />;
  };

  const getTimelineItems = () => {
    if (!workflow) return [];

    return workflow.history.map((item, index) => ({
      dot: item.action === 'approve' ? <CheckCircleOutlined style={{ color: 'green' }} /> :
           item.action === 'reject' ? <CloseCircleOutlined style={{ color: 'red' }} /> :
           <ClockCircleOutlined style={{ color: 'orange' }} />,
      children: (
        <div>
          <div className="font-semibold">{item.approver_name}</div>
          <div className="text-sm text-gray-600">
            {item.action === 'approve' ? 'Đã phê duyệt' :
             item.action === 'reject' ? 'Đã từ chối' :
             item.action === 'submit' ? 'Đã gửi phê duyệt' : item.action}
          </div>
          {item.comments && (
            <div className="text-sm mt-1 p-2 bg-gray-50 rounded">
              {item.comments}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {new Date(item.created_at).toLocaleString('vi-VN')}
          </div>
        </div>
      ),
    }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  if (!workflow) {
    return <div className="text-center p-8">Không tìm thấy workflow</div>;
  }

  return (
    <div className="space-y-6">
      {/* Workflow Status */}
      <Card title="Trạng thái phê duyệt" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-lg font-semibold mb-2">
              Bước {workflow.current_step}/{workflow.total_steps}
            </div>
            {getStatusBadge(workflow.status)}
          </div>
          
          {workflow.status === 'in_progress' && (
            <div className="space-x-2">
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => setActionModal({ visible: true, action: 'approve' })}
              >
                Phê duyệt
              </Button>
              <Button 
                danger 
                icon={<CloseCircleOutlined />}
                onClick={() => setActionModal({ visible: true, action: 'reject' })}
              >
                Từ chối
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(workflow.current_step / workflow.total_steps) * 100}%` }}
          ></div>
        </div>
      </Card>

      {/* Approval History */}
      <Card title="Lịch sử phê duyệt">
        <Timeline items={getTimelineItems()} />
      </Card>

      {/* Action Modal */}
      <Modal
        title={actionModal.action === 'approve' ? 'Phê duyệt tài liệu' : 'Từ chối tài liệu'}
        open={actionModal.visible}
        onOk={() => actionModal.action && handleApprovalAction(actionModal.action)}
        onCancel={() => setActionModal({ visible: false, action: null })}
        okText={actionModal.action === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        cancelText="Hủy"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Nhận xét {actionModal.action === 'reject' ? '(bắt buộc)' : '(tùy chọn)'}:
          </label>
          <TextArea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              actionModal.action === 'approve' 
                ? 'Nhận xét về tài liệu (tùy chọn)...'
                : 'Vui lòng nêu lý do từ chối và hướng dẫn chỉnh sửa...'
            }
          />
        </div>
      </Modal>
    </div>
  );
};
```

---

## 📊 Progress Tracking

### **Weekly Milestones:**

#### **Week 1:**
- [ ] Stakeholder review completed
- [ ] Team roles assigned
- [ ] Development environment setup
- [ ] Database schema designed

#### **Week 2:**
- [ ] N8N development instance running
- [ ] Basic API endpoints created
- [ ] Database migrations applied
- [ ] First workflow template created

#### **Week 3:**
- [ ] Contract approval workflow functional
- [ ] Email notifications working
- [ ] Basic frontend components
- [ ] Integration testing started

#### **Week 4:**
- [ ] POC demonstration ready
- [ ] User feedback collected
- [ ] Performance baseline established
- [ ] Next phase planning completed

### **Success Criteria for POC:**
- ✅ Contract can be submitted for approval
- ✅ Manager receives email notification
- ✅ Manager can approve/reject via UI
- ✅ Director receives notification after manager approval
- ✅ All actions are logged in database
- ✅ Real-time status updates in frontend
- ✅ Email notifications sent at each step

### **Demo Script:**
```
📋 POC Demo Script (30 minutes)

1. Setup Demo (5 mins)
   - Show N8N workflow visually
   - Explain database schema
   - Show frontend components

2. Live Demo (15 mins)
   - Create a test contract
   - Submit for approval
   - Show email notification
   - Manager approval action
   - Director notification
   - Final approval

3. Technical Deep Dive (10 mins)
   - Database records created
   - N8N execution logs
   - API calls và responses
   - Frontend state management

4. Q&A và Next Steps (5 mins)
   - Address questions
   - Discuss improvements
   - Plan Phase 2 features
```

---

## 🎯 **IMMEDIATE ACTION ITEMS**

### **This Week:**
1. **Schedule stakeholder review meeting**
2. **Confirm team member availability**
3. **Setup development environment**
4. **Run database migration scripts**

### **Next Week:**
1. **Start N8N workflow development**
2. **Begin API implementation**
3. **Create basic frontend components**
4. **Setup testing framework**

---

*Tài liệu này sẽ được cập nhật theo tiến độ thực hiện. Mỗi bước hoàn thành sẽ được đánh dấu và ghi chú lessons learned.*

**Trạng thái**: Ready for Execution  
**Ngày tạo**: 27/11/2024  
**Người phụ trách**: Project Team  
**Review tiếp theo**: 04/12/2024
