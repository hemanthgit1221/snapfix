# SnapFix - College Issue Reporting & Maintenance Web App

A smart maintenance and issue reporting platform for students, faculty, and college management with gamified rewards system.

## 🎯 Objective

Create a comprehensive platform where:
- Students/Faculty can report infrastructure issues with photos
- Management can track, assign, and analyze tickets
- Department staff can update ticket progress
- Users earn rewards for resolving tickets

## 🛠 Tech Stack

### Backend
- **Framework**: Java Spring Boot (REST APIs)
- **Database & Auth**: Supabase
- **File Storage**: Supabase Storage
- **Notifications**: JavaMail API

### Frontend
- **Framework**: React.js
- **Styling**: TailwindCSS
- **Charts**: Chart.js / Recharts
- **Animations**: Framer Motion
- **Icons**: Minimal line icons

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Student/Faculty** | Raise issues, track tickets, earn reward points |
| **Department Staff** | View assigned tickets, update status, add notes |
| **Admin/Department Head** | Manage all tickets, analytics dashboard, assign tickets |

## 🎫 Ticket System

**Workflow**: `Pending → In Progress → Resolved → Closed`

**Fields**:
- Auto-generated Ticket ID
- Issue Photo (required)
- Room Number, Floor, Building
- Category: Plumbing, Electrical, Housekeeping, AC/Water, Others
- Short Description

## 🏆 Rewards System

- Earn points for resolved tickets
- Configurable point values
- Redeemable vouchers
- Gamified experience with badges

## 🎨 UI/UX Features

- Clean, modern design with soft pastels
- Card-based layout with rounded corners
- Smooth animations and transitions
- Mobile-responsive design
- Progress bars and status badges

## 📁 Project Structure

```
SnapFix_mark2/
├── backend/                 # Spring Boot REST API
├── frontend/                # React.js web application
├── docs/                    # Project documentation
├── database/                # Database schemas and migrations
└── deployment/              # Docker and deployment configs
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Supabase account

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📊 Features

- ✅ Role-based authentication
- ✅ Ticket management system
- ✅ File upload with image preview
- ✅ Real-time notifications
- ✅ Analytics dashboard
- ✅ Reward points system
- ✅ Mobile-responsive design
- ✅ Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
