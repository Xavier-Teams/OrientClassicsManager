# Simple Webhook Test Script
# Usage: .\scripts\test_webhook_simple.ps1 -ContractId "3"

param(
    [Parameter(Mandatory=$true)]
    [string]$ContractId
)

$webhookUrl = "http://localhost:5678/webhook/contract-approval"
$body = @{ contract_id = $ContractId } | ConvertTo-Json

Write-Host "Testing webhook with Contract ID: $ContractId" -ForegroundColor Cyan
Write-Host "URL: $webhookUrl" -ForegroundColor Yellow
Write-Host "Body: $body" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
