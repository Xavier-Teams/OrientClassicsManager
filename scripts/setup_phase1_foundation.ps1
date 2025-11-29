# Setup Phase 1: Foundation
# Master script to setup all Phase 1 components

param(
    [Parameter(Mandatory=$false)]
    [string]$DatabaseName = "translation_db",
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseHost = "localhost",
    
    [Parameter(Mandatory=$false)]
    [int]$DatabasePort = 5432,
    
    [Parameter(Mandatory=$false)]
    [string]$DatabaseUser = "postgres",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDatabase = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipMattermost = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 1: Foundation Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: VERIFY PREREQUISITES
# ============================================================================
Write-Host "Step 1: Verifying Prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Gray
try {
    $dockerVersion = docker --version
    Write-Host "  [OK] Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Docker not found. Please install Docker." -ForegroundColor Red
    exit 1
}

# Check Mattermost
Write-Host "Checking Mattermost..." -ForegroundColor Gray
try {
    $mmContainer = docker ps --filter name=orient-mattermost --format "{{.Names}}"
    if ($mmContainer -eq "orient-mattermost") {
        Write-Host "  [OK] Mattermost container is running" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Mattermost container not running" -ForegroundColor Yellow
        if (-not $SkipMattermost) {
            Write-Host "  [INFO] Starting Mattermost..." -ForegroundColor Gray
            docker-compose -f docker-compose.mattermost.yml up -d
            Start-Sleep -Seconds 5
        }
    }
} catch {
    Write-Host "  [WARN] Could not check Mattermost: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Check N8N
Write-Host "Checking N8N..." -ForegroundColor Gray
try {
    $n8nContainer = docker ps --filter name=orient-n8n-dev --format "{{.Names}}"
    if ($n8nContainer -eq "orient-n8n-dev") {
        Write-Host "  [OK] N8N container is running" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] N8N container not running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [WARN] Could not check N8N: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# STEP 2: SETUP DATABASE ABSTRACTION LAYER
# ============================================================================
if (-not $SkipDatabase) {
    Write-Host "Step 2: Setting up Database Abstraction Layer..." -ForegroundColor Yellow
    Write-Host ""
    
    $sqlScript = "scripts\setup_n8n_abstraction_layer.sql"
    
    if (Test-Path $sqlScript) {
        Write-Host "  [INFO] SQL script found: $sqlScript" -ForegroundColor Gray
        Write-Host "  [INFO] Please run this script in pgAdmin or psql:" -ForegroundColor Gray
        Write-Host "    psql -h $DatabaseHost -p $DatabasePort -U $DatabaseUser -d $DatabaseName -f $sqlScript" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "  Or in pgAdmin:" -ForegroundColor Gray
        Write-Host "    1. Connect to database: $DatabaseName" -ForegroundColor DarkGray
        Write-Host "    2. Open Query Tool" -ForegroundColor DarkGray
        Write-Host "    3. Open file: $sqlScript" -ForegroundColor DarkGray
        Write-Host "    4. Execute" -ForegroundColor DarkGray
        Write-Host ""
        
        $runNow = Read-Host "  Do you want to run it now? (y/n)"
        if ($runNow -eq "y" -or $runNow -eq "Y") {
            $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
            if ($psqlPath) {
                Write-Host "  [INFO] Running SQL script..." -ForegroundColor Gray
                $env:PGPASSWORD = Read-Host "  Enter database password" -AsSecureString
                # Note: This is simplified - in production, use proper credential handling
                Write-Host "  [WARN] Please run manually with proper credentials" -ForegroundColor Yellow
            } else {
                Write-Host "  [WARN] psql not found. Please run manually in pgAdmin." -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  [FAIL] SQL script not found: $sqlScript" -ForegroundColor Red
    }
    
    Write-Host ""
} else {
    Write-Host "Step 2: Skipping Database Setup (--SkipDatabase)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# STEP 3: SETUP MATTERMOST CHANNELS
# ============================================================================
if (-not $SkipMattermost) {
    Write-Host "Step 3: Setting up Mattermost Channels..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "  [INFO] Running Mattermost channel setup script..." -ForegroundColor Gray
    Write-Host ""
    
    & "scripts\setup_mattermost_channels.ps1"
    
    Write-Host ""
} else {
    Write-Host "Step 3: Skipping Mattermost Setup (--SkipMattermost)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# STEP 4: VERIFY SETUP
# ============================================================================
Write-Host "Step 4: Verifying Setup..." -ForegroundColor Yellow
Write-Host ""

& "scripts\verify_phase1_setup.ps1"

Write-Host ""

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 1 Setup Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify database views and functions are created" -ForegroundColor White
Write-Host "2. Verify all Mattermost channels are created" -ForegroundColor White
Write-Host "3. Verify all webhooks are created and URLs saved" -ForegroundColor White
Write-Host "4. Test Mattermost connection in N8N" -ForegroundColor White
Write-Host "5. Proceed to Phase 2: Task Management workflows" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "- Phase 1 Guide: Doc\Automation\COMPREHENSIVE_AUTOMATION_STRATEGY.md" -ForegroundColor Gray
Write-Host "- Setup Complete: Doc\Automation\SETUP_COMPLETE.md" -ForegroundColor Gray
Write-Host "- Mattermost Integration: Doc\Integration\MATTERMOST_INTEGRATION.md" -ForegroundColor Gray
Write-Host ""

