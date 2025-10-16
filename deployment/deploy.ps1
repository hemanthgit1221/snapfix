# SnapFix Deployment Script for Windows PowerShell
# This script deploys the SnapFix application using Docker Compose

param(
    [switch]$RemoveImages,
    [switch]$SkipHealthCheck
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting SnapFix Deployment..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Success "Docker is installed: $dockerVersion"
} catch {
    Write-Error "Docker is not installed. Please install Docker Desktop first."
    exit 1
}

# Check if Docker Compose is installed
try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose is installed: $composeVersion"
} catch {
    Write-Error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from example..."
    Copy-Item "env.example" ".env"
    Write-Warning "Please update the .env file with your actual configuration values."
}

# Create necessary directories
Write-Status "Creating necessary directories..."
New-Item -ItemType Directory -Force -Path "ssl" | Out-Null
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Stop any existing containers
Write-Status "Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images if requested
if ($RemoveImages) {
    Write-Status "Removing old Docker images..."
    docker-compose down --rmi all --remove-orphans
}

# Build and start containers
Write-Status "Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
Write-Status "Waiting for services to be ready..."
Start-Sleep -Seconds 30

if (-not $SkipHealthCheck) {
    # Check if services are running
    Write-Status "Checking service health..."

    # Check PostgreSQL
    try {
        $pgCheck = docker-compose exec -T postgres pg_isready -U snapfix_user -d snapfix
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is ready"
        } else {
            Write-Warning "PostgreSQL is not ready"
        }
    } catch {
        Write-Warning "PostgreSQL health check failed"
    }

    # Check Backend
    try {
        $backendCheck = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing -TimeoutSec 5
        if ($backendCheck.StatusCode -eq 200) {
            Write-Success "Backend is ready"
        } else {
            Write-Warning "Backend health check failed"
        }
    } catch {
        Write-Warning "Backend health check failed, but continuing..."
    }

    # Check Frontend
    try {
        $frontendCheck = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        if ($frontendCheck.StatusCode -eq 200) {
            Write-Success "Frontend is ready"
        } else {
            Write-Warning "Frontend health check failed"
        }
    } catch {
        Write-Warning "Frontend health check failed, but continuing..."
    }

    # Check Nginx
    try {
        $nginxCheck = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 5
        if ($nginxCheck.StatusCode -eq 200) {
            Write-Success "Nginx is ready"
        } else {
            Write-Warning "Nginx health check failed"
        }
    } catch {
        Write-Warning "Nginx health check failed, but continuing..."
    }
}

# Display deployment information
Write-Host ""
Write-Success "SnapFix Deployment Complete!"
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  • Frontend: http://localhost" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:8080/api" -ForegroundColor White
Write-Host "  • Direct Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  • Health Check: http://localhost/health" -ForegroundColor White
Write-Host ""
Write-Host "Default Users:" -ForegroundColor Cyan
Write-Host "  • Admin: admin@snapfixindia.space / admin123" -ForegroundColor White
Write-Host "  • Staff: staff@snapfixindia.space / staff123" -ForegroundColor White
Write-Host "  • Student: student@snapfixindia.space / student123" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  • View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  • Stop services: docker-compose down" -ForegroundColor White
Write-Host "  • Restart services: docker-compose restart" -ForegroundColor White
Write-Host "  • Update services: docker-compose up --build -d" -ForegroundColor White
Write-Host ""
Write-Status "Deployment completed successfully! 🚀"

