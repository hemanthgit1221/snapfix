# SnapFix Oracle Cloud Deployment Script
# This script automates the deployment process to Oracle Cloud Infrastructure

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$DomainName = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPush = $false
)

Write-Host "🚀 Starting SnapFix deployment to Oracle Cloud..." -ForegroundColor Green

# Set error action preference
$ErrorActionPreference = "Stop"

# Configuration
$DOCKER_REGISTRY = $DockerHubUsername
$ENV_FILE = "env.prod"
$COMPOSE_FILE = "docker-compose.prod.yml"

# Colors for output
$SuccessColor = "Green"
$WarningColor = "Yellow"
$ErrorColor = "Red"
$InfoColor = "Cyan"

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $SuccessColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $WarningColor
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $ErrorColor
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $InfoColor
}

# Step 1: Validate prerequisites
Write-Info "Checking prerequisites..."

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Success "Docker Compose is available"
} catch {
    Write-Error "Docker Compose is not available. Please install Docker Compose."
    exit 1
}

# Check if environment file exists
if (-not (Test-Path $ENV_FILE)) {
    Write-Error "Environment file $ENV_FILE not found. Please create it from env.example"
    exit 1
}

Write-Success "Prerequisites check completed"

# Step 2: Update environment file
Write-Info "Updating environment configuration..."

# Read current env file
$envContent = Get-Content $ENV_FILE -Raw

# Update Docker registry
$envContent = $envContent -replace "DOCKER_REGISTRY=.*", "DOCKER_REGISTRY=$DOCKER_REGISTRY"

# Update domain if provided
if ($DomainName -ne "") {
    $envContent = $envContent -replace "REACT_APP_API_URL=.*", "REACT_APP_API_URL=https://$DomainName/api"
    $envContent = $envContent -replace "CORS_ORIGINS=.*", "CORS_ORIGINS=https://$DomainName,https://www.$DomainName"
}

# Write updated content
Set-Content -Path $ENV_FILE -Value $envContent -NoNewline
Write-Success "Environment configuration updated"

# Step 3: Build Docker images
if (-not $SkipBuild) {
    Write-Info "Building Docker images..."
    
    try {
        # Build backend
        Write-Info "Building backend image..."
        docker build -t snapfix-backend:latest ../backend
        docker tag snapfix-backend:latest $DOCKER_REGISTRY/snapfix-backend:latest
        Write-Success "Backend image built successfully"
        
        # Build frontend
        Write-Info "Building frontend image..."
        docker build -t snapfix-frontend:latest ../frontend
        docker tag snapfix-frontend:latest $DOCKER_REGISTRY/snapfix-frontend:latest
        Write-Success "Frontend image built successfully"
        
        # Build database dashboard
        Write-Info "Building database dashboard image..."
        docker build -t snapfix-db-dashboard:latest ../db-dashboard
        docker tag snapfix-db-dashboard:latest $DOCKER_REGISTRY/snapfix-db-dashboard:latest
        Write-Success "Database dashboard image built successfully"
        
        # Build nginx
        Write-Info "Building nginx image..."
        docker build -t snapfix-nginx:latest -f Dockerfile.nginx .
        docker tag snapfix-nginx:latest $DOCKER_REGISTRY/snapfix-nginx:latest
        Write-Success "Nginx image built successfully"
        
    } catch {
        Write-Error "Failed to build Docker images: $_"
        exit 1
    }
} else {
    Write-Warning "Skipping Docker image build"
}

# Step 4: Push images to Docker Hub
if (-not $SkipPush) {
    Write-Info "Pushing images to Docker Hub..."
    
    try {
        # Login to Docker Hub
        Write-Info "Please login to Docker Hub..."
        docker login
        
        # Push images
        Write-Info "Pushing backend image..."
        docker push $DOCKER_REGISTRY/snapfix-backend:latest
        
        Write-Info "Pushing frontend image..."
        docker push $DOCKER_REGISTRY/snapfix-frontend:latest
        
        Write-Info "Pushing database dashboard image..."
        docker push $DOCKER_REGISTRY/snapfix-db-dashboard:latest
        
        Write-Info "Pushing nginx image..."
        docker push $DOCKER_REGISTRY/snapfix-nginx:latest
        
        Write-Success "All images pushed to Docker Hub successfully"
        
    } catch {
        Write-Error "Failed to push images to Docker Hub: $_"
        exit 1
    }
} else {
    Write-Warning "Skipping Docker image push"
}

