# Setup và Test Multi-Level Approval với Contract ID = 3
# Usage: .\scripts\setup_and_test_contract_3.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Multi-Level Approval Setup & Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Setup approval_tokens table
Write-Host "Step 1: Setting up approval_tokens table..." -ForegroundColor Yellow
Write-Host "Please run this SQL in pgAdmin (translation_db):" -ForegroundColor Yellow
Write-Host "File: scripts/setup_approval_tokens.sql" -ForegroundColor Green
Write-Host ""

# Step 2: Check contract ID = 3
Write-Host "Step 2: Checking contract with ID = 3..." -ForegroundColor Yellow
Write-Host "Please run this SQL in pgAdmin (translation_db):" -ForegroundColor Yellow
Write-Host "File: scripts/check_contract_3.sql" -ForegroundColor Green
Write-Host ""

# Step 3: Import workflow
Write-Host "Step 3: Import workflow in N8N:" -ForegroundColor Yellow
Write-Host "1. Open N8N: http://localhost:5678" -ForegroundColor White
Write-Host "2. Click '+' → Import from file" -ForegroundColor White
Write-Host "3. Select: n8n-workflows/contract-approval-multilevel-ready.json" -ForegroundColor White
Write-Host "4. Save and Activate workflow" -ForegroundColor White
Write-Host ""

# Step 4: Test webhook
Write-Host "Step 4: Test webhook with contract_id = 3" -ForegroundColor Yellow
Write-Host ""

$contractId = "3"
$webhookUrl = "http://localhost:5678/webhook/contract-approval"

Write-Host "Testing with contract_id: $contractId" -ForegroundColor Cyan
Write-Host "Webhook URL: $webhookUrl" -ForegroundColor Cyan
Write-Host ""

$body = @{
    contract_id = $contractId
} | ConvertTo-Json

Write-Host "Request Body:" -ForegroundColor Yellow
Write-Host $body -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "Sending POST request..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host ""
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Check N8N execution history" -ForegroundColor White
    Write-Host "2. Check email inbox for approval link" -ForegroundColor White
    Write-Host "3. Click Approve/Reject link in email" -ForegroundColor White
    Write-Host "4. Verify contract status updated in database" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🔍 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Verify workflow is ACTIVE in N8N" -ForegroundColor White
    Write-Host "2. Check PostgreSQL credentials in N8N" -ForegroundColor White
    Write-Host "3. Verify approval_tokens table exists" -ForegroundColor White
    Write-Host "4. Check contract with ID = 3 exists" -ForegroundColor White
    Write-Host "5. Check N8N logs: docker logs orient-n8n-dev" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
