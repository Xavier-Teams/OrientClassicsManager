# Test Mattermost Webhook
# PowerShell script to test Mattermost incoming webhook

param(
    [Parameter(Mandatory=$true)]
    [string]$WebhookUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$Channel = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Message = "Test message from OrientClassicsManager"
)

Write-Host "Testing Mattermost Webhook..." -ForegroundColor Cyan
Write-Host ""

# Validate webhook URL
if ($WebhookUrl -match "xxx|yyy|zzz|placeholder") {
    Write-Host "ERROR: Webhook URL contains placeholder!" -ForegroundColor Red
    Write-Host ""
    Write-Host "How to get Webhook URL:" -ForegroundColor Yellow
    Write-Host "   1. Open Mattermost: http://localhost:8065" -ForegroundColor White
    Write-Host "   2. Menu -> Integrations -> Incoming Webhooks" -ForegroundColor White
    Write-Host "   3. Click 'Add Incoming Webhook'" -ForegroundColor White
    Write-Host "   4. Select channel (e.g. #tasks-general)" -ForegroundColor White
    Write-Host "   5. Click 'Save'" -ForegroundColor White
    Write-Host "   6. Copy the Webhook URL (format: http://localhost:8065/hooks/xxxxxxxxxxxxxxxxxxxxxxxxxx)" -ForegroundColor White
    Write-Host ""
    exit 1
}

if (-not $WebhookUrl.StartsWith("http://localhost:8065/hooks/")) {
    Write-Host "WARNING: Webhook URL format might be incorrect!" -ForegroundColor Yellow
    Write-Host "   Expected format: http://localhost:8065/hooks/xxxxxxxxxxxxxxxxxxxxxxxxxx" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "   Webhook URL: $WebhookUrl" -ForegroundColor Gray
if ($Channel) {
    Write-Host "   Channel: $Channel" -ForegroundColor Gray
} else {
    Write-Host "   Channel: (using webhook default channel)" -ForegroundColor Gray
}
Write-Host "   Message: $Message" -ForegroundColor Gray
Write-Host ""

# Build request body
$body = @{
    text = $Message
}

# Only include channel if specified (webhook already has default channel)
if ($Channel) {
    # Remove # if present (Mattermost accepts both formats)
    $channelName = $Channel -replace "^#", ""
    $body.channel = $channelName
}

$jsonBody = $body | ConvertTo-Json -Depth 10

Write-Host "Sending request..." -ForegroundColor Yellow
Write-Host "   Body: $jsonBody" -ForegroundColor DarkGray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "SUCCESS: Webhook test successful!" -ForegroundColor Green
    if ($response) {
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Check Mattermost channel to verify message was received!" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED: Webhook test failed!" -ForegroundColor Red
    Write-Host ""
    
    $errorDetails = $_.Exception
    Write-Host "Error Details:" -ForegroundColor Red
    Write-Host "   Message: $($errorDetails.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        Write-Host "   Status: $statusCode $statusDescription" -ForegroundColor Yellow
        
        # Try to read error response body
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "   Response: $responseBody" -ForegroundColor Yellow
        } catch {
            # Ignore if can't read response
        }
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "   1. Verify webhook URL is correct (no 'xxx' placeholder)" -ForegroundColor White
    Write-Host "   2. Check if channel exists in Mattermost" -ForegroundColor White
    Write-Host "   3. Verify Mattermost is running: docker ps --filter name=orient-mattermost" -ForegroundColor White
    Write-Host "   4. Check Mattermost logs: docker logs orient-mattermost --tail 20" -ForegroundColor White
    Write-Host "   5. Try without channel parameter (use webhook default channel)" -ForegroundColor White
    Write-Host ""
    
    exit 1
}

Write-Host "Done!" -ForegroundColor Green

