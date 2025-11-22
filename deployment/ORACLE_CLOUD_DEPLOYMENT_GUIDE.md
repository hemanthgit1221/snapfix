# SnapFix Oracle Cloud Deployment Guide

This comprehensive guide covers multiple deployment options for SnapFix on Oracle Cloud Infrastructure (OCI).

## 🚀 Deployment Options Overview

| Option | Complexity | Cost | Scalability | Best For |
|--------|------------|------|-------------|----------|
| **Container Instances** | Low | Free Tier | Limited | Small to medium deployments |
| **Kubernetes (OKE)** | Medium | Pay-as-you-go | High | Production deployments |
| **Always Free Resources** | Low | $0 | Limited | Development and testing |

## 📋 Prerequisites

### Required
- Oracle Cloud Infrastructure account
- Docker Hub account
- Domain name (optional but recommended)

### Optional
- OCI CLI installed
- kubectl (for Kubernetes deployment)
- SSL certificates

## 🎯 Option 1: Container Instances (Recommended for Simplicity)

### Step 1: Prepare Your Application

1. **Build and push Docker images:**
   ```bash
   # Run the automated deployment script
   cd deployment
   .\deploy-oracle-cloud.ps1 -DockerHubUsername "your-dockerhub-username"
   ```

2. **Manual image building:**
   ```bash
   # Build images
   docker build -t your-username/snapfix-backend:latest ../backend
   docker build -t your-username/snapfix-frontend:latest ../frontend
   docker build -t your-username/snapfix-db-dashboard:latest ../db-dashboard
   docker build -t your-username/snapfix-nginx:latest -f Dockerfile.nginx .
   
   # Push to Docker Hub
   docker push your-username/snapfix-backend:latest
   docker push your-username/snapfix-frontend:latest
   docker push your-username/snapfix-db-dashboard:latest
   docker push your-username/snapfix-nginx:latest
   ```

### Step 2: Create OCI Resources

1. **Create Compartment:**
   - Go to Identity & Security → Compartments
   - Create "SnapFix-Production"

2. **Create VCN:**
   - Go to Networking → Virtual Cloud Networks
   - Create VCN with Internet Gateway
   - Create public subnet
   - Configure security lists (ports 22, 80, 443)

3. **Create Container Instance:**
   - Go to Developer Services → Container Instances
   - Choose VM.Standard.E2.1.Micro (free tier)
   - Select your VCN and subnet
   - Add SSH key

### Step 3: Deploy Application

1. **Upload deployment package to OCI instance**
2. **SSH into instance:**
   ```bash
   ssh -i your-key.pem opc@your-instance-ip
   ```

3. **Run deployment script:**
   ```bash
   chmod +x deploy-oci.sh
   ./deploy-oci.sh
   ```

### Step 4: Configure Domain (Optional)

1. **Point domain to OCI instance IP**
2. **Update environment variables:**
   ```bash
   nano .env
   # Update REACT_APP_API_URL and CORS_ORIGINS
   ```

3. **Set up SSL:**
   ```bash
   sudo yum install -y certbot
   sudo certbot certonly --standalone -d your-domain.com
   # Copy certificates to ssl/ directory
   docker-compose restart nginx
   ```

## 🎯 Option 2: Kubernetes (OKE) - Production Scale

### Step 1: Create OKE Cluster

1. **Go to Developer Services → Kubernetes Clusters (OKE)**
2. **Create cluster with:**
   - 1-3 worker nodes
   - VM.Standard.E2.1.Micro (free tier)
   - Your VCN and subnets

### Step 2: Configure kubectl

```bash
# Get kubeconfig
oci ce cluster create-kubeconfig --cluster-id <cluster-id> --file ~/.kube/config

# Test connection
kubectl get nodes
```

### Step 3: Deploy to Kubernetes

```bash
cd deployment/k8s

# Update image names in all YAML files
# Replace "your-dockerhub-username" with your actual username

# Deploy application
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f postgres.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
kubectl apply -f db-dashboard.yaml
kubectl apply -f nginx.yaml
kubectl apply -f ingress.yaml
```

### Step 4: Configure Ingress

