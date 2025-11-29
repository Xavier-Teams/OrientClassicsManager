# Test Contract Approval Workflow
# PowerShell script to test the complete contract approval workflow

param(
    [Parameter(Mandatory=$true)]
    [string]$ContractId,
    
    [Parameter(Mandatory=$false)]
    [string]$N8NUrl = "http://localhost:5678",
    
    [Parameter(Mandatory=$false)]
    [switch]$TestApproval = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$TestRejection = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Contract Approval Workflow Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: SUBMIT CONTRACT FOR APPROVAL
# ============================================================================
Write-Host "Step 1: Submitting Contract for Approval..." -ForegroundColor Yellow
Write-Host "  Contract ID: $ContractId" -ForegroundColor Gray
Write-Host ""

try {
    $body = @{
        contract_id = $ContractId
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$N8NUrl/webhook/contract-submit-for-approval" `
        -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "  [SUCCESS] Contract submitted for approval" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Response:" -ForegroundColor Cyan
    Write-Host "    Contract: $($response.contract_number)" -ForegroundColor Gray
    Write-Host "    Workflow ID: $($response.workflow_id)" -ForegroundColor Gray
    Write-Host "    Current Level: $($response.current_level)" -ForegroundColor Gray
    Write-Host "    Approver: $($response.approver)" -ForegroundColor Gray
    Write-Host "    Approval URL: $($response.approval_url)" -ForegroundColor Gray
    Write-Host ""
    
    $approvalUrl = $response.approval_url
    $rejectUrl = $approvalUrl -replace "decision=approved", "decision=rejected"
    
    Write-Host "  Approval URLs:" -ForegroundColor Cyan
    Write-Host "    Approve: $approvalUrl" -ForegroundColor Green
    Write-Host "    Reject: $rejectUrl" -ForegroundColor Red
    Write-Host ""
    
    # Save URLs for later use
    $global:ApprovalUrl = $approvalUrl
    $global:RejectUrl = $rejectUrl
    $global:WorkflowId = $response.workflow_id
    
} catch {
    Write-Host "  [FAILED] Error submitting contract: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# ============================================================================
# STEP 2: TEST APPROVAL (if requested)
# ============================================================================
if ($TestApproval) {
    Write-Host "Step 2: Testing Approval..." -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $global:ApprovalUrl) {
        Write-Host "  [ERROR] Approval URL not available. Please run Step 1 first." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "  Clicking approval URL..." -ForegroundColor Gray
    Write-Host "  URL: $global:ApprovalUrl" -ForegroundColor DarkGray
    Write-Host ""
    
    try {
        $approvalResponse = Invoke-RestMethod -Uri $global:ApprovalUrl -Method Get -ErrorAction Stop
        
        Write-Host "  [SUCCESS] Approval processed" -ForegroundColor Green
        Write-Host "  Response: $($approvalResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
        Write-Host ""
        
        if ($approvalResponse.decision -eq "approved") {
            Write-Host "  [INFO] Contract approved. Check if next level notification was sent." -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "  [FAILED] Error processing approval: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# ============================================================================
# STEP 3: TEST REJECTION (if requested)
# ============================================================================
if ($TestRejection) {
    Write-Host "Step 3: Testing Rejection..." -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $global:RejectUrl) {
        Write-Host "  [ERROR] Reject URL not available. Please run Step 1 first." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "  Clicking rejection URL..." -ForegroundColor Gray
    Write-Host "  URL: $global:RejectUrl" -ForegroundColor DarkGray
    Write-Host ""
    
    try {
        $rejectResponse = Invoke-RestMethod -Uri $global:RejectUrl -Method Get -ErrorAction Stop
        
        Write-Host "  [SUCCESS] Rejection processed" -ForegroundColor Green
        Write-Host "  Response: $($rejectResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "  [INFO] Contract rejected. Check rejection notifications." -ForegroundColor Cyan
        
    } catch {
        Write-Host "  [FAILED] Error processing rejection: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check Email inbox for approval request" -ForegroundColor White
Write-Host "2. Check Mattermost channel #contracts-approvals" -ForegroundColor White
Write-Host "3. Use approval/reject URLs to test decision flow" -ForegroundColor White
Write-Host "4. Check N8N execution logs" -ForegroundColor White
Write-Host "5. Check database logs: SELECT * FROM n8n_workflow_logs WHERE workflow_name = 'Contract Approval Multi-Level'" -ForegroundColor White
Write-Host ""

if ($global:ApprovalUrl) {
    Write-Host "Quick Links:" -ForegroundColor Cyan
    Write-Host "  Approve: $global:ApprovalUrl" -ForegroundColor Green
    Write-Host "  Reject: $global:RejectUrl" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Done!" -ForegroundColor Green

