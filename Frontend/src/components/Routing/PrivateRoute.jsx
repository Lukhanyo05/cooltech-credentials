import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  console.log('PrivateRoute - User:', user); // Debug
  console.log('PrivateRoute - Required role:', requiredRole); // Debug
  console.log('PrivateRoute - Loading:', loading); // Debug
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  console.log('PrivateRoute - Access granted'); // Debug
  return children;
};

export default PrivateRoute;