1. **Install NGINX Ingress Controller:**
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   ```

2. **Update ingress.yaml with your domain**
3. **Set up SSL certificates**

## 🎯 Option 3: Always Free Resources

### Architecture
- **Instance 1**: Application (Frontend + Backend + Nginx)
- **Instance 2**: Database (PostgreSQL) or use Autonomous Database
- **Object Storage**: File uploads and static assets

### Free Tier Limits
- 2 VM.Standard.E2.1.Micro instances (1/8 OCPU, 1GB RAM each)
- 1 Autonomous Database (20GB storage)
- 10GB Object Storage
- Load Balancer (10Mbps)

### Deployment Steps

1. **Create two compute instances**
2. **Deploy application on first instance**
3. **Deploy database on second instance or use Autonomous Database**
4. **Configure Object Storage for file uploads**

## 🔧 Configuration

### Environment Variables

Update `env.prod` with your values:

```env
# Docker Registry
DOCKER_REGISTRY=your-dockerhub-username

# Database
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_256_bit_jwt_secret

# Email
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password

# Frontend
REACT_APP_API_URL=https://your-domain.com/api
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### SSL Configuration

1. **Generate SSL certificates:**
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. **Copy certificates:**
   ```bash
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
   ```

3. **Restart nginx:**
   ```bash
   docker-compose restart nginx
   ```

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Container status
docker-compose ps

# Application logs
docker-compose logs -f

# Resource usage
docker stats

# Health endpoints
curl http://your-domain.com/health
curl http://your-domain.com/api/actuator/health
```

### Backup Strategy

```bash
# Database backup
docker exec snapfix-postgres pg_dump -U snapfix_user snapfix > backup.sql

# Upload to Object Storage
oci os object put -bn your-bucket --file backup.sql --name snapfix-backup-$(date +%Y%m%d).sql
```

### Updates

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d

# Or restart specific service
docker-compose restart backend
```

## 🔒 Security Best Practices

### Production Security

1. **Change default passwords**
2. **Use strong JWT secrets (minimum 256 bits)**
3. **Enable HTTPS/SSL**
4. **Configure firewall rules**
5. **Regular security updates**
6. **Monitor logs for suspicious activity**

### Firewall Configuration

```bash
# Allow only necessary ports
sudo firewall-cmd --permanent --add-port=22/tcp   # SSH
sudo firewall-cmd --permanent --add-port=80/tcp   # HTTP
sudo firewall-cmd --permanent --add-port=443/tcp  # HTTPS
sudo firewall-cmd --reload
```

## 💰 Cost Estimation

### Always Free Tier
- **Compute**: 2 VM.Standard.E2.1.Micro instances (FREE)
- **Storage**: 10GB Object Storage (FREE)
- **Database**: 20GB Autonomous Database (FREE)
- **Load Balancer**: 10Mbps (FREE)
- **Total**: $0/month

### Pay-as-you-go
- **Compute**: ~$0.01/hour per instance
- **Storage**: ~$0.0255/GB/month
- **Database**: ~$0.10/hour
- **Load Balancer**: ~$0.025/hour
- **Total**: ~$50-100/month for small production

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo kill -9 <PID>
   ```

2. **Database connection failed:**
   ```bash
   docker-compose logs postgres
   docker-compose exec postgres pg_isready
   ```

3. **Frontend not loading:**
   ```bash
   docker-compose logs frontend
   curl http://localhost:3000
   ```

4. **Backend API not responding:**
   ```bash
   docker-compose logs backend
   curl http://localhost:8080/actuator/health
   ```

### Debug Commands

```bash
# Check container logs
docker-compose logs -f [service-name]

# Access container shell
docker-compose exec [service-name] /bin/bash

# Check container status
docker-compose ps

# View resource usage
docker stats

# Check network connectivity
docker-compose exec backend ping postgres
```

## 📞 Support

### Getting Help

1. **Check logs first:**
   ```bash
   docker-compose logs -f
   ```

2. **Verify configuration:**
   ```bash
   docker-compose config
   ```

3. **Test connectivity:**
   ```bash
   curl http://localhost/health
   curl http://localhost/api/actuator/health
   ```

### Useful Resources

- [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 🎉 Success!

Once deployed successfully, you'll have:

- ✅ **User authentication and authorization**
- ✅ **Ticket management system**
- ✅ **Role-based dashboards**
- ✅ **Reward points system**
- ✅ **Real-time notifications**
- ✅ **Responsive web interface**
- ✅ **RESTful API**
- ✅ **Database persistence**
- ✅ **Production-ready deployment**

Your SnapFix application is now running on Oracle Cloud Infrastructure! 🚀

## 📝 Next Steps

1. **Test all functionality** on the deployed instance
2. **Set up monitoring** and alerting
3. **Configure automated backups**
4. **Set up CI/CD pipeline** for future updates
5. **Implement proper logging** and error tracking
6. **Configure domain and SSL** for production use
7. **Set up monitoring dashboards**
8. **Implement security scanning**
9. **Create disaster recovery plan**
10. **Document operational procedures**

Happy issue reporting! 🎯