# Step 5: Create deployment package
Write-Info "Creating deployment package..."

$deploymentDir = "oracle-cloud-deployment"
if (Test-Path $deploymentDir) {
    Remove-Item -Recurse -Force $deploymentDir
}

New-Item -ItemType Directory -Path $deploymentDir | Out-Null

# Copy necessary files
Copy-Item $COMPOSE_FILE "$deploymentDir/docker-compose.yml"
Copy-Item $ENV_FILE "$deploymentDir/.env"
Copy-Item "nginx.prod.conf" "$deploymentDir/nginx.conf"
Copy-Item "init.sql" "$deploymentDir/"
Copy-Item "deploy-oci.sh" "$deploymentDir/"

# Create SSL directory
New-Item -ItemType Directory -Path "$deploymentDir/ssl" | Out-Null

Write-Success "Deployment package created in $deploymentDir"

# Step 6: Generate deployment instructions
$instructions = @"
# SnapFix Oracle Cloud Deployment Instructions

## Prerequisites
1. Oracle Cloud Infrastructure account
2. OCI CLI installed and configured
3. SSH key pair for accessing the instance
4. Domain name (optional)

## Deployment Steps

### 1. Create OCI Resources
- Create a compartment for SnapFix
- Create a VCN with Internet Gateway
- Create a public subnet
- Configure security lists (ports 22, 80, 443)
- Create a compute instance (VM.Standard.E2.1.Micro for free tier)

### 2. Upload Deployment Package
Upload the contents of the '$deploymentDir' folder to your OCI instance.

### 3. Deploy on OCI Instance
SSH into your instance and run:
```bash
# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker opc
newgrp docker

# Deploy application
cd /path/to/deployment
chmod +x deploy-oci.sh
./deploy-oci.sh
```

### 4. Configure SSL (Optional)
If you have a domain name:
```bash
# Install Certbot
sudo yum install -y certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to nginx ssl directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# Restart nginx
docker-compose restart nginx
```

### 5. Access Your Application
- Main Application: http://your-instance-ip or https://your-domain.com
- Backend API: http://your-instance-ip/api or https://your-domain.com/api
- Database Dashboard: http://your-instance-ip/dashboard or https://your-domain.com/dashboard

## Environment Variables
Make sure to update the following in your .env file:
- POSTGRES_PASSWORD: Set a strong password
- JWT_SECRET: Set a secure JWT secret (minimum 256 bits)
- SPRING_MAIL_USERNAME: Your email for notifications
- SPRING_MAIL_PASSWORD: Your email app password
- REACT_APP_API_URL: Your domain URL
- CORS_ORIGINS: Your domain URLs

## Security Notes
- Change all default passwords
- Use strong JWT secrets
- Enable SSL/HTTPS in production
- Regularly update your system and Docker images
- Monitor your application logs

## Monitoring
```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# Monitor resources
docker stats
```

## Backup
```bash
# Database backup
docker exec snapfix-postgres pg_dump -U snapfix_user snapfix > backup.sql

# Upload to OCI Object Storage
oci os object put -bn your-bucket-name --file backup.sql --name snapfix-backup-$(date +%Y%m%d).sql
```

Happy deploying! 🚀
"@

Set-Content -Path "$deploymentDir/README.md" -Value $instructions

Write-Success "Deployment package ready!"
Write-Info "Next steps:"
Write-Info "1. Upload the '$deploymentDir' folder to your OCI instance"
Write-Info "2. Follow the instructions in README.md"
Write-Info "3. Update environment variables in .env file"
Write-Info "4. Run the deployment script on your OCI instance"

Write-Host "🎉 SnapFix deployment preparation completed successfully!" -ForegroundColor Green
