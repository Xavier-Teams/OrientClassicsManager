# Setup N8N Mattermost Integration
# PowerShell script to guide N8N and Mattermost integration

param(
    [Parameter(Mandatory=$false)]
    [string]$MattermostUrl = "http://localhost:8065",
    
    [Parameter(Mandatory=$false)]
    [string]$N8NUrl = "http://localhost:5678"
)

Write-Host "🔗 Setting up N8N and Mattermost Integration..." -ForegroundColor Cyan

# Check Mattermost
Write-Host "`n📦 Checking Mattermost..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$MattermostUrl/api/v4/system/ping" -Method GET -TimeoutSec 5
    Write-Host "✅ Mattermost is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Mattermost is not accessible. Please start Mattermost first." -ForegroundColor Red
    exit 1
}

# Check N8N
Write-Host "`n📦 Checking N8N..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$N8NUrl/healthz" -Method GET -TimeoutSec 5
    Write-Host "✅ N8N is accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️  N8N might not be accessible. Please check if it's running." -ForegroundColor Yellow
}

Write-Host "`n📋 Integration Setup Steps:" -ForegroundColor Cyan

Write-Host "`n1️⃣  Get Mattermost Access Token:" -ForegroundColor Yellow
Write-Host "   a. Open Mattermost: $MattermostUrl" -ForegroundColor White
Write-Host "   b. Click your profile → Account Settings → Security" -ForegroundColor White
Write-Host "   c. Personal Access Tokens → Create Token" -ForegroundColor White
Write-Host "   d. Copy the token" -ForegroundColor White

Write-Host "`n2️⃣  Configure N8N Mattermost Credential:" -ForegroundColor Yellow
Write-Host "   a. Open N8N: $N8NUrl" -ForegroundColor White
Write-Host "   b. Go to Credentials → Add Credential" -ForegroundColor White
Write-Host "   c. Search for 'Mattermost'" -ForegroundColor White
Write-Host "   d. Configure:" -ForegroundColor White
Write-Host "      - Name: Mattermost Connection" -ForegroundColor Gray
Write-Host "      - URL: $MattermostUrl" -ForegroundColor Gray
Write-Host "      - Access Token: (paste token from step 1)" -ForegroundColor Gray
Write-Host "   e. Test Connection → Save" -ForegroundColor White

Write-Host "`n3️⃣  Get Webhook URLs from Mattermost:" -ForegroundColor Yellow
Write-Host "   a. Mattermost → Menu (☰) → Integrations → Incoming Webhooks" -ForegroundColor White
Write-Host "   b. For each channel, create webhook:" -ForegroundColor White
Write-Host "      - #tasks-general" -ForegroundColor Gray
Write-Host "      - #contracts-approvals" -ForegroundColor Gray
Write-Host "      - #system-alerts" -ForegroundColor Gray
Write-Host "   c. Copy webhook URLs" -ForegroundColor White

Write-Host "`n4️⃣  Create Test Workflow in N8N:" -ForegroundColor Yellow
Write-Host "   a. N8N → New Workflow" -ForegroundColor White
Write-Host "   b. Add 'Mattermost' node" -ForegroundColor White
Write-Host "   c. Select credential from step 2" -ForegroundColor White
Write-Host "   d. Configure:" -ForegroundColor White
Write-Host "      - Operation: Post Message" -ForegroundColor Gray
Write-Host "      - Channel: #tasks-general" -ForegroundColor Gray
Write-Host "      - Message: Test from N8N" -ForegroundColor Gray
Write-Host "   e. Execute workflow" -ForegroundColor White
Write-Host "   f. Verify message in Mattermost" -ForegroundColor White

Write-Host "`n💡 Alternative: Use HTTP Request Node with Webhook URL" -ForegroundColor Yellow
Write-Host "   - Add 'HTTP Request' node" -ForegroundColor Gray
Write-Host "   - Method: POST" -ForegroundColor Gray
Write-Host "   - URL: (webhook URL from step 3)" -ForegroundColor Gray
Write-Host "   - Body: JSON" -ForegroundColor Gray
Write-Host "   {`"text`": `"Test message`"}" -ForegroundColor Gray

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Integration Guide: Doc/Integration/MATTERMOST_INTEGRATION.md" -ForegroundColor White
Write-Host "   - Quick Start: Doc/Integration/MATTERMOST_QUICK_START.md" -ForegroundColor White
Write-Host "   - Workflow Suggestions: Doc/N8N/WORKFLOW_SUGGESTIONS.md" -ForegroundColor White

Write-Host "`n✨ Setup guide complete!" -ForegroundColor Green
Write-Host "`nFollow the steps above to complete the integration." -ForegroundColor White

