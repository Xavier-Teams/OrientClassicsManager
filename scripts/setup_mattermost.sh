#!/bin/bash
# Setup Mattermost for OrientClassicsManager
# Bash script to setup and configure Mattermost

echo "🚀 Setting up Mattermost for OrientClassicsManager..."

# Check if Docker is running
echo ""
echo "📦 Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi
echo "✅ Docker is running"

# Check if orient-network exists
echo ""
echo "🌐 Checking Docker network..."
if ! docker network ls | grep -q "orient-network"; then
    echo "Creating orient-network..."
    docker network create orient-network
    echo "✅ Network created"
else
    echo "✅ Network exists"
fi

# Check if .env file exists
echo ""
echo "📝 Checking environment variables..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Mattermost Database Password
MATTERMOST_DB_PASSWORD=mattermost_password_2024

# SMTP Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EOF
    echo "✅ .env file created. Please update with your values."
else
    echo "✅ .env file exists"
fi

# Start Mattermost
echo ""
echo "🚀 Starting Mattermost containers..."
docker-compose -f docker-compose.mattermost.yml up -d

# Wait for Mattermost to be ready
echo ""
echo "⏳ Waiting for Mattermost to be ready..."
max_attempts=30
attempt=0
ready=false

while [ $attempt -lt $max_attempts ] && [ "$ready" = false ]; do
    sleep 2
    attempt=$((attempt + 1))
    if curl -f http://localhost:8065/api/v4/system/ping > /dev/null 2>&1; then
        ready=true
        echo "✅ Mattermost is ready!"
    else
        echo -n "."
    fi
done

if [ "$ready" = false ]; then
    echo ""
    echo "⚠️  Mattermost is taking longer than expected. Please check logs:"
    echo "   docker logs orient-mattermost"
else
    echo ""
    echo "✅ Mattermost setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Open http://localhost:8065 in your browser"
    echo "   2. Create admin account (first user becomes admin)"
    echo "   3. Create channels:"
    echo "      - #tasks-general"
    echo "      - #contracts-approvals"
    echo "      - #system-alerts"
    echo "   4. Create incoming webhooks for N8N integration"
    echo "   5. See Doc/Integration/MATTERMOST_INTEGRATION.md for details"
fi

echo ""
echo "📊 Container Status:"
docker ps --filter name=orient-mattermost --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✨ Done!"

