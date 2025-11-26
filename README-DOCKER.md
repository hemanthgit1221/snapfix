# SnapFix Docker Setup with Ngrok

This guide will help you run the entire SnapFix application using Docker and expose it for testing via ngrok.

## Prerequisites

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   
2. **Ngrok Account** (free tier is sufficient)
   - Sign up at: https://dashboard.ngrok.com/signup
   - Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken

3. **Git** (to clone the repository if needed)

## Quick Start

### Step 1: Configure Environment

1. Copy the example environment file:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

2. Edit `.env` file and add your ngrok authtoken:
   ```
   NGROK_AUTH_TOKEN=your-ngrok-authtoken-here
   ```

### Step 2: Start the Application

**Windows:**
```powershell
.\start-with-ngrok.ps1
```

**Linux/Mac:**
```bash
chmod +x start-with-ngrok.sh
./start-with-ngrok.sh
```

Or manually:
```bash
docker-compose up -d --build
```

### Step 3: Access Your Services

After starting, you'll have access to:

**Local URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Ngrok Web UI: http://localhost:4040 (to see public URLs)
- DB Dashboard: http://localhost:3001

**Public URLs (via Ngrok):**
- Check http://localhost:4040/inspect to see all public URLs
- Or run: `docker logs snapfix-ngrok`

## Manual Setup

If you prefer to set up manually:

### 1. Configure Ngrok

Edit `ngrok.yml` and replace `YOUR_NGROK_AUTH_TOKEN_HERE` with your ngrok authtoken.

### 2. Update Frontend API URL

After ngrok starts, you'll need to update the frontend to use the public ngrok URL for the backend API.

The script automatically tries to do this, but you can manually:

1. Get your backend ngrok URL from http://localhost:4040/inspect
2. Update `REACT_APP_API_URL` in `.env`
3. Rebuild frontend: `docker-compose up -d --build frontend`

### 3. Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ngrok
```

## Service Details

### Frontend (React)
- **Container**: snapfix-frontend
- **Local Port**: 3000
- **Build**: Multi-stage with Node.js build and Nginx serve

### Backend (Spring Boot)
- **Container**: snapfix-backend
- **Local Port**: 8080
- **Database**: PostgreSQL
- **Health Check**: http://localhost:8080/actuator/health

### Database (PostgreSQL)
- **Container**: snapfix-postgres
- **Local Port**: 5432
- **Credentials**: 
  - User: snapfix_user
  - Password: snapfix_password
  - Database: snapfix

### Ngrok
- **Container**: snapfix-ngrok
- **Web UI**: http://localhost:4040
- **Exposes**: Frontend, Backend, and DB Dashboard

## Common Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠ deletes database data)
docker-compose down -v

# View logs
docker-compose logs -f

# Rebuild and restart specific service
docker-compose up -d --build frontend

# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend bash
docker-compose exec postgres psql -U snapfix_user -d snapfix

# Get ngrok public URLs
curl http://localhost:4040/api/tunnels | jq
```

## Troubleshooting

### Ngrok Not Starting
1. Check if authtoken is set correctly in `ngrok.yml`
2. Verify token at https://dashboard.ngrok.com/get-started/your-authtoken
3. Check logs: `docker logs snapfix-ngrok`

### Frontend Can't Connect to Backend
1. Check if backend is running: `docker logs snapfix-backend`
2. Verify CORS settings in backend
3. Update `REACT_APP_API_URL` in `.env` with the ngrok backend URL
4. Rebuild frontend: `docker-compose up -d --build frontend`

### Database Connection Issues
1. Check if PostgreSQL is healthy: `docker-compose ps`
2. Verify credentials in `docker-compose.yml`
3. Check logs: `docker logs snapfix-postgres`

### Port Already in Use
If ports 3000, 8080, 4040, or 5432 are already in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:80"  # Frontend (use 3001 instead of 3000)
     - "8081:8080"  # Backend
   ```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose up -d --build frontend
docker-compose up -d --build backend

# Rebuild all services
docker-compose up -d --build
```

## Environment Variables

Key environment variables (in `.env`):

- `NGROK_AUTH_TOKEN`: Your ngrok authtoken
- `REACT_APP_API_URL`: Frontend API URL (auto-updated by script)
- `SPRING_MAIL_USERNAME`: Email for notifications
- `SPRING_MAIL_PASSWORD`: Email app password
- `CORS_ALLOWED_ORIGINS`: CORS allowed origins (default: *)

## Production Considerations

⚠️ **This setup is for development/testing only!**

For production:
1. Use proper domain names instead of ngrok
2. Set up SSL certificates
3. Use environment-specific configurations
4. Implement proper secrets management
5. Use production-grade databases
6. Set up monitoring and logging
7. Configure proper CORS origins

## Security Notes

1. **Ngrok Free Tier**: Limited to 1 tunnel. Upgrade for multiple simultaneous tunnels.
2. **CORS**: Currently set to allow all origins (`*`). Restrict in production.
3. **Database**: Default credentials are for development only.
4. **JWT Secret**: Change default JWT secret for production.

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check ngrok status: http://localhost:4040
4. Review the main project documentation

## Next Steps

1. **Test the Application**: Access via ngrok URLs
2. **Share Access**: Share ngrok URLs with testers
3. **Monitor**: Use ngrok web UI to monitor requests
4. **Develop**: Make code changes and rebuild containers
5. **Deploy**: Follow production deployment guide when ready









