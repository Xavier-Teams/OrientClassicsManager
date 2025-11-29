@echo off
REM ============================================================================
REM N8N DEVELOPMENT ENVIRONMENT SETUP - WINDOWS VERSION
REM ============================================================================
REM File: scripts/setup_n8n_development.bat
REM Description: Setup N8N development environment for OrientClassicsManager (Windows)
REM Version: 1.0
REM Date: 2024-11-27
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set N8N_PORT=5678
set N8N_USER=admin
set N8N_PASSWORD=orient2024
set DB_HOST=host.docker.internal
set DB_PORT=5432
set DB_NAME=orient_classics_manager
set DB_USER=postgres

echo.
echo ============================================================================
echo 🚀 Setting up N8N Development Environment for OrientClassicsManager...
echo ============================================================================
echo.

REM ============================================================================
REM PREREQUISITES CHECK
REM ============================================================================

echo 📋 Checking prerequisites...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM ============================================================================
REM DIRECTORY SETUP
REM ============================================================================

echo 📁 Setting up directories...

if not exist "n8n-data" mkdir n8n-data
if not exist "n8n-workflows" mkdir n8n-workflows
if not exist "n8n-credentials" mkdir n8n-credentials

echo ✅ Directories created
echo.

REM ============================================================================
REM DOCKER COMPOSE CONFIGURATION
REM ============================================================================

echo 🐳 Creating Docker Compose configuration...

(
echo version: '3.8'
echo.
echo services:
echo   n8n:
echo     image: n8nio/n8n:latest
echo     container_name: orient-n8n-dev
echo     restart: unless-stopped
echo     ports:
echo       - "%N8N_PORT%:5678"
echo     environment:
echo       # Basic Configuration
echo       - N8N_HOST=localhost
echo       - N8N_PORT=5678
echo       - N8N_PROTOCOL=http
echo       - WEBHOOK_URL=http://localhost:%N8N_PORT%/
echo       - GENERIC_TIMEZONE=Asia/Ho_Chi_Minh
echo       
echo       # Authentication
echo       - N8N_BASIC_AUTH_ACTIVE=true
echo       - N8N_BASIC_AUTH_USER=%N8N_USER%
echo       - N8N_BASIC_AUTH_PASSWORD=%N8N_PASSWORD%
echo       
echo       # Database Configuration ^(PostgreSQL^)
echo       - DB_TYPE=postgresdb
echo       - DB_POSTGRESDB_HOST=%DB_HOST%
echo       - DB_POSTGRESDB_PORT=%DB_PORT%
echo       - DB_POSTGRESDB_DATABASE=%DB_NAME%
echo       - DB_POSTGRESDB_USER=%DB_USER%
echo       - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
echo       
echo       # Email Configuration ^(Gmail SMTP^)
echo       - N8N_EMAIL_MODE=smtp
echo       - N8N_SMTP_HOST=smtp.gmail.com
echo       - N8N_SMTP_PORT=587
echo       - N8N_SMTP_USER=${SMTP_USER}
echo       - N8N_SMTP_PASS=${SMTP_PASS}
echo       - N8N_SMTP_SENDER=${SMTP_USER}
echo       
echo       # Security
echo       - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
echo       
echo       # Performance
echo       - N8N_PAYLOAD_SIZE_MAX=16
echo       - EXECUTIONS_TIMEOUT=3600
echo       - EXECUTIONS_TIMEOUT_MAX=7200
echo       
echo       # Logging
echo       - N8N_LOG_LEVEL=info
echo       - N8N_LOG_OUTPUT=console
echo       
echo       # Features
echo       - N8N_DISABLE_UI=false
echo       - N8N_METRICS=true
echo       
echo     volumes:
echo       - ./n8n-data:/home/node/.n8n
echo       - ./n8n-workflows:/home/node/.n8n/workflows
echo       - ./n8n-credentials:/home/node/.n8n/credentials
echo     networks:
echo       - orient-network
echo     healthcheck:
echo       test: ["CMD-SHELL", "curl -f http://localhost:5678/healthz ^|^| exit 1"]
echo       interval: 30s
echo       timeout: 10s
echo       retries: 3
echo       start_period: 40s
echo.
echo networks:
echo   orient-network:
echo     driver: bridge
echo     name: orient-network
) > docker-compose.n8n.yml

echo ✅ Docker Compose configuration created
echo.

REM ============================================================================
REM ENVIRONMENT VARIABLES
REM ============================================================================

echo 🔧 Setting up environment variables...

