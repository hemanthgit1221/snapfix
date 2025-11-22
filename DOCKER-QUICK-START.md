# 🐳 Docker + Ngrok Quick Start Guide

Get SnapFix running with public URLs in 5 minutes!

## ⚡ Quick Setup

### 1. Get Ngrok Token (2 minutes)
1. Sign up at https://dashboard.ngrok.com/signup (free)
2. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken

### 2. Configure (1 minute)

**Windows:**
```powershell
# Create .env file
copy env.example.txt .env

# Edit .env and paste your ngrok token:
# NGROK_AUTH_TOKEN=paste-your-token-here

# Or edit ngrok.yml directly
notepad ngrok.yml
```

**Linux/Mac:**
```bash
# Create .env file
cp env.example.txt .env

# Edit .env
nano .env
# Paste: NGROK_AUTH_TOKEN=your-token-here

# Or edit ngrok.yml
nano ngrok.yml
```

### 3. Start Everything (2 minutes)

**Windows:**
```powershell
.\start-with-ngrok.ps1
```

**Linux/Mac:**
```bash
chmod +x start-with-ngrok.sh
./start-with-ngrok.sh
```

**Or manually:**
```bash
docker-compose up -d --build
```

## 🌐 Access Your App

### Local URLs:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Ngrok Dashboard**: http://localhost:4040

### Public URLs:
Visit http://localhost:4040/inspect to see your ngrok public URLs!

Or check logs:
```bash
docker logs snapfix-ngrok
```

## 📝 Example Output

After running, you should see something like:

```
=== Public URLs via Ngrok ===
Frontend:     https://abc123.ngrok.io
Backend API:  https://def456.ngrok.io
DB Dashboard: https://ghi789.ngrok.io

=== Local URLs ===
Frontend:     http://localhost:3000
Backend API:  http://localhost:8080
Ngrok UI:     http://localhost:4040
```

## 🔧 Update Frontend API URL

If frontend needs to use ngrok backend URL:

**Windows:**
```powershell
.\update-frontend-url.ps1
```

Or manually:
1. Get backend ngrok URL from http://localhost:4040/inspect
2. Update `REACT_APP_API_URL` in `.env`
3. Rebuild: `docker-compose up -d --build frontend`

## 🛠️ Common Commands

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ngrok

# Stop everything
docker-compose down

# Restart specific service
docker-compose restart frontend

# Check status
docker-compose ps
```

## ❓ Troubleshooting

**Ngrok not working?**
- Check token in `ngrok.yml` or `.env`
- Check logs: `docker logs snapfix-ngrok`
- Visit http://localhost:4040

**Frontend can't connect?**
- Run: `.\update-frontend-url.ps1`
- Or manually update API URL and rebuild

**Port already in use?**
- Stop other services using ports 3000, 8080, 4040
- Or modify ports in `docker-compose.yml`

**Services not starting?**
- Check Docker Desktop is running
- Check logs: `docker-compose logs`
- Try: `docker-compose up -d --build`

## 📚 More Details

See `README-DOCKER.md` for complete documentation.

## 🎉 You're Ready!

Your SnapFix app is now running and accessible via ngrok!
Share the public URLs with testers or use them for integrations.








