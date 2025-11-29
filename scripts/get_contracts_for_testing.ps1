# Get available contracts for N8N testing
# This script provides SQL queries to run in pgAdmin

Write-Host "=== Get Contracts for N8N Testing ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 1: Check existing contracts" -ForegroundColor Yellow
Write-Host "Run this SQL in pgAdmin (connected to translation_db):" -ForegroundColor White
Write-Host ""
Write-Host "SELECT id, contract_number, status, total_amount, created_at" -ForegroundColor Gray
Write-Host "FROM translation_contracts" -ForegroundColor Gray
Write-Host "ORDER BY id ASC" -ForegroundColor Gray
Write-Host "LIMIT 10;" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Create a test contract" -ForegroundColor Yellow
Write-Host "Run this SQL file in pgAdmin:" -ForegroundColor White
Write-Host "scripts\create_test_contract.sql" -ForegroundColor Green
Write-Host ""

Write-Host "Option 3: Use the contract ID from the query result" -ForegroundColor Yellow
Write-Host "After getting a contract ID, test with:" -ForegroundColor White
Write-Host ".\scripts\test_webhook_simple.ps1 -ContractId `"<contract_id>`"" -ForegroundColor Green
Write-Host ""

Write-Host "Example:" -ForegroundColor Cyan
Write-Host "If you get contract ID = 1, run:" -ForegroundColor White
Write-Host ".\scripts\test_webhook_simple.ps1 -ContractId `"1`"" -ForegroundColor Green
Write-Host ""
