# Check contract data for approval workflow
# Usage: .\scripts\check_contract_data.ps1 -ContractId "3"

param(
    [Parameter(Mandatory=$true)]
    [string]$ContractId
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Contract Data Check for Approval Workflow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking Contract ID: $ContractId" -ForegroundColor Yellow
Write-Host ""

# SQL queries to check
$sqlQueries = @"
-- 1. Check if contract exists
SELECT 
    id,
    contract_number,
    status,
    total_amount,
    created_by_id,
    created_at
FROM translation_contracts 
WHERE id = CAST('$ContractId' AS BIGINT) 
   OR contract_number = '$ContractId'
LIMIT 1;

-- 2. Check if contract has valid creator
SELECT 
    c.id as contract_id,
    c.contract_number,
    c.created_by_id,
    u.id as user_id,
    u.email as creator_email,
    u.full_name as creator_name,
    u.role as creator_role
FROM translation_contracts c
LEFT JOIN users u ON c.created_by_id = u.id
WHERE c.id = CAST('$ContractId' AS BIGINT) 
   OR c.contract_number = '$ContractId'
LIMIT 1;

-- 3. Check if there are approvers available
SELECT 
    id,
    email,
    full_name,
    role
FROM users 
WHERE role IN ('manager', 'truong_ban_thu_ky', 'pho_chu_nhiem')
ORDER BY CASE role 
    WHEN 'truong_ban_thu_ky' THEN 1 
    WHEN 'pho_chu_nhiem' THEN 2 
    WHEN 'manager' THEN 3 
END
LIMIT 5;

-- 4. Check existing approval workflows for this contract
SELECT 
    id,
    document_type,
    document_id,
    workflow_name,
    status,
    created_at
FROM approval_workflows
WHERE document_id = CAST('$ContractId' AS BIGINT)
ORDER BY created_at DESC
LIMIT 5;
"@

Write-Host "Run these SQL queries in pgAdmin (connected to translation_db):" -ForegroundColor Yellow
Write-Host ""
Write-Host $sqlQueries -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Expected Results:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Contract should exist with:" -ForegroundColor White
Write-Host "   - Valid id (BIGINT)" -ForegroundColor Gray
Write-Host "   - contract_number (not null)" -ForegroundColor Gray
Write-Host "   - created_by_id (BIGINT, can be null)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Creator should have:" -ForegroundColor White
Write-Host "   - Valid user_id (BIGINT)" -ForegroundColor Gray
Write-Host "   - creator_email (for notifications)" -ForegroundColor Gray
Write-Host "   - creator_name (for display)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. At least ONE approver should exist with role:" -ForegroundColor White
Write-Host "   - 'truong_ban_thu_ky' (preferred)" -ForegroundColor Gray
Write-Host "   - 'pho_chu_nhiem' (second choice)" -ForegroundColor Gray
Write-Host "   - 'manager' (fallback)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. No existing approval workflow (or old ones completed)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Common Issues:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "❌ Contract not found:" -ForegroundColor Red
Write-Host "   → Contract ID $ContractId does not exist" -ForegroundColor Gray
Write-Host "   → Solution: Use a valid contract ID" -ForegroundColor Yellow
Write-Host ""
Write-Host "❌ No creator user:" -ForegroundColor Red
Write-Host "   → created_by_id is NULL or user doesn't exist" -ForegroundColor Gray
Write-Host "   → Solution: Update contract with valid created_by_id" -ForegroundColor Yellow
Write-Host ""
Write-Host "❌ No approvers found:" -ForegroundColor Red
Write-Host "   → No users with manager roles exist" -ForegroundColor Gray
Write-Host "   → Solution: Create user with role 'manager', 'truong_ban_thu_ky', or 'pho_chu_nhiem'" -ForegroundColor Yellow
Write-Host ""
Write-Host "❌ Creator email missing:" -ForegroundColor Red
Write-Host "   → Creator user has no email" -ForegroundColor Gray
Write-Host "   → Solution: Update user email (workflow will continue but email won't send)" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Fix SQL:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "-- If contract exists but no creator, update it:" -ForegroundColor Yellow
Write-Host "-- UPDATE translation_contracts SET created_by_id = (SELECT id FROM users LIMIT 1) WHERE id = CAST('$ContractId' AS BIGINT);" -ForegroundColor Gray
Write-Host ""
Write-Host "-- If no approvers, create a test manager:" -ForegroundColor Yellow
Write-Host "-- INSERT INTO users (email, full_name, role, password_hash) VALUES ('manager@test.com', 'Test Manager', 'manager', 'hashed_password') RETURNING id;" -ForegroundColor Gray
Write-Host ""

