# Test N8N Contract Approval Webhook
# Usage: .\scripts\test_n8n_webhook.ps1 -ContractId "your-contract-id"

param(
    [Parameter(Mandatory=$true)]
    [string]$ContractId
)

$webhookUrl = "http://localhost:5678/webhook/contract-approval"
$body = @{
    contract_id = $ContractId
    action = "submit_for_approval"
} | ConvertTo-Json

Write-Host "Testing N8N Contract Approval Webhook..." -ForegroundColor Yellow
Write-Host "URL: $webhookUrl" -ForegroundColor Cyan
Write-Host "Contract ID: $ContractId" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
