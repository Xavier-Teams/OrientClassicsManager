#!/bin/bash
# Setup script cho OrientClassicsManager

echo "🚀 Setting up OrientClassicsManager..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with database and API credentials"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📊 Setting up database..."
echo "⚠️  Note: If prompted, select 'create table' for all new tables"
npm run db:push

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Start the server: npm run dev"
echo "2. Test AI health: curl http://localhost:5000/api/ai/health"
echo "3. Open browser: http://localhost:5000"

