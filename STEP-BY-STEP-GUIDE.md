# 🎯 Step-by-Step Guide: Docker + Ngrok Setup

Follow these steps **in order** to get your SnapFix app running with public URLs!

---

## 📋 **STEP 1: Start Docker Desktop**

**Before anything else, make sure Docker is running!**

1. **Open Docker Desktop** from your Start Menu
2. **Wait** until Docker Desktop shows "Engine running" (green icon)
3. **Verify** it's working:
   ```powershell
   docker --version
   docker ps
   ```
   You should see Docker version and no errors.

> ⚠️ **IMPORTANT**: All Docker commands will fail if Docker Desktop isn't running!

---

## 🔑 **STEP 2: Get Your Ngrok Token**

You need a free ngrok account to create public URLs.

### 2.1 Sign Up (if you don't have account)
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up with email or GitHub
3. **Free account is enough!**

### 2.2 Get Your Authtoken
1. Log in to: https://dashboard.ngrok.com/
2. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Copy your authtoken** (looks like: `2abc123def456ghi789jkl012mno345pq`)

> 📝 **Save this token** - you'll need it in the next step!

---

## ⚙️ **STEP 3: Configure Ngrok**

Now let's add your ngrok token to the configuration.

### Option A: Edit ngrok.yml (Recommended)
1. Open `ngrok.yml` in your project folder
2. Find this line:
   ```yaml
   authtoken: YOUR_NGROK_AUTH_TOKEN_HERE
   ```
3. Replace `YOUR_NGROK_AUTH_TOKEN_HERE` with your actual token:
   ```yaml
   authtoken: 2abc123def456ghi789jkl012mno345pq
   ```
4. **Save the file**

### Option B: Use .env file
1. Copy the example file:
   ```powershell
   copy env.example.txt .env
   ```
2. Open `.env` file
3. Find:
   ```
   NGROK_AUTH_TOKEN=your-ngrok-authtoken-here
   ```
4. Replace with your token:
   ```
   NGROK_AUTH_TOKEN=2abc123def456ghi789jkl012mno345pq
   ```
5. **Save the file**

---

## 🐳 **STEP 4: Stop Old Containers (If Any)**

If you have old SnapFix containers running, stop them first:

```powershell
# Check what's running
docker ps -a | findstr snapfix

# Stop and remove old containers (if any)
docker-compose down

# Or if using the deployment folder:
cd deployment
docker-compose down
cd ..
```

---

## 🏗️ **STEP 5: Build Docker Images**

**YES - Rebuild the containers!**

This will create fresh images with all your latest code:

```powershell
# Build all services
docker-compose build

# This might take 5-10 minutes the first time
# You'll see:
# - Building backend... ✓
# - Building frontend... ✓
# - etc.
```

**What's happening:**
- ✅ Backend: Compiling Java code with Maven
- ✅ Frontend: Building React app with npm
- ✅ Database: Pulling PostgreSQL image
- ✅ Ngrok: Pulling ngrok image

> 💡 **Tip**: Subsequent builds will be faster (uses cache)

---

## 🚀 **STEP 6: Start All Services**

Now start everything:

```powershell
# Start all services
docker-compose up -d

# The -d flag runs in background (detached mode)
```

**What's starting:**
1. PostgreSQL database (postgres)
2. Spring Boot backend (backend)
3. React frontend (frontend)
4. Ngrok tunnels (ngrok)
5. DB Dashboard (db-dashboard)

**Wait about 30 seconds** for services to start up.

---

## ✅ **STEP 7: Verify Everything is Running**

Check if all services are up:

```powershell
# Check container status
docker-compose ps

# You should see all services with "Up" status:
# snapfix-postgres    Up
# snapfix-backend     Up
# snapfix-frontend    Up
# snapfix-ngrok       Up
# snapfix-db-dashboard Up
```

**Check logs if something fails:**
```powershell
# View all logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ngrok
```

---

## 🌐 **STEP 8: Get Your Public Ngrok URLs**

