# Setup Mattermost Channels and Webhooks
# PowerShell script to guide channel creation and webhook setup

param(
    [Parameter(Mandatory=$false)]
    [string]$MattermostUrl = "http://localhost:8065",
    
    [Parameter(Mandatory=$false)]
    [string]$AccessToken = ""
)

Write-Host "🚀 Setting up Mattermost Channels and Webhooks..." -ForegroundColor Cyan
Write-Host "Mattermost URL: $MattermostUrl" -ForegroundColor Gray

# Check if Mattermost is accessible
Write-Host "`n📦 Checking Mattermost..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$MattermostUrl/api/v4/system/ping" -Method GET -TimeoutSec 5
    Write-Host "✅ Mattermost is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot access Mattermost. Please ensure it's running at $MattermostUrl" -ForegroundColor Red
    exit 1
}

# Channels to create
$channels = @(
    @{Name="tasks-general"; DisplayName="Tasks General"; Purpose="General task notifications"},
    @{Name="tasks-urgent"; DisplayName="Tasks Urgent"; Purpose="Urgent tasks only"},
    @{Name="tasks-bien-tap"; DisplayName="Tasks Bien Tap"; Purpose="Biên tập tasks"},
    @{Name="tasks-hanh-chinh"; DisplayName="Tasks Hanh Chinh"; Purpose="Hành chính tasks"},
    @{Name="contracts-approvals"; DisplayName="Contracts Approvals"; Purpose="Contract approval requests"},
    @{Name="contracts-payments"; DisplayName="Contracts Payments"; Purpose="Payment notifications"},
    @{Name="contracts-expiry"; DisplayName="Contracts Expiry"; Purpose="Contract expiry reminders"},
    @{Name="system-alerts"; DisplayName="System Alerts"; Purpose="System notifications"},
    @{Name="workflows-approvals"; DisplayName="Workflows Approvals"; Purpose="Approval workflows"},
    @{Name="general"; DisplayName="General"; Purpose="General discussions"},
    @{Name="announcements"; DisplayName="Announcements"; Purpose="Important announcements"}
)

Write-Host "`n📋 Channels to Create:" -ForegroundColor Cyan
foreach ($channel in $channels) {
    Write-Host "   - #$($channel.Name) - $($channel.DisplayName)" -ForegroundColor White
}

Write-Host "`n📝 Instructions:" -ForegroundColor Cyan
Write-Host "   1. Open Mattermost: $MattermostUrl" -ForegroundColor White
Write-Host "   2. Login with your admin account" -ForegroundColor White
Write-Host "   3. Create the channels listed above" -ForegroundColor White
Write-Host "   4. For each channel, create an Incoming Webhook:" -ForegroundColor White
Write-Host "      - Menu (☰) → Integrations → Incoming Webhooks" -ForegroundColor Gray
Write-Host "      - Add Incoming Webhook" -ForegroundColor Gray
Write-Host "      - Select channel" -ForegroundColor Gray
Write-Host "      - Save and copy Webhook URL" -ForegroundColor Gray

Write-Host "`n💡 Tip: Save webhook URLs in a file for easy access" -ForegroundColor Yellow

# If access token is provided, try to create channels via API
if ($AccessToken) {
    Write-Host "`n🔧 Attempting to create channels via API..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $AccessToken"
        "Content-Type" = "application/json"
    }
    
    foreach ($channel in $channels) {
        try {
            $body = @{
                name = $channel.Name
                display_name = $channel.DisplayName
                purpose = $channel.Purpose
                type = "O"
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "$MattermostUrl/api/v4/channels" -Method POST -Headers $headers -Body $body -TimeoutSec 5
            Write-Host "   ✅ Created channel: #$($channel.Name)" -ForegroundColor Green
        } catch {
            $errorMsg = $_.Exception.Message
            if ($errorMsg -like "*already exists*" -or $errorMsg -like "*409*") {
                Write-Host "   ⚠️  Channel #$($channel.Name) already exists" -ForegroundColor Yellow
            } else {
                Write-Host "   ❌ Failed to create #$($channel.Name): $errorMsg" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "`n💡 To create channels automatically, provide AccessToken:" -ForegroundColor Yellow
    Write-Host "   .\scripts\setup_mattermost_channels.ps1 -AccessToken 'your-token'" -ForegroundColor Gray
    Write-Host "`n   Get token from: Mattermost → Account Settings → Security → Personal Access Tokens" -ForegroundColor Gray
}

Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Create channels manually (if not using API)" -ForegroundColor White
Write-Host "   2. Create webhooks for each channel" -ForegroundColor White
Write-Host "   3. Save webhook URLs" -ForegroundColor White
Write-Host "   4. Configure N8N with Mattermost credential" -ForegroundColor White
Write-Host "   5. Test integration" -ForegroundColor White

Write-Host "`n✨ Done!" -ForegroundColor Green

