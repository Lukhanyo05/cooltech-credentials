import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold">
              Cool Tech Credentials
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-indigo-200">
                {user.name || user.email}
              </span>
              <span className="bg-indigo-500 px-2 py-1 rounded text-xs uppercase">
                {user.role || 'user'}
              </span>
              <Link
                to="/dashboard"
                className="hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors"
              >
                Dashboard
              </Link>
              
              {/* Security Link - Show for Managers and Admins */}
              {(user.role === 'manager' || user.role === 'admin') && (
                <Link
                  to="/security"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors"
                >
                  Security
                </Link>
              )}
              
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;