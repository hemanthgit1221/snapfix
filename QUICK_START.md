# 🚀 SnapFix Quick Start Guide

## ✅ Your Application is LIVE!

Your SnapFix college issue reporting system is now running successfully!

### 🌐 Access URLs

| Service | URL | Status |
|---------|-----|--------|
| **Main Application** | http://localhost:3000 | ✅ **RUNNING** |
| **Backend API** | http://localhost:8080 | ✅ **RUNNING** |
| **Database** | localhost:5432 | ✅ **RUNNING** |

## 🎯 How to Use SnapFix (3 Simple Steps)

### Step 1: Open the Application
1. **Open your web browser** (Chrome, Firefox, Edge, etc.)
2. **Go to**: http://localhost:3000
3. **Wait for the page to load** (should take 2-3 seconds)

### Step 2: Login
Choose any of these test accounts:

| Role | Email | Password | What You'll See |
|------|-------|----------|-----------------|
| **👨‍🎓 Student** | student@snapfix.com | student123 | Issue reporting dashboard |
| **👨‍💼 Staff** | staff@snapfix.com | staff123 | Ticket management dashboard |
| **👑 Admin** | admin@snapfix.com | admin123 | Full system administration |

### Step 3: Start Using
- **Students**: Click "Create New Ticket" to report an issue
- **Staff**: View and update assigned tickets
- **Admins**: Manage all tickets and users

## 🎮 What You Can Do

### 📝 Report Issues (Student)
1. Click "Create New Ticket"
2. Fill in room number, category, description
3. Upload a photo of the issue
4. Submit and track progress

### 🔧 Manage Tickets (Staff)
1. View assigned tickets
2. Update status (In Progress → Resolved)
3. Add comments and notes
4. Upload progress photos

### 👑 Admin Controls
1. View all tickets in the system
2. Assign tickets to staff
3. Manage users and roles
4. View analytics and reports

## 🏆 Reward System
- **Earn points** when your tickets are resolved
- **Track progress** on your dashboard
- **Redeem points** for vouchers and rewards

## 🎨 Features You'll Love
- ✅ **Modern UI**: Clean, professional design
- ✅ **Mobile-friendly**: Works on phones and tablets
- ✅ **Real-time updates**: See changes instantly
- ✅ **Photo uploads**: Attach images to tickets
- ✅ **Status tracking**: Know exactly where your ticket stands
- ✅ **Role-based access**: Different views for different users

## 🚨 Need Help?

### If the page doesn't load:
1. **Check the URL**: Make sure it's http://localhost:3000
2. **Wait a moment**: Sometimes it takes a few seconds to load
3. **Refresh the page**: Press F5 or Ctrl+R
4. **Check console**: Press F12 to see any error messages

### If login fails:
1. **Check credentials**: Use the exact emails and passwords above
2. **Try different browser**: Sometimes browser cache causes issues
3. **Clear browser cache**: Press Ctrl+Shift+Delete

## 🛠️ Management Commands

### View Status
```bash
# Check if services are running
docker-compose -f deployment/docker-compose-simple.yml ps
```

### Restart if Needed
```bash
# Restart all services
cd deployment
docker-compose -f docker-compose-simple.yml restart
```

### View Logs
```bash
# See what's happening
docker-compose -f deployment/docker-compose-simple.yml logs -f
```

## 🎉 You're All Set!

**Your SnapFix application is ready to use!**

1. ✅ **Backend API**: Running on port 8080
2. ✅ **Frontend UI**: Running on port 3000
3. ✅ **Database**: PostgreSQL with sample data
4. ✅ **Test Users**: Ready to login and explore

**Start exploring now by going to http://localhost:3000!**

---

*Happy issue reporting! 🎯*