Now get your public URLs!

### Option 1: Ngrok Web UI (Easiest)
1. Open browser: http://localhost:4040
2. You'll see the Ngrok Inspect page
3. **Copy the public URLs** displayed there

### Option 2: Command Line
```powershell
# Get ngrok tunnel info
docker logs snapfix-ngrok

# Or using API
curl http://localhost:4040/api/tunnels
```

**You'll see URLs like:**
- Frontend: `https://abc123.ngrok-free.app`
- Backend: `https://def456.ngrok-free.app`
- DB Dashboard: `https://ghi789.ngrok-free.app`

---

## 🔗 **STEP 9: Update Frontend API URL (Important!)**

**This step is crucial!** Your frontend needs to know the ngrok backend URL.

### Option 1: Automatic (Recommended)
```powershell
# Run the update script
.\update-frontend-url.ps1
```

This will:
1. ✅ Get ngrok backend URL
2. ✅ Update frontend configuration
3. ✅ Rebuild frontend automatically

### Option 2: Manual
1. Get your backend ngrok URL from http://localhost:4040
2. Create/update `.env` file:
   ```powershell
   copy env.example.txt .env
   ```
3. Edit `.env` and set:
   ```
   REACT_APP_API_URL=https://your-backend-url.ngrok-free.app/api
   ```
4. Rebuild frontend:
   ```powershell
   docker-compose up -d --build frontend
   ```

---

## 🎉 **STEP 10: Test Your Application**

### Test Locally:
1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:8080
3. **Health Check**: http://localhost:8080/actuator/health

### Test via Ngrok:
1. **Frontend**: Use the ngrok frontend URL from http://localhost:4040
2. **Backend**: Use the ngrok backend URL

**Try these:**
- ✅ Login to the app
- ✅ Create a ticket
- ✅ Check if API calls work

---

## 🔧 **Troubleshooting Common Issues**

### ❌ "Docker daemon not running"
**Solution**: Start Docker Desktop and wait for it to fully start

### ❌ "Port already in use"
**Solution**: Stop the service using that port:
```powershell
# Check what's using port 8080
netstat -ano | findstr :8080

# Or stop old containers
docker-compose down
```

### ❌ "Ngrok authentication failed"
**Solution**: 
1. Double-check your token in `ngrok.yml`
2. Make sure there are no extra spaces
3. Get a fresh token from ngrok dashboard

### ❌ Frontend can't connect to backend
**Solution**:
1. Make sure you ran `.\update-frontend-url.ps1`
2. Or manually updated `REACT_APP_API_URL` in `.env`
3. Rebuilt frontend: `docker-compose up -d --build frontend`

### ❌ Services won't start
**Solution**:
```powershell
# Check logs
docker-compose logs

# Restart everything
docker-compose down
docker-compose up -d

# Or rebuild if needed
docker-compose up -d --build
```

---

## 📝 **Quick Reference Commands**

```powershell
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build

# Check status
docker-compose ps

# Restart specific service
docker-compose restart frontend

# View ngrok UI
# Open: http://localhost:4040
```

---

## 🎯 **Summary Checklist**

Before sharing your app, verify:

- [ ] Docker Desktop is running
- [ ] Ngrok token is configured
- [ ] All containers are running (`docker-compose ps`)
- [ ] You have public URLs from http://localhost:4040
- [ ] Frontend API URL is updated
- [ ] Frontend can login successfully
- [ ] Backend API responds on ngrok URL

---

## 🚀 **Ready to Share!**

Once everything is working:
1. ✅ Copy your ngrok frontend URL
2. ✅ Share it with testers
3. ✅ Monitor requests at http://localhost:4040

**Your app is now accessible from anywhere in the world!** 🌍

---

## 📚 **Need More Help?**

- **Full Documentation**: See `README-DOCKER.md`
- **Quick Start**: See `DOCKER-QUICK-START.md`
- **Check Logs**: `docker-compose logs -f`

**You're all set! Happy testing! 🎉**









