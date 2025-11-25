import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const PrivateRoute = ({ children, requiredRole, requiredAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🔐 PrivateRoute - Debug:', {
    user: user?.email,
    userRole: user?.role,
    requiredRole,
    requiredAdmin,
    loading,
    currentPath: location.pathname
  });

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🔐 PrivateRoute - No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for specific role requirement
  if (requiredRole && user.role !== requiredRole) {
    console.log(`🔐 PrivateRoute - Role mismatch: User is ${user.role}, required ${requiredRole}`);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-sm">
              You don't have permission to access this page.
            </p>
            <p className="text-xs mt-2">
              Your role: <span className="font-semibold capitalize">{user.role}</span>
              {requiredRole && (
                <> • Required: <span className="font-semibold capitalize">{requiredRole}</span></>
              )}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Additional admin check (if needed)
  if (requiredAdmin && user.role !== 'admin') {
    console.log('🔐 PrivateRoute - Admin access required but user is not admin');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-sm">
              This section is restricted to administrators only.
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('🔐 PrivateRoute - Access granted to:', user.email);
  return children;
};

export default PrivateRoute;