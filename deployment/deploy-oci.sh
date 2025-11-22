#!/bin/bash

# SnapFix Oracle Cloud Infrastructure Deployment Script
# This script runs on the OCI instance to deploy the application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
NGINX_CONF="nginx.conf"

echo -e "${BLUE}🚀 Starting SnapFix deployment on Oracle Cloud...${NC}"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Check prerequisites
print_info "Checking prerequisites..."

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user with sudo privileges."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_info "Installing Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker $USER
    print_success "Docker installed successfully"
else
    print_success "Docker is already installed"
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_info "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose is already available"
fi

# Add docker-compose to PATH if not already there
if ! command -v docker-compose &> /dev/null; then
    export PATH="/usr/local/bin:$PATH"
fi

# Step 2: Validate files
print_info "Validating deployment files..."

if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file not found: $ENV_FILE"
    print_info "Please create .env file from env.prod template"
    exit 1
fi

if [ ! -f "$NGINX_CONF" ]; then
    print_error "Nginx configuration file not found: $NGINX_CONF"
    exit 1
fi

print_success "All required files found"

# Step 3: Create necessary directories
print_info "Creating necessary directories..."

mkdir -p ssl
mkdir -p logs
mkdir -p uploads

print_success "Directories created"

# Step 4: Set up SSL certificates (if domain is configured)
print_info "Checking SSL configuration..."

if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    print_success "SSL certificates found"
else
    print_warning "SSL certificates not found. Application will run on HTTP only."
    print_info "To enable HTTPS:"
    print_info "1. Install Certbot: sudo yum install -y certbot"
    print_info "2. Generate certificate: sudo certbot certonly --standalone -d your-domain.com"
    print_info "3. Copy certificates to ssl/ directory"
    print_info "4. Restart the application"
fi

# Step 5: Configure firewall
print_info "Configuring firewall..."

# Check if firewalld is running
if systemctl is-active --quiet firewalld; then
    print_info "Configuring firewalld..."
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --permanent --add-port=22/tcp
    sudo firewall-cmd --reload
    print_success "Firewall configured"
else
    print_warning "Firewalld not running. Please ensure ports 80, 443, and 22 are open in your security groups."
fi

# Step 6: Pull Docker images
print_info "Pulling Docker images..."

# Read Docker registry from .env file
DOCKER_REGISTRY=$(grep "DOCKER_REGISTRY=" .env | cut -d '=' -f2)

if [ -z "$DOCKER_REGISTRY" ]; then
    print_error "DOCKER_REGISTRY not found in .env file"
    exit 1
fi

print_info "Pulling images from registry: $DOCKER_REGISTRY"

# Pull images
docker pull $DOCKER_REGISTRY/snapfix-backend:latest
docker pull $DOCKER_REGISTRY/snapfix-frontend:latest
docker pull $DOCKER_REGISTRY/snapfix-db-dashboard:latest
docker pull $DOCKER_REGISTRY/snapfix-nginx:latest
docker pull postgres:15

print_success "All images pulled successfully"

# Step 7: Deploy application
print_info "Deploying application..."

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Start the application
docker-compose up -d

print_success "Application deployed successfully"

# Step 8: Wait for services to be ready
print_info "Waiting for services to start..."

# Wait for database
print_info "Waiting for database..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose exec -T postgres pg_isready -U snapfix_user -d snapfix 2>/dev/null; then
        print_success "Database is ready"
        break
    fi
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
    print_error "Database failed to start within 60 seconds"
    exit 1
fi

# Wait for backend
print_info "Waiting for backend..."
timeout=60
while [ $timeout -gt 0 ]; do
    if curl -f http://localhost:8080/actuator/health 2>/dev/null; then
        print_success "Backend is ready"
        break
    fi
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
    print_warning "Backend may not be fully ready yet"
fi

# Wait for frontend
print_info "Waiting for frontend..."
timeout=60
while [ $timeout -gt 0 ]; do
    if curl -f http://localhost:3000 2>/dev/null; then
        print_success "Frontend is ready"
        break
    fi
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
    print_warning "Frontend may not be fully ready yet"
fi

# Step 9: Display status
print_info "Checking application status..."

echo ""
echo "📊 Application Status:"
echo "======================"
docker-compose ps

echo ""
echo "🌐 Access URLs:"
echo "==============="
echo "Main Application: http://$(curl -s ifconfig.me) or http://localhost"
echo "Backend API: http://$(curl -s ifconfig.me)/api or http://localhost/api"
echo "Database Dashboard: http://$(curl -s ifconfig.me)/dashboard or http://localhost/dashboard"
echo "Health Check: http://$(curl -s ifconfig.me)/health or http://localhost/health"

echo ""
echo "📝 Useful Commands:"
echo "==================="
echo "View logs: docker-compose logs -f"
echo "Stop application: docker-compose down"
echo "Restart application: docker-compose restart"
echo "Update application: docker-compose pull && docker-compose up -d"

echo ""
echo "🔧 Management:"
echo "=============="
echo "Check container status: docker-compose ps"
echo "View specific service logs: docker-compose logs -f [service-name]"
echo "Access database: docker-compose exec postgres psql -U snapfix_user -d snapfix"
echo "Backup database: docker-compose exec postgres pg_dump -U snapfix_user snapfix > backup.sql"

# Step 10: Set up log rotation
print_info "Setting up log rotation..."

# Create logrotate configuration
sudo tee /etc/logrotate.d/snapfix > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
EOF

print_success "Log rotation configured"

# Step 11: Set up monitoring script
print_info "Setting up monitoring..."

# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
# SnapFix Monitoring Script

echo "=== SnapFix System Status ==="
echo "Date: $(date)"
echo ""

echo "=== Container Status ==="
docker-compose ps

echo ""
echo "=== Resource Usage ==="
docker stats --no-stream

echo ""
echo "=== Disk Usage ==="
df -h

echo ""
echo "=== Memory Usage ==="
free -h

echo ""
echo "=== Recent Logs ==="
docker-compose logs --tail=10
EOF

chmod +x monitor.sh
print_success "Monitoring script created: ./monitor.sh"

# Final success message
echo ""
print_success "🎉 SnapFix deployment completed successfully!"
print_info "Your application is now running on Oracle Cloud Infrastructure"
print_info "Make sure to update your environment variables in .env file for production use"
print_info "Consider setting up SSL certificates for HTTPS access"

echo ""
print_warning "Important Security Notes:"
print_warning "1. Change all default passwords in .env file"
print_warning "2. Use strong JWT secrets (minimum 256 bits)"
print_warning "3. Enable SSL/HTTPS for production use"
print_warning "4. Regularly update your system and Docker images"
print_warning "5. Monitor your application logs regularly"

echo ""
print_info "For support, check the logs: docker-compose logs -f"
