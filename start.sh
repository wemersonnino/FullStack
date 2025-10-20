#!/bin/bash

# Web App Escala - Quick Start Script
# This script helps you quickly set up and run the application

set -e

echo "🚀 Web App Escala - Quick Start"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created."
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and update the secrets before using in production!"
    echo ""
else
    echo "✅ .env file already exists."
fi

# Ask user which mode to run
echo "Select mode:"
echo "1) Development (with hot reload)"
echo "2) Production"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo ""
        echo "🔨 Starting in Development mode..."
        echo ""
        docker-compose up -d
        ;;
    2)
        echo ""
        echo "🚢 Starting in Production mode..."
        echo ""
        docker-compose -f docker-compose.prod.yml up -d
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Application started successfully!"
echo ""
echo "🌐 Access the applications:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:1337/admin"
echo "   Database:  localhost:5432"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://localhost:1337/admin in your browser"
echo "   2. Create your first admin user"
echo "   3. Configure API permissions in Settings > Users & Permissions"
echo "   4. Open http://localhost:3000 to access the frontend"
echo ""
echo "📚 Documentation:"
echo "   README.md         - Project overview"
echo "   SETUP.md          - Detailed setup guide"
echo "   API.md            - API documentation"
echo "   ARCHITECTURE.md   - System architecture"
echo ""
echo "🛠  Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo ""
echo "Happy coding! 🎉"
