import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  console.log('Current user:', user);
  console.log('User role:', user?.role);

  const divisions = [
    { id: 'it-division', name: 'IT Division', description: 'Technical infrastructure and systems' },
    { id: 'finance-division', name: 'Finance Division', description: 'Financial systems and accounts' },
    { id: 'hr-division', name: 'HR Division', description: 'Human resources systems' },
    { id: 'marketing-division', name: 'Marketing Division', description: 'Marketing and social media accounts' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user.name || user.email}
        </h1>
        <p className="text-gray-600 mt-2">
          Cool Tech Credentials Management System
        </p>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
          <p className="text-blue-800">
            <strong>Role:</strong> <span className="uppercase">{user.role || 'user'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {divisions.map((division) => (
          <div key={division.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{division.name}</h3>
            <p className="text-gray-600 mb-4">{division.description}</p>
            <Link
              to={`/credentials/${division.id}`}
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              View Credentials
            </Link>
          </div>
        ))}

        {/* Security Dashboard - Only show for Managers and Admins */}
        {(user.role === 'manager' || user.role === 'admin') && (
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Overview</h3>
            <p className="text-gray-600 mb-4">Monitor security status and access patterns</p>
            <Link
              to="/security"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Security Dashboard
            </Link>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
            <p className="text-gray-600 mb-4">Manage users, roles, and system settings</p>
            <Link
              to="/admin"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Admin Access
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;