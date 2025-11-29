# Complete Mattermost Setup Guide
# Interactive script to guide through Mattermost setup and N8N integration

Write-Host "🚀 Complete Mattermost Setup Guide" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check Mattermost
Write-Host "`n📦 Step 1: Checking Mattermost..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8065/api/v4/system/ping" -Method GET -TimeoutSec 5
    Write-Host "✅ Mattermost is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Mattermost is not running. Please start it first:" -ForegroundColor Red
    Write-Host "   docker-compose -f docker-compose.mattermost.yml up -d" -ForegroundColor Gray
    exit 1
}

# Open Mattermost
Write-Host "`n🌐 Opening Mattermost in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:8065"
Start-Sleep -Seconds 2

Write-Host "`n📋 Step 2: Create Admin Account" -ForegroundColor Cyan
Write-Host "   - Mattermost should be open in your browser" -ForegroundColor White
Write-Host "   - Create your admin account (first user = admin)" -ForegroundColor White
Write-Host "   - Press Enter when done..." -ForegroundColor Yellow
Read-Host

Write-Host "`n📋 Step 3: Create Channels" -ForegroundColor Cyan
Write-Host "   Required channels:" -ForegroundColor White
Write-Host "   - #tasks-general" -ForegroundColor Gray
Write-Host "   - #tasks-urgent" -ForegroundColor Gray
Write-Host "   - #contracts-approvals" -ForegroundColor Gray
Write-Host "   - #contracts-payments" -ForegroundColor Gray
Write-Host "   - #system-alerts" -ForegroundColor Gray
Write-Host "`n   Create these channels in Mattermost" -ForegroundColor White
Write-Host "   Press Enter when done..." -ForegroundColor Yellow
Read-Host

Write-Host "`n📋 Step 4: Create Webhooks" -ForegroundColor Cyan
Write-Host "   - Mattermost → Menu (☰) → Integrations → Incoming Webhooks" -ForegroundColor White
Write-Host "   - Create webhook for each channel" -ForegroundColor White
Write-Host "   - Copy webhook URLs" -ForegroundColor White
Write-Host "`n   Press Enter when done..." -ForegroundColor Yellow
Read-Host

Write-Host "`n📋 Step 5: Get Access Token" -ForegroundColor Cyan
Write-Host "   - Mattermost → Your Profile → Account Settings → Security" -ForegroundColor White
Write-Host "   - Personal Access Tokens → Create Token" -ForegroundColor White
Write-Host "   - Copy the token" -ForegroundColor White
Write-Host "`n   Enter your access token (or press Enter to skip):" -ForegroundColor Yellow
$token = Read-Host

if ($token) {
    Write-Host "✅ Token received (saved for N8N configuration)" -ForegroundColor Green
} else {
    Write-Host "⚠️  You can add token later in N8N" -ForegroundColor Yellow
}

Write-Host "`n📋 Step 6: Configure N8N" -ForegroundColor Cyan
Write-Host "   Opening N8N..." -ForegroundColor Yellow
Start-Process "http://localhost:5678"
Start-Sleep -Seconds 2

Write-Host "`n   In N8N:" -ForegroundColor White
Write-Host "   1. Go to Credentials → Add Credential" -ForegroundColor Gray
Write-Host "   2. Search for 'Mattermost'" -ForegroundColor Gray
Write-Host "   3. Configure:" -ForegroundColor Gray
Write-Host "      - Name: Mattermost Connection" -ForegroundColor DarkGray
Write-Host "      - URL: http://localhost:8065" -ForegroundColor DarkGray
if ($token) {
    Write-Host "      - Access Token: $token" -ForegroundColor DarkGray
} else {
    Write-Host "      - Access Token: (enter your token)" -ForegroundColor DarkGray
}
Write-Host "   4. Test Connection → Save" -ForegroundColor Gray
Write-Host "`n   Press Enter when done..." -ForegroundColor Yellow
Read-Host

Write-Host "`n📋 Step 7: Import Test Workflow" -ForegroundColor Cyan
Write-Host "   In N8N:" -ForegroundColor White
Write-Host "   1. Workflows → Import from File" -ForegroundColor Gray
Write-Host "   2. Select: n8n-workflows/mattermost-test-workflow.json" -ForegroundColor Gray
Write-Host "   3. Update 'Send to Mattermost' node with credential" -ForegroundColor Gray
Write-Host "   4. Activate workflow" -ForegroundColor Gray
Write-Host "   5. Test by calling webhook:" -ForegroundColor Gray
Write-Host "`n   Test command:" -ForegroundColor Yellow
Write-Host "   `$body = @{ channel = '#tasks-general' } | ConvertTo-Json" -ForegroundColor Gray
Write-Host "   Invoke-RestMethod -Uri 'http://localhost:5678/webhook/mattermost-test' -Method Post -Body `$body -ContentType 'application/json'" -ForegroundColor Gray
Write-Host "`n   Press Enter when done..." -ForegroundColor Yellow
Read-Host

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review automation strategy: Doc/Automation/COMPREHENSIVE_AUTOMATION_STRATEGY.md" -ForegroundColor White
Write-Host "   2. Follow implementation plan: Doc/Automation/IMPLEMENTATION_PLAN.md" -ForegroundColor White
Write-Host "   3. Import task reminder workflow: n8n-workflows/task-due-reminder-mattermost.json" -ForegroundColor White
Write-Host "   4. Update existing workflows with Mattermost notifications" -ForegroundColor White

Write-Host "`n✨ All done! Mattermost is ready for automation." -ForegroundColor Green

