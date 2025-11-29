# Setup Mattermost for OrientClassicsManager
# PowerShell script to setup and configure Mattermost

Write-Host "🚀 Setting up Mattermost for OrientClassicsManager..." -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if orient-network exists
Write-Host "`n🌐 Checking Docker network..." -ForegroundColor Yellow
$networkExists = docker network ls --filter name=orient-network --format "{{.Name}}"
if (-not $networkExists) {
    Write-Host "Creating orient-network..." -ForegroundColor Yellow
    docker network create orient-network
    Write-Host "✅ Network created" -ForegroundColor Green
} else {
    Write-Host "✅ Network exists" -ForegroundColor Green
}

# Check if .env file exists
Write-Host "`n📝 Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating template..." -ForegroundColor Yellow
    @"
# Mattermost Database Password
MATTERMOST_DB_PASSWORD=mattermost_password_2024

# SMTP Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created. Please update with your values." -ForegroundColor Green
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Start Mattermost
Write-Host "`n🚀 Starting Mattermost containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.mattermost.yml up -d

# Wait for Mattermost to be ready
Write-Host "`n⏳ Waiting for Mattermost to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8065/api/v4/system/ping" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $ready = $true
            Write-Host "✅ Mattermost is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $ready) {
    Write-Host "`n⚠️  Mattermost is taking longer than expected. Please check logs:" -ForegroundColor Yellow
    Write-Host "   docker logs orient-mattermost" -ForegroundColor Gray
} else {
    Write-Host "`n✅ Mattermost setup complete!" -ForegroundColor Green
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open http://localhost:8065 in your browser" -ForegroundColor White
    Write-Host "   2. Create admin account (first user becomes admin)" -ForegroundColor White
    Write-Host "   3. Create channels:" -ForegroundColor White
    Write-Host "      - #tasks-general" -ForegroundColor Gray
    Write-Host "      - #contracts-approvals" -ForegroundColor Gray
    Write-Host "      - #system-alerts" -ForegroundColor Gray
    Write-Host "   4. Create incoming webhooks for N8N integration" -ForegroundColor White
    Write-Host "   5. See Doc/Integration/MATTERMOST_INTEGRATION.md for details" -ForegroundColor White
}

Write-Host "`n📊 Container Status:" -ForegroundColor Cyan
docker ps --filter name=orient-mattermost --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`nDone!" -ForegroundColor Green

