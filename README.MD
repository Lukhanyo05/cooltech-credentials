Cool Tech Credentials Management System
A secure, role-based credential management web application built with the MERN stack (MongoDB, Express.js, React, Node.js) for Cool Tech's internal credential management needs.

🚀 Features
🔐 Authentication & Authorization
JWT-based authentication with secure token management

Role-based access control with three user levels:

Normal Users: View credentials + Add new credentials

Management Users: Above + Edit/Update credentials

Admin Users: Above + User management + Role assignments + Division/OU management

🔒 Credential Management
Secure credential storage with password visibility controls

Division-based repositories for organizational units

CRUD operations with role-based permissions

Password viewing with show/hide toggle and copy functionality

Organized credential lists with website links and notes

👥 User & Organizational Management (Admin Only)
Complete user role management (User ↔ Manager ↔ Admin)

Division assignments - assign/unassign users from divisions

Organizational Unit (OU) management - assign/unassign users from OUs

Comprehensive Admin Panel with tabbed interface

Real-time assignment management with modal interface

🏢 Organizational Structure
4 Organizational Units (OUs):

News Management

Software Reviews

Hardware Reviews

Opinion Publishing

13 Divisions across all OUs (Finance, IT, Writing, Development, QA, Content, Testing, Research, Editorial, Marketing, Social Media, Analytics, Admin)

Flexible user assignments across multiple divisions/OUs

🛠️ Tech Stack
Frontend
React 18 with functional components and hooks

React Router for navigation

Tailwind CSS for responsive UI design

Axios for API communication

React Toastify for user notifications

Context API for state management

Backend
Node.js with Express.js framework

MongoDB with Mongoose ODM

JWT for authentication

bcryptjs for password hashing

CORS for cross-origin requests

Express Validator for input validation

🚀 Quick Start
Prerequisites
Node.js (v14 or higher)

MongoDB (local or Atlas)

npm or yarn

Installation & Setup
Clone the repository

bash
git clone <your-repo-url>
cd cooltech-credentials
Backend Setup

bash
cd backend
npm install

# Create .env file with:

# MONGODB_URI=mongodb://localhost:27017/cooltech-credentials

# JWT_SECRET=your-super-secret-jwt-key

# PORT=5000

# NODE_ENV=development

Frontend Setup

bash
cd frontend
npm install
Database Seeding

bash
cd backend
node clean-seed.js
This creates:

4 Organizational Units

13 Divisions

5 Users with different roles

Running the Application

bash

# Terminal 1 - Backend

cd backend
node server.js

# Terminal 2 - Frontend

cd frontend
npm start
Access the Application

Frontend: http://localhost:3000

Backend API: http://localhost:5000

👤 Default Login Credentials
After seeding, use these accounts to test different roles:

👤 Normal User: normal.user@cooltech.com / password123

👨‍💼 Manager User: manager.user@cooltech.com / password123

👑 Admin User: admin.user@cooltech.com / password123

👑 Alex Admin: alex@cooltech.io / SupremeLeader123

🧪 Test User: test.user@cooltech.com / password123

📁 Project Structure
text
cooltech-credentials/
├── backend/
│ ├── models/
│ │ ├── User.js
│ │ ├── OrganizationalUnit.js
│ │ ├── Division.js
│ │ └── Credential.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── credentials.js
│ │ └── userManagement.js
│ ├── middleware/
│ │ └── auth.js
│ ├── scripts/
│ │ └── seed.js
│ ├── clean-seed.js
│ ├── server.js
│ ├── .env
│ └── package.json
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── AdminPanel.jsx
│ │ │ ├── CredentialManager.jsx
│ │ │ ├── Login.jsx
│ │ │ ├── Register.jsx
│ │ │ └── Dashboard.jsx
│ │ ├── contexts/
│ │ │ └── AuthContext.jsx
│ │ ├── services/
│ │ │ ├── authService.js
│ │ │ ├── credentialService.js
│ │ │ └── adminService.js
│ │ └── App.js
│ └── package.json
└── README.md
🔧 API Endpoints
Authentication
POST /api/auth/register - User registration

POST /api/auth/login - User login

Credentials
GET /api/credentials/division/:divisionId - Get division credentials

POST /api/credentials - Add new credential

PUT /api/credentials/:id - Update credential

DELETE /api/credentials/:id - Delete credential

Admin Management
GET /api/admin/users - Get all users

PUT /api/admin/users/:userId/role - Change user role

POST /api/admin/users/:userId/divisions/:divisionId - Assign to division

DELETE /api/admin/users/:userId/divisions/:divisionId - Unassign from division

POST /api/admin/users/:userId/ous/:ouId - Assign to OU

DELETE /api/admin/users/:userId/ous/:ouId - Unassign from OU

GET /api/admin/divisions - Get all divisions

GET /api/admin/ous - Get all OUs

🎯 Key Features Demonstrated
Role-Based Access Control
Users: View and add credentials in their assigned divisions

Managers: All user abilities + edit/update credentials

Admins: Full system access including user management

Secure Authentication
JWT tokens with expiration

Protected routes and API endpoints

Password hashing with bcrypt

Comprehensive Admin Panel
User management with role changes

Division and OU assignment management

Real-time updates and modal interfaces

Tabbed navigation for different management areas

🐛 Troubleshooting
Common Issues
Port 5000 already in use

bash

# Find and kill the process

netstat -ano | findstr :5000
taskkill /PID <PID> /F
MongoDB connection issues

Ensure MongoDB is running locally or Atlas connection string is correct

Check .env file for correct MONGODB_URI

Seeder errors

Use clean-seed.js to completely reset the database

Ensure all model files are in the correct location

Authentication issues

Clear browser localStorage tokens

Check JWT_SECRET in backend .env file

🚀 Deployment Notes
Ensure MongoDB is running and accessible

Set proper CORS origins for production

Use environment variables for sensitive data

Consider rate limiting for production use
