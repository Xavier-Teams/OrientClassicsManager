# Test N8N Contract Approval Webhook với Contract ID thực tế
# Usage: .\scripts\test_contract_approval_webhook.ps1 -ContractId "your-contract-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$ContractId
)

$webhookUrl = "http://localhost:5678/webhook/contract-approval"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing N8N Contract Approval Webhook" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Webhook URL: " -NoNewline -ForegroundColor Yellow
Write-Host $webhookUrl -ForegroundColor Green

Write-Host "Contract ID: " -NoNewline -ForegroundColor Yellow
Write-Host $ContractId -ForegroundColor Green
Write-Host ""

# Prepare request body
# Note: contract_id should be UUID format from translation_contracts table
$body = @{
    contract_id = $ContractId
} | ConvertTo-Json

Write-Host "Request Body:" -ForegroundColor Yellow
Write-Host $body -ForegroundColor Gray
Write-Host ""

# Send request
Write-Host "Sending POST request..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host ""
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Check N8N execution history" -ForegroundColor White
    Write-Host "2. Verify workflow completed successfully" -ForegroundColor White
    Write-Host "3. Check email notifications (if configured)" -ForegroundColor White
    
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
    Write-Host "2. Check webhook URL is correct" -ForegroundColor White
    Write-Host "3. Verify N8N container is running: docker ps" -ForegroundColor White
    Write-Host "4. Check N8N logs: docker logs orient-n8n-dev" -ForegroundColor White
}

Write-Host ""
