# 🎯 SnapFix User Guide

Welcome to SnapFix - Your College Issue Reporting & Maintenance System!

## 🚀 How to Access the Application

### Option 1: Web Interface (Recommended)
1. **Open your web browser**
2. **Go to**: http://localhost:3000
3. **The React frontend will load automatically**

### Option 2: Direct API Access
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/actuator/health

## 👤 Login Credentials

Use these test accounts to explore different user roles:

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| **Admin** | admin@snapfix.com | admin123 | Manage all tickets, users, analytics |
| **Staff** | staff@snapfix.com | staff123 | View assigned tickets, update status |
| **Student** | student@snapfix.com | student123 | Report issues, track tickets, earn points |

## 🎮 How to Use SnapFix

### 📱 For Students/Faculty

#### 1. **Login & Dashboard**
- Login with student credentials
- View your ticket statistics and reward points
- See recent activity and quick actions

#### 2. **Report a New Issue**
- Click "Create New Ticket" button
- Fill out the form:
  - **Room Number**: Enter room (e.g., "A101")
  - **Floor**: Select floor level
  - **Building**: Choose building name
  - **Category**: Select issue type:
    - 🔧 Plumbing
    - ⚡ Electrical
    - 🧹 Housekeeping
    - ❄️ AC/Water
    - 📝 Others
  - **Description**: Describe the issue in detail
  - **Priority**: Choose urgency level
  - **Photo**: Upload a picture of the issue
- Click "Submit Ticket"

#### 3. **Track Your Tickets**
- View all your submitted tickets
- Check status: Pending → In Progress → Resolved → Closed
- See assigned staff member
- Read comments and updates

#### 4. **Earn Reward Points**
- Get points when your tickets are resolved
- View points progress and history
- Redeem points for vouchers (when available)

### 👨‍💼 For Staff Members

#### 1. **Staff Dashboard**
- Login with staff credentials
- View assigned tickets
- See workload statistics

#### 2. **Manage Tickets**
- Click on assigned tickets
- Update ticket status:
  - **Pending**: Just received
  - **In Progress**: Working on it
  - **Resolved**: Issue fixed
  - **Closed**: Ticket completed
- Add comments and notes
- Upload progress photos

#### 3. **View Ticket Details**
- See full ticket information
- Access uploaded photos
- Read user descriptions
- Check location details

### 👑 For Administrators

#### 1. **Admin Dashboard**
- Login with admin credentials
- View system-wide statistics
- Monitor all tickets and users

#### 2. **Ticket Management**
- View all tickets in the system
- Assign tickets to staff members
- Reassign tickets if needed
- Modify ticket details
- Close resolved tickets

#### 3. **User Management**
- View all users (students, staff, admins)
- Manage user roles and permissions
- Reset passwords if needed
- View user activity

#### 4. **Analytics & Reports**
- View ticket trends and statistics
- Check resolution times
- Monitor staff performance
- Generate reports

## 🔄 Ticket Workflow

```
📝 Student Reports Issue
    ↓
⏳ Status: PENDING
    ↓
👨‍💼 Admin Assigns to Staff
    ↓
🔄 Status: IN_PROGRESS
    ↓
✅ Staff Resolves Issue
    ↓
🎉 Status: RESOLVED
    ↓
📊 Student Earns Points
    ↓
🔒 Status: CLOSED
```

## 🏆 Reward System

### How Points Work
- **+10 points**: Ticket resolved within 24 hours
- **+5 points**: Ticket resolved within 3 days
- **+2 points**: Ticket resolved within a week

### Point Redemption
- **100 points**: Coffee voucher
- **250 points**: Meal voucher
- **500 points**: Book voucher
- **1000 points**: Gift card

## 📱 Mobile-Friendly Features

SnapFix is fully responsive and works great on:
- 📱 Smartphones
- 📟 Tablets
- 💻 Laptops
- 🖥️ Desktop computers

## 🔧 Available Features

### ✅ What's Working
- **User Authentication**: Login/logout with role-based access
- **Ticket Management**: Create, view, update, and track tickets
- **Photo Upload**: Attach images to tickets
- **Status Tracking**: Real-time status updates
- **Comments System**: Add notes and updates
- **Reward Points**: Earn and track points
- **Role-based Dashboards**: Different views for different users
- **Responsive Design**: Works on all devices
- **Search & Filter**: Find tickets easily
- **Analytics**: View statistics and trends

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface
- **Soft Colors**: Easy on the eyes
- **Smooth Animations**: Pleasant user experience
- **Card-based Layout**: Easy to scan information
- **Status Badges**: Color-coded for quick identification
- **Progress Bars**: Visual feedback on completion

## 🚨 Troubleshooting

### If the Frontend Doesn't Load
1. **Check if React is running**: Look for "webpack compiled" message
2. **Try refreshing**: Press F5 or Ctrl+R
3. **Check console**: Press F12 for developer tools

### If API Calls Fail
1. **Verify backend is running**: Check http://localhost:8080/actuator/health
2. **Check network tab**: Press F12 → Network tab
3. **Restart services**: Run the restart commands below

## 🛠️ Management Commands

### Start/Stop Application
```bash
# Start everything
cd deployment
docker-compose -f docker-compose-simple.yml up -d

# Stop everything
docker-compose -f docker-compose-simple.yml down

# View logs
docker-compose -f docker-compose-simple.yml logs -f

# Restart specific service
docker-compose -f docker-compose-simple.yml restart backend
```

### Frontend Development
```bash
# Start React development server
cd frontend
npm start

# Build for production
npm run build
```

## 📊 Sample Data

The system comes with sample data to help you explore:

### Sample Tickets
- **TICKET-001**: Broken faucet in Room A101
- **TICKET-002**: AC not working in Room B205
- **TICKET-003**: Light bulb replacement in Room C301

### Sample Users
- **Admin**: Full system access
- **Staff**: Ticket management access
- **Student**: Issue reporting access

## 🎯 Quick Start Checklist

- [ ] ✅ Backend is running (http://localhost:8080)
- [ ] ✅ Frontend is running (http://localhost:3000)
- [ ] ✅ Database is initialized
- [ ] ✅ Test users are available
- [ ] ✅ Sample data is loaded

## 🎉 You're Ready!

Your SnapFix application is now fully operational! 

**Start by:**
1. Opening http://localhost:3000 in your browser
2. Logging in with `student@snapfix.com` / `student123`
3. Creating your first ticket
4. Exploring the different features

**Happy issue reporting!** 🎯

---

*Need help? Check the logs or restart the services using the management commands above.*
