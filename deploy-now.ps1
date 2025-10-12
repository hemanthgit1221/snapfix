# Quick Deploy Script for SnapFix
# Run this from the project root directory

Write-Host "🚀 Quick Deploy SnapFix Application" -ForegroundColor Blue

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Navigate to deployment directory
Set-Location deployment

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Write-Host "📝 Created .env file from example" -ForegroundColor Yellow
    Write-Host "   Please update .env with your configuration if needed" -ForegroundColor Yellow
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Blue
docker-compose down --remove-orphans

# Start the application
Write-Host "🏗️ Building and starting SnapFix..." -ForegroundColor Blue
docker-compose up --build -d

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Blue
Start-Sleep -Seconds 20

# Check if services are running
Write-Host "🔍 Checking service status..." -ForegroundColor Blue
docker-compose ps

Write-Host ""
Write-Host "🎉 SnapFix is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Cyan
Write-Host "  • Main App: http://localhost" -ForegroundColor White
Write-Host "  • API: http://localhost:8080/api" -ForegroundColor White
Write-Host "  • Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "👤 Test Users:" -ForegroundColor Cyan
Write-Host "  • Admin: admin@snapfix.com / admin123" -ForegroundColor White
Write-Host "  • Staff: staff@snapfix.com / staff123" -ForegroundColor White
Write-Host "  • Student: student@snapfix.com / student123" -ForegroundColor White
Write-Host ""
Write-Host "📊 View logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop app: docker-compose down" -ForegroundColor Yellow
Write-Host ""

# Return to project root
Set-Location ..

