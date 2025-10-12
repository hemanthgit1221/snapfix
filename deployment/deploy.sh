#!/bin/bash

# SnapFix Deployment Script
# This script deploys the SnapFix application using Docker Compose

set -e  # Exit on any error

echo "🚀 Starting SnapFix Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from example..."
    cp env.example .env
    print_warning "Please update the .env file with your actual configuration values."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p ssl
mkdir -p logs

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images (optional)
read -p "Do you want to remove old Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing old Docker images..."
    docker-compose down --rmi all --remove-orphans
fi

# Build and start containers
print_status "Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U snapfix_user -d snapfix; then
    print_success "PostgreSQL is ready"
else
    print_error "PostgreSQL is not ready"
    exit 1
fi

# Check Backend
if curl -f http://localhost:8080/actuator/health 2>/dev/null; then
    print_success "Backend is ready"
else
    print_warning "Backend health check failed, but continuing..."
fi

# Check Frontend
if curl -f http://localhost:3000 2>/dev/null; then
    print_success "Frontend is ready"
else
    print_warning "Frontend health check failed, but continuing..."
fi

# Check Nginx
if curl -f http://localhost/health 2>/dev/null; then
    print_success "Nginx is ready"
else
    print_warning "Nginx health check failed, but continuing..."
fi

# Display deployment information
echo
print_success "🎉 SnapFix Deployment Complete!"
echo
echo "📋 Service URLs:"
echo "  • Frontend: http://localhost"
echo "  • Backend API: http://localhost:8080/api"
echo "  • Direct Frontend: http://localhost:3000"
echo "  • Health Check: http://localhost/health"
echo
echo "👤 Default Users:"
echo "  • Admin: admin@snapfix.com / admin123"
echo "  • Staff: staff@snapfix.com / staff123"
echo "  • Student: student@snapfix.com / student123"
echo
echo "🔧 Useful Commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart services: docker-compose restart"
echo "  • Update services: docker-compose up --build -d"
echo
print_status "Deployment completed successfully! 🚀"

