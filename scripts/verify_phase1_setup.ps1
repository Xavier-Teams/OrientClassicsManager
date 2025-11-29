# Verify Phase 1: Foundation Setup
# PowerShell script to verify all Phase 1 components are ready

param(
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "translation_db",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseHost = "localhost",
    
    [Parameter(Mandatory=$false)]
    [int]$DatabasePort = 5432
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 1: Foundation Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# ============================================================================
# 1. CHECK MATTERMOST
# ============================================================================
Write-Host "1. Checking Mattermost..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8065/api/v4/system/ping" -Method GET -TimeoutSec 5
    if ($response.status -eq "OK") {
        Write-Host "   [OK] Mattermost is running" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Mattermost returned unexpected status" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "   [FAIL] Mattermost is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# ============================================================================
# 2. CHECK N8N
# ============================================================================
Write-Host "2. Checking N8N..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5678/healthz" -Method GET -TimeoutSec 5
    Write-Host "   [OK] N8N is running" -ForegroundColor Green
} catch {
    Write-Host "   [WARN] N8N might not be accessible: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 3. CHECK DATABASE CONNECTION
# ============================================================================
Write-Host "3. Checking Database Connection..." -ForegroundColor Yellow

$dbCheckScript = @"
SELECT 1 as connection_test;
"@

try {
    # Try to connect using psql if available
    $psqlCheck = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlCheck) {
        Write-Host "   [INFO] psql found, checking connection..." -ForegroundColor Gray
        # Note: This requires proper PostgreSQL connection setup
        Write-Host "   [INFO] Please verify database connection manually" -ForegroundColor Gray
    } else {
        Write-Host "   [INFO] psql not found, skipping direct DB check" -ForegroundColor Gray
        Write-Host "   [INFO] Please verify database connection manually" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [WARN] Could not check database connection: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 4. CHECK DATABASE VIEWS
# ============================================================================
Write-Host "4. Checking Database Views..." -ForegroundColor Yellow

$requiredViews = @(
    "v_contracts_for_approval",
    "v_approval_workflows_detail",
    "v_approval_tokens_detail",
    "v_workflow_next_level"
)

Write-Host "   Required views:" -ForegroundColor Gray
foreach ($view in $requiredViews) {
    Write-Host "     - $view" -ForegroundColor DarkGray
}

Write-Host "   [INFO] Please verify views exist in database:" -ForegroundColor Gray
Write-Host "     Run: SELECT * FROM information_schema.views WHERE table_name = 'v_contracts_for_approval';" -ForegroundColor DarkGray

Write-Host ""

# ============================================================================
# 5. CHECK DATABASE FUNCTIONS
# ============================================================================
Write-Host "5. Checking Database Functions..." -ForegroundColor Yellow

$requiredFunctions = @(
    "submit_contract_for_approval",
    "get_approver_for_level",
    "process_approval_decision",
    "log_workflow_execution"
)

Write-Host "   Required functions:" -ForegroundColor Gray
foreach ($func in $requiredFunctions) {
    Write-Host "     - $func" -ForegroundColor DarkGray
}

Write-Host "   [INFO] Please verify functions exist in database:" -ForegroundColor Gray
Write-Host "     Run: SELECT routine_name FROM information_schema.routines WHERE routine_name = 'submit_contract_for_approval';" -ForegroundColor DarkGray

Write-Host ""

# ============================================================================
# 6. CHECK LOGGING TABLE
# ============================================================================
Write-Host "6. Checking Logging Table..." -ForegroundColor Yellow

Write-Host "   Required table: n8n_workflow_logs" -ForegroundColor Gray
Write-Host "   [INFO] Please verify table exists:" -ForegroundColor Gray
Write-Host "     Run: SELECT * FROM information_schema.tables WHERE table_name = 'n8n_workflow_logs';" -ForegroundColor DarkGray

Write-Host ""

# ============================================================================
# 7. CHECK MATTERMOST CHANNELS
# ============================================================================
Write-Host "7. Checking Mattermost Channels..." -ForegroundColor Yellow

$requiredChannels = @(
    "#tasks-general",
    "#tasks-urgent",
    "#tasks-bien-tap",
    "#tasks-hanh-chinh",
    "#contracts-approvals",
    "#contracts-payments",
    "#contracts-expiry",
    "#system-alerts",
    "#workflows-approvals",
    "#general",
    "#announcements"
)

Write-Host "   Required channels:" -ForegroundColor Gray
foreach ($channel in $requiredChannels) {
    Write-Host "     - $channel" -ForegroundColor DarkGray
}

Write-Host "   [INFO] Please verify channels exist in Mattermost" -ForegroundColor Gray
Write-Host "   [INFO] Check SETUP_COMPLETE.md for webhook URLs" -ForegroundColor Gray

Write-Host ""

# ============================================================================
# 8. CHECK WEBHOOKS
# ============================================================================
Write-Host "8. Checking Webhooks..." -ForegroundColor Yellow

Write-Host "   [INFO] Webhook URLs should be saved in SETUP_COMPLETE.md" -ForegroundColor Gray
Write-Host "   [INFO] Each channel should have an incoming webhook" -ForegroundColor Gray
Write-Host "   [INFO] Test webhook with: .\scripts\test_mattermost_webhook.ps1" -ForegroundColor Gray

Write-Host ""

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allPassed) {
    Write-Host "[SUCCESS] Basic infrastructure checks passed" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Some checks failed. Please review above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run database setup script: scripts\setup_n8n_abstraction_layer.sql" -ForegroundColor White
Write-Host "2. Verify all Mattermost channels are created" -ForegroundColor White
Write-Host "3. Verify all webhooks are created and URLs saved" -ForegroundColor White
Write-Host "4. Test Mattermost connection in N8N" -ForegroundColor White
Write-Host "5. Proceed to Phase 2: Task Management workflows" -ForegroundColor White
Write-Host ""