if not exist ".env.n8n" (
    (
    echo # ============================================================================
    echo # N8N ENVIRONMENT VARIABLES
    echo # ============================================================================
    echo.
    echo # Database Configuration
    echo DB_PASSWORD=your_postgres_password_here
    echo.
    echo # Email Configuration ^(Gmail App Password recommended^)
    echo SMTP_USER=your_email@gmail.com
    echo SMTP_PASS=your_app_password_here
    echo.
    echo # N8N Encryption Key ^(generate a random 32-character string^)
    echo N8N_ENCRYPTION_KEY=your_32_character_encryption_key_here
    echo.
    echo # Webhook URLs
    echo ORIENT_API_BASE_URL=http://host.docker.internal:8000
    echo ORIENT_WEBHOOK_SECRET=your_webhook_secret_here
    echo.
    echo # Additional Configuration
    echo N8N_USER_MANAGEMENT_DISABLED=true
    echo N8N_DIAGNOSTICS_ENABLED=false
    ) > .env.n8n
    
    echo 📝 Created .env.n8n file - Please edit with your actual credentials
)
echo.

REM ============================================================================
REM N8N WORKFLOW TEMPLATES
REM ============================================================================

echo 📋 Creating N8N workflow templates...

REM Create contract approval workflow template
(
echo {
echo   "name": "Contract Approval Workflow",
echo   "nodes": [
echo     {
echo       "parameters": {
echo         "path": "contract-approval",
echo         "options": {}
echo       },
echo       "name": "Contract Submitted",
echo       "type": "n8n-nodes-base.webhook",
echo       "typeVersion": 1,
echo       "position": [240, 300],
echo       "webhookId": "contract-approval-webhook"
echo     },
echo     {
echo       "parameters": {
echo         "operation": "executeQuery",
echo         "query": "SELECT c.*, u.email as creator_email, u.full_name as creator_name FROM contracts c JOIN users u ON c.created_by_id = u.id WHERE c.id = $1",
echo         "additionalFields": {
echo           "values": "={{ $json.contract_id }}"
echo         }
echo       },
echo       "name": "Get Contract Details",
echo       "type": "n8n-nodes-base.postgres",
echo       "typeVersion": 1,
echo       "position": [460, 300]
echo     }
echo   ],
echo   "connections": {},
echo   "active": true,
echo   "settings": {},
echo   "versionId": "1"
echo }
) > n8n-workflows\contract-approval-workflow.json

echo ✅ N8N workflow templates created
echo.

REM ============================================================================
REM START N8N
REM ============================================================================

echo 🚀 Starting N8N container...

docker-compose -f docker-compose.n8n.yml up -d

if errorlevel 1 (
    echo ❌ Failed to start N8N container
    pause
    exit /b 1
)

echo ⏳ Waiting for N8N to start ^(this may take a minute^)...
timeout /t 30 /nobreak >nul

REM Health check
set MAX_ATTEMPTS=10
set ATTEMPT=1

:healthcheck
if !ATTEMPT! gtr !MAX_ATTEMPTS! (
    echo ❌ N8N failed to start after !MAX_ATTEMPTS! attempts
    echo 📋 Checking container logs:
    docker logs orient-n8n-dev --tail 50
    pause
    exit /b 1
)

curl -f http://localhost:%N8N_PORT%/healthz >nul 2>&1
if errorlevel 1 (
    echo ⏳ Attempt !ATTEMPT!/!MAX_ATTEMPTS! - N8N not ready yet...
    timeout /t 10 /nobreak >nul
    set /a ATTEMPT+=1
    goto healthcheck
)

echo ✅ N8N is running successfully!
echo.

REM ============================================================================
REM SUCCESS MESSAGE
REM ============================================================================

echo ============================================================================
echo 🎉 N8N Development Environment Setup Complete!
echo ============================================================================
echo.

echo 📍 Access Information:
echo    🌐 N8N Web Interface: http://localhost:%N8N_PORT%
echo    👤 Username: %N8N_USER%
echo    🔑 Password: %N8N_PASSWORD%
echo.

echo 🔗 Webhook URLs:
echo    📋 Contract Approval: http://localhost:%N8N_PORT%/webhook/contract-approval
echo.

echo 📁 Important Files:
echo    ⚙️  Docker Compose: docker-compose.n8n.yml
echo    🔧 Environment: .env.n8n
echo    📋 Workflows: .\n8n-workflows\
echo    💾 Data: .\n8n-data\
echo.

echo 🛠️  Next Steps:
echo    1. Edit .env.n8n with your actual credentials
echo    2. Access N8N web interface and import workflow templates
echo    3. Configure database connection in N8N
echo    4. Test the contract approval workflow
echo.

echo 📋 Useful Commands:
echo    🔄 Restart N8N: docker-compose -f docker-compose.n8n.yml restart
echo    📊 View logs: docker logs orient-n8n-dev -f
echo    🛑 Stop N8N: docker-compose -f docker-compose.n8n.yml down
echo    🗑️  Remove all: docker-compose -f docker-compose.n8n.yml down -v
echo.

echo ⚠️  Important Notes:
echo    • Make sure PostgreSQL is running and accessible
echo    • Configure email credentials in .env.n8n for notifications
echo    • The webhook URL will be used by OrientClassicsManager API
echo    • Check firewall settings if accessing from other machines
echo.

echo 🚀 N8N is ready for OrientClassicsManager integration!
echo.

pause
