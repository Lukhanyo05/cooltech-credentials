# Cool Tech Credentials Management System

A secure, role-based credential management web application built with the MERN stack (MongoDB, Express.js, React, Node.js) for Cool Tech's internal credential management needs.

## 🚀 Features

### 🔐 Authentication & Authorization

- **JWT-based authentication** with secure token management
- **Role-based access control** with three user levels:
  - **Normal Users**: View credentials + Add new credentials
  - **Management Users**: Above + Edit/Delete credentials
  - **Admin Users**: Above + User management + Role assignments

### 🔒 Security & Monitoring

- **Security Dashboard** for managers and admins
- **Real-time security metrics** and activity monitoring
- **Risk alerts** with severity levels
- **Access pattern analysis** and login tracking
- **Security score** system for overall system health

### 🔑 Credential Management

- **Secure credential storage** with password visibility controls
- **Division-based repositories** for organizational units
- **CRUD operations** with role-based permissions
- **Password viewing** with show/hide toggle and copy functionality
- **Organized credential lists** with website links and notes

### 👥 User Management (Admin Only)

- **User role management** (User ↔ Manager ↔ Admin)
- **Division assignments** for organizational structure
- **Organizational Unit (OU) management**
- **Bulk user operations** and assignment tools

### 🏢 Organizational Structure

- **Multiple Organizational Units** (OUs):
  - News Management
  - Software Reviews
  - Hardware Reviews
  - Opinion Publishing
- **Division-based access control** within each OU
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

## 📁 Project Structure
