# Get available contracts from database
# Usage: .\scripts\get_available_contracts.ps1

Write-Host "=== Available Contracts ===" -ForegroundColor Cyan
Write-Host ""

# You need to run this SQL in pgAdmin or psql:
Write-Host "Run this SQL in pgAdmin (connected to translation_db):" -ForegroundColor Yellow
Write-Host ""
Write-Host "SELECT id, contract_number, status, total_amount, created_at" -ForegroundColor Gray
Write-Host "FROM translation_contracts" -ForegroundColor Gray
Write-Host "ORDER BY id ASC" -ForegroundColor Gray
Write-Host "LIMIT 10;" -ForegroundColor Gray
Write-Host ""

Write-Host "Or use the SQL file:" -ForegroundColor Yellow
Write-Host "scripts\check_contract_exists.sql" -ForegroundColor Green
Write-Host ""

Write-Host "After getting a valid contract ID, test with:" -ForegroundColor Cyan
Write-Host ".\scripts\test_webhook_simple.ps1 -ContractId `"<actual_contract_id>`"" -ForegroundColor Green
