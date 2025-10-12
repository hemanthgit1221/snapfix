# SnapFix Deployment Guide

This guide will help you deploy the SnapFix college issue reporting system using Docker.

## 🚀 Quick Start

### Prerequisites

1. **Docker Desktop** - [Download and install Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. **Docker Compose** - Usually included with Docker Desktop
3. **Git** - [Download and install Git](https://git-scm.com/downloads)

### Deployment Steps

#### Option 1: Automated Deployment (Recommended)

**For Windows (PowerShell):**
```powershell
cd deployment
.\deploy.ps1
```

**For Linux/Mac:**
```bash
cd deployment
chmod +x deploy.sh
./deploy.sh
```

#### Option 2: Manual Deployment

1. **Navigate to deployment directory:**
   ```bash
   cd deployment
   ```

2. **Create environment file:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start services:**
   ```bash
   docker-compose up --build -d
   ```

4. **Check service status:**
   ```bash
   docker-compose ps
   ```

## 🌐 Access URLs

After successful deployment, you can access:

- **Main Application**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Direct Frontend**: http://localhost:3000
- **Health Check**: http://localhost/health

## 👤 Default Users

The system comes with pre-configured users:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@snapfix.com | admin123 |
| Staff | staff@snapfix.com | staff123 |
| Student | student@snapfix.com | student123 |

> ⚠️ **Security Note**: Change these default passwords immediately in production!

## 🔧 Configuration

### Environment Variables

Edit the `.env` file to configure:

```env
# Database Configuration
POSTGRES_DB=snapfix
POSTGRES_USER=snapfix_user
POSTGRES_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=86400000

# Email Configuration
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password
```

### Database Configuration

The PostgreSQL database is automatically initialized with:
- Required tables and indexes
- Sample users for testing
- Proper relationships and constraints

## 🛠️ Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Update Services
```bash
docker-compose up --build -d
```

### Remove Everything (including data)
```bash
docker-compose down -v --rmi all
```

## 📊 Service Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Nginx    │────│  Frontend   │    │   Backend   │
│  (Port 80)  │    │  (React)    │    │ (Spring Boot)│
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                   ┌─────────────┐
                   │ PostgreSQL  │
                   │ (Port 5432) │
                   └─────────────┘
```

## 🔒 Security Considerations

### Production Deployment

1. **Change default passwords** immediately
2. **Use strong JWT secrets** (minimum 256 bits)
3. **Enable HTTPS** by configuring SSL certificates
4. **Use environment-specific configurations**
5. **Set up proper firewall rules**
6. **Regular security updates**

### SSL/HTTPS Setup

1. Place your SSL certificates in the `ssl/` directory
2. Update `nginx.conf` to use HTTPS
3. Configure proper redirects from HTTP to HTTPS

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
netstat -tulpn | grep :80
# Kill the process or change ports in docker-compose.yml
```

**Database connection issues:**
```bash
# Check PostgreSQL logs
docker-compose logs postgres
# Verify database is running
docker-compose exec postgres pg_isready
```

**Frontend not loading:**
```bash
# Check frontend logs
docker-compose logs frontend
# Verify build process
docker-compose exec frontend ls -la /usr/share/nginx/html
```

**Backend API not responding:**
```bash
# Check backend logs
docker-compose logs backend
# Test health endpoint
curl http://localhost:8080/actuator/health
```

### Health Checks

All services include health checks:
- **PostgreSQL**: `pg_isready`
- **Backend**: `/actuator/health`
- **Frontend**: HTTP response check
- **Nginx**: `/health` endpoint

### Performance Optimization

1. **Database**: Configure PostgreSQL for production
2. **Caching**: Add Redis for session management
3. **CDN**: Use a CDN for static assets
4. **Load Balancing**: Scale horizontally with multiple instances

## 📈 Monitoring

### Log Monitoring
```bash
# Real-time logs
docker-compose logs -f --tail=100

# Log files location
ls -la logs/
```

### Resource Usage
```bash
# Container resource usage
docker stats

# Disk usage
docker system df
```

## 🚀 Production Deployment

### Cloud Platforms

**AWS:**
- Use ECS or EKS for container orchestration
- RDS for managed PostgreSQL
- CloudFront for CDN
- Route 53 for DNS

**Google Cloud:**
- Use GKE for container orchestration
- Cloud SQL for managed PostgreSQL
- Cloud CDN for content delivery

**Azure:**
- Use AKS for container orchestration
- Azure Database for PostgreSQL
- Azure CDN for content delivery

### Scaling

1. **Horizontal Scaling**: Run multiple container instances
2. **Database Scaling**: Use read replicas for read-heavy workloads
3. **Caching**: Implement Redis for session and data caching
4. **Load Balancing**: Use cloud load balancers

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment configuration
3. Ensure all prerequisites are installed
4. Check Docker Desktop is running
5. Verify ports are not in use

## 🎉 Success!

Once deployed successfully, you'll have a fully functional SnapFix system with:
- ✅ User authentication and authorization
- ✅ Ticket management system
- ✅ Role-based dashboards
- ✅ Reward points system
- ✅ Real-time notifications
- ✅ Responsive web interface
- ✅ RESTful API
- ✅ Database persistence

Happy issue reporting! 🎯

