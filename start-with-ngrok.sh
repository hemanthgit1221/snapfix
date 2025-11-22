#!/bin/bash
# Bash script to start SnapFix with ngrok (for Linux/Mac)

echo "=== SnapFix Docker Setup with Ngrok ==="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "✗ Docker is not running. Please start Docker."
    exit 1
fi
echo "✓ Docker is running"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠ Please update .env file with your configuration"
fi

# Read ngrok token from .env
NGROK_TOKEN=$(grep "^NGROK_AUTH_TOKEN=" .env | cut -d '=' -f2 | tr -d ' ')

# Update ngrok.yml with token if needed
if [ ! -z "$NGROK_TOKEN" ] && [ "$NGROK_TOKEN" != "YOUR_NGROK_AUTH_TOKEN_HERE" ]; then
    echo "Updating ngrok.yml with auth token..."
    sed -i.bak "s/YOUR_NGROK_AUTH_TOKEN_HERE/$NGROK_TOKEN/g" ngrok.yml
    echo "✓ Ngrok configuration updated"
else
    echo "⚠ Warning: Ngrok auth token not set. Update it in .env file or ngrok.yml"
fi

# Build and start containers
echo ""
echo "Building Docker images..."
docker-compose build

echo ""
echo "Starting services..."
docker-compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Get ngrok URLs
echo ""
echo "Fetching Ngrok public URLs..."
sleep 5

NGROK_URLS=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null)
if [ ! -z "$NGROK_URLS" ]; then
    echo ""
    echo "=== Public URLs via Ngrok ==="
    echo "$NGROK_URLS" | grep -o '"public_url":"[^"]*"' | grep -o 'http[^"]*' | while read url; do
        # Determine service from URL path
        if curl -s "$url" | grep -q "SnapFix\|React"; then
            echo "Frontend:     $url"
        elif curl -s "$url/actuator/health" > /dev/null 2>&1; then
            echo "Backend API:  $url"
        else
            echo "Service:      $url"
        fi
    done
else
    echo "⚠ Ngrok tunnels not available yet. Check http://localhost:4040"
fi

echo ""
echo "=== Local URLs ==="
echo "Frontend:     http://localhost:3000"
echo "Backend API:  http://localhost:8080"
echo "Ngrok UI:     http://localhost:4040"
echo "DB Dashboard: http://localhost:3001"

echo ""
echo "=== Useful Commands ==="
echo "View logs:         docker-compose logs -f"
echo "Stop services:     docker-compose down"
echo "View ngrok UI:     http://localhost:4040"
echo "Rebuild:           docker-compose up -d --build"

echo ""
echo "✓ Setup complete!"








