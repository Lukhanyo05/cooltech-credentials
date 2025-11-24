# Cool Tech Credentials Management System

A secure, role-based credential management web application built with the MERN stack (MongoDB, Express.js, React, Node.js) for Cool Tech's internal credential management needs.

## 🚀 Features

### 🔐 Authentication & Authorization

- **JWT-based authentication** with secure token management
- **Role-based access control** with three user levels:
  - **Normal Users**: View credentials + Add new credentials
  - **Management Users**: Above + Edit/Update credentials
  - **Admin Users**: Above + User management + Role assignments + Division/OU management

### 🔒 Credential Management

- **Secure credential storage** with password visibility controls
- **Division-based repositories** for organizational units
- **CRUD operations** with role-based permissions
- **Password viewing** with show/hide toggle and copy functionality
- **Organized credential lists** with website links and notes
- **Email-based authentication** for all credentials (no usernames)

### 👥 User & Organizational Management (Admin Only)

- **Complete user role management** (User ↔ Manager ↔ Admin)
- **Division assignments** - assign/unassign users from divisions
- **Organizational Unit (OU) management** - assign/unassign users from OUs
- **Comprehensive Admin Panel** with tabbed interface
- **Real-time assignment management** with modal interface

### 🏢 Organizational Structure

- **4 Organizational Units** (OUs):
  - News Management
  - Software Reviews
  - Hardware Reviews
  - Opinion Publishing
- **13 Divisions** across all OUs (Finance, IT, Writing, Development, QA, Content, Testing, Research, Editorial, Marketing, Social Media, Analytics, Admin)
- **Flexible user assignments** across multiple divisions/OUs

## 🛠️ Tech Stack

### Frontend

- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for responsive UI design
- **Axios** for API communication
- **React Toastify** for user notifications
- **Context API** for state management

### Backend

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **Express Validator** for input validation

## 📋 Project Requirements Met

### ✅ Compulsory Task 1 - Foundation

- React frontend + Express backend setup
- MongoDB with Mongoose integration
- User authentication with JWT
- Login/registration with role-based access
- Well-designed UI with proper feedback

### ✅ Compulsory Task 2 - Credential Management

- Division-based credential repositories
- JWT-protected endpoints with permission verification
- CRUD operations for credentials
- Frontend components for credential management
- Secure access control per division

### ✅ Compulsory Task 3 - Admin & User Management

- **User role management** (change between User/Manager/Admin)
- **Division assignment endpoints** (assign/unassign users)
- **OU assignment endpoints** (assign/unassign users)
- **Complete Admin Panel** with all management features
- **Frontend components** for user, division, and OU management

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cooltech-credentials
   ```
