import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { adminService } from '../../services/adminService.js';
import { toast } from 'react-toastify';

// Error Boundary Wrapper
const AdminPanelWithErrorBoundary = (props) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  const resetError = () => {
    setHasError(false);
    setError(null);
  };

  try {
    if (hasError) {
      throw error;
    }
    return <AdminPanel {...props} onResetError={resetError} />;
  } catch (error) {
    console.error('🔧 CRITICAL ERROR in AdminPanel:', error);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error Loading Admin Panel</h2>
          <div className="bg-white p-4 rounded border mb-4">
            <p className="text-red-600 font-semibold">Error: {error.message}</p>
            <details className="mt-2 text-sm text-gray-600">
              <summary className="cursor-pointer">Technical Details</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">{error.stack}</pre>
            </details>
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
            <button 
              onClick={resetError} 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
};

// Main AdminPanel Component
const AdminPanel = ({ onResetError }) => {
  console.log('🔧 AdminPanel - Component mounting...');
  
  // Safe hooks with error handling
  let auth;
  try {
    auth = useAuth();
    console.log('🔧 AdminPanel - Auth context loaded:', { 
      user: auth?.user,
      hasUser: !!auth?.user 
    });
  } catch (authError) {
    console.error('🔧 AdminPanel - Auth context error:', authError);
    throw new Error(`Failed to load authentication: ${authError.message}`);
  }

  const { user } = auth || {};

  // State initialization
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [organisationalUnits, setOrganisationalUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [error, setError] = useState(null);
  const [apiTestResult, setApiTestResult] = useState(null);

  console.log('🔧 AdminPanel - State initialized');

  // Safe data loading
  const loadData = async () => {
    try {
      console.log('🔧 AdminPanel - Starting loadData');
      setLoading(true);
      setError(null);
      if (onResetError) onResetError();

      // Validate adminService
      if (!adminService) {
        throw new Error('Admin service is not available');
      }

      const requiredMethods = ['getUsers', 'getDivisions', 'getOUs'];
      const missingMethods = requiredMethods.filter(method => typeof adminService[method] !== 'function');
      
      if (missingMethods.length > 0) {
        throw new Error(`Missing adminService methods: ${missingMethods.join(', ')}`);
      }

      console.log('🔧 AdminPanel - Calling adminService methods...');
      
      const [usersData, divisionsData, ousData] = await Promise.all([
        adminService.getUsers().catch(err => { 
          throw new Error(`Failed to fetch users: ${err.message}`); 
        }),
        adminService.getDivisions().catch(err => { 
          throw new Error(`Failed to fetch divisions: ${err.message}`); 
        }),
        adminService.getOUs().catch(err => { 
          throw new Error(`Failed to fetch OUs: ${err.message}`); 
        })
      ]);

      console.log('🔧 AdminPanel - Data received:', {
        users: usersData?.length || 0,
        divisions: divisionsData?.length || 0,
        ous: ousData?.length || 0
      });

      // Safe state updates
      setUsers(Array.isArray(usersData) ? usersData : []);
      setDivisions(Array.isArray(divisionsData) ? divisionsData : []);
      setOrganisationalUnits(Array.isArray(ousData) ? ousData : []);
      
      console.log('🔧 AdminPanel - All data loaded successfully');
    } catch (error) {
      console.error('🔧 AdminPanel - ERROR in loadData:', error);
      setError(error.message);
      toast.error(`Failed to load admin data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔧 AdminPanel - useEffect running');
    loadData();
  }, []);

  // Safe test function
  const testAdminAPI = async () => {
    try {
      console.log('🔧 Testing admin API manually...');
      setApiTestResult('testing');
      const token = localStorage.getItem('token');
      console.log('🔧 Token available:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found in localStorage');
      }

      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔧 Manual API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔧 Manual API test successful, data length:', data?.length || 0);
      setApiTestResult('success');
      toast.success(`Admin API test successful! Found ${data?.length || 0} users.`);
    } catch (error) {
      console.error('🔧 Manual API test failed:', error);
      setApiTestResult('error');
      toast.error(`API Test Failed: ${error.message}`);
    }
  };

  // Temporary debug function
  const debugAssignment = async (userId, resourceId, type = 'division') => {
    try {
      console.log(`🔧 Debug - Testing ${type} assignment for user ${userId}`);
      
      const token = localStorage.getItem('token');
      const url = type === 'division' 
        ? `http://localhost:5000/api/admin/users/${userId}/divisions/${resourceId}`
        : `http://localhost:5000/api/admin/users/${userId}/ous/${resourceId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`🔧 Debug - Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔧 Debug - Error response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`🔧 Debug - Success:`, data);
      return data;
      
    } catch (error) {
      console.error(`🔧 Debug - Assignment failed:`, error);
      throw error;
    }
  };

  // Safe handler functions - UPDATED WITH BETTER ERROR HANDLING
  const handleRoleChange = async (userId, newRole) => {
    try {
      if (!userId || !newRole) {
        throw new Error('Missing user ID or role');
      }
      
      if (!adminService.changeUserRole) {
        throw new Error('changeUserRole method not available');
      }

      await adminService.changeUserRole(userId, newRole);
      toast.success('User role updated successfully');
      await loadData(); // Reload data
    } catch (error) {
      console.error('🔧 Error changing role:', error);
      
      // Better error handling
      if (error.response?.status === 400) {
        const serverMessage = error.response?.data?.message || error.response?.data;
        toast.error(`Validation error: ${serverMessage || 'Invalid request data'}`);
      } else if (error.response?.status === 403) {
        toast.error('Permission denied: You cannot change this user\'s role');
      } else if (error.response?.status === 404) {
        toast.error('User not found');
      } else {
        toast.error(`Failed to update user role: ${error.message}`);
      }
    }
  };

  const handleDivisionAssignment = async (userId, divisionId, assign = true) => {
    try {
      if (!userId || !divisionId) {
        throw new Error('Missing user ID or division ID');
      }

      const method = assign ? adminService.assignUserToDivision : adminService.unassignUserFromDivision;
      if (!method) {
        throw new Error(`${assign ? 'assignUserToDivision' : 'unassignUserFromDivision'} method not available`);
      }

      await method(userId, divisionId);
      toast.success(`User ${assign ? 'assigned to' : 'unassigned from'} division successfully`);
      await loadData();
    } catch (error) {
      console.error(`🔧 Error in division assignment:`, error);
      
      // Better error messages
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'User already assigned to this division');
      } else if (error.response?.status === 404) {
        toast.error('User or division not found');
      } else if (error.response?.status === 403) {
        toast.error('Permission denied');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the server logs.');
      } else {
        toast.error(`Operation failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleOUAssignment = async (userId, ouId, assign = true) => {
    try {
      if (!userId || !ouId) {
        throw new Error('Missing user ID or OU ID');
      }

      const method = assign ? adminService.assignUserToOU : adminService.unassignUserFromOU;
      if (!method) {
        throw new Error(`${assign ? 'assignUserToOU' : 'unassignUserFromOU'} method not available`);
      }

      await method(userId, ouId);
      toast.success(`User ${assign ? 'assigned to' : 'unassigned from'} organizational unit successfully`);
      await loadData();
    } catch (error) {
      console.error(`🔧 Error in OU assignment:`, error);
      
      // Better error messages
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'User already assigned to this organizational unit');
      } else if (error.response?.status === 404) {
        toast.error('User or organizational unit not found');
      } else if (error.response?.status === 403) {
        toast.error('Permission denied');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check the server logs.');
      } else {
        toast.error(`Operation failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const openAssignmentModal = (user) => {
    if (!user || !user._id) {
      console.error('🔧 Invalid user passed to openAssignmentModal:', user);
      toast.error('Invalid user data');
      return;
    }
    setSelectedUser(user);
    setShowAssignmentModal(true);
  };

  const closeAssignmentModal = () => {
    setSelectedUser(null);
    setShowAssignmentModal(false);
  };

  // Safe render conditions
  if (!user) {
    console.log('🔧 AdminPanel - No user, rendering access denied');
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800">Access Denied</h2>
          <p className="text-yellow-600 mt-2">You must be logged in to access the admin panel.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('🔧 AdminPanel - Rendering loading state');
    return (
      <div className="flex justify-center items-center min-h-64 flex-col space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <div className="text-center">
          <p className="text-gray-600">Loading admin data...</p>
          <button 
            onClick={testAdminAPI}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Test API Connection
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('🔧 AdminPanel - Rendering error state:', error);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800">Error Loading Admin Data</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <div className="mt-4 space-x-4">
            <button 
              onClick={loadData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry Loading Data
            </button>
            <button 
              onClick={testAdminAPI}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test API Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('🔧 AdminPanel - Rendering main content with data:', {
    users: users.length,
    divisions: divisions.length,
    organisationalUnits: organisationalUnits.length
  });

  // Safe data access
  const safeUsers = Array.isArray(users) ? users : [];
  const safeDivisions = Array.isArray(divisions) ? divisions : [];
  const safeOUs = Array.isArray(organisationalUnits) ? organisationalUnits : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">
              Welcome, {user?.name || user?.email || 'Admin'}
              {user?.role && (
                <span className={`ml-2 text-sm px-2 py-1 rounded ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : user.role === 'manager'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  ({user.role})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {apiTestResult && (
              <span className={`text-sm px-3 py-1 rounded ${
                apiTestResult === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                apiTestResult === 'success' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {apiTestResult === 'testing' ? 'Testing...' :
                 apiTestResult === 'success' ? 'API OK' : 'API Error'}
              </span>
            )}
            <button 
              onClick={testAdminAPI}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Test Admin API
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'User Management' },
            { id: 'divisions', label: 'Divisions' },
            { id: 'organisationalUnits', label: 'Organizational Units' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'users' && ` (${safeUsers.length})`}
              {tab.id === 'divisions' && ` (${safeDivisions.length})`}
              {tab.id === 'organisationalUnits' && ` (${safeOUs.length})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage user roles and assignments ({safeUsers.length} users)
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Divisions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizational Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {safeUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  safeUsers.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-800 font-medium text-sm">
                              {(userItem.name || 'UU').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.name || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userItem.email || 'No Email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <select
                            value={userItem.role || 'user'}
                            onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                            disabled={userItem._id === user?._id}
                            className={`text-sm font-medium rounded px-2 py-1 border ${
                              userItem.role === 'admin' 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : userItem.role === 'manager'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                            } ${userItem._id === user?._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                          {userItem._id === user?._id && (
                            <span className="text-xs text-gray-500 ml-2">(You)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1 max-w-xs">
                          {(!userItem.divisions || userItem.divisions.length === 0) ? (
                            <span className="text-gray-400 italic">No divisions</span>
                          ) : (
                            userItem.divisions.map((division) => (
                              <div key={division._id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                                <span className="truncate">{division.name}</span>
                                <button
                                  onClick={() => handleDivisionAssignment(userItem._id, division._id, false)}
                                  className="text-red-600 hover:text-red-800 text-xs ml-2 flex-shrink-0"
                                  disabled={userItem._id === user?._id}
                                  title="Remove from division"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1 max-w-xs">
                          {(!userItem.organisationalUnits || userItem.organisationalUnits.length === 0) ? (
                            <span className="text-gray-400 italic">No OUs</span>
                          ) : (
                            userItem.organisationalUnits.map((ou) => (
                              <div key={ou._id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                                <span className="truncate">{ou.name}</span>
                                <button
                                  onClick={() => handleOUAssignment(userItem._id, ou._id, false)}
                                  className="text-red-600 hover:text-red-800 text-xs ml-2 flex-shrink-0"
                                  disabled={userItem._id === user?._id}
                                  title="Remove from organizational unit"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openAssignmentModal(userItem)}
                          className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                          disabled={userItem._id === user?._id}
                          title={userItem._id === user?._id ? "Cannot assign yourself" : "Assign to divisions/OU"}
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Divisions Tab */}
      {activeTab === 'divisions' && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Divisions ({safeDivisions.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeDivisions.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg shadow border">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <p>No divisions found</p>
                <p className="text-sm text-gray-400 mt-2">Divisions will appear here once created</p>
              </div>
            ) : (
              safeDivisions.map((division) => (
                <div key={division._id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{division.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{division.description || 'No description provided'}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Assigned Users ({division.users?.length || 0})
                    </h4>
                    {(!division.users || division.users.length === 0) ? (
                      <p className="text-gray-400 text-sm italic">No users assigned</p>
                    ) : (
                      <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                        {division.users.map((userItem) => (
                          <li key={userItem._id} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                            <span className="truncate">{userItem.name} 
                              <span className="text-xs text-gray-500 ml-1">({userItem.role})</span>
                            </span>
                            <button
                              onClick={() => handleDivisionAssignment(userItem._id, division._id, false)}
                              className="text-red-600 hover:text-red-800 text-xs flex-shrink-0 ml-2"
                              title="Remove user from division"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Organizational Units Tab */}
      {activeTab === 'organisationalUnits' && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Organizational Units ({safeOUs.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeOUs.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg shadow border">
                <div className="text-gray-400 text-6xl mb-4">🏛️</div>
                <p>No organizational units found</p>
                <p className="text-sm text-gray-400 mt-2">Organizational units will appear here once created</p>
              </div>
            ) : (
              safeOUs.map((ou) => (
                <div key={ou._id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{ou.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{ou.description || 'No description provided'}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Assigned Users ({ou.users?.length || 0})
                    </h4>
                    {(!ou.users || ou.users.length === 0) ? (
                      <p className="text-gray-400 text-sm italic">No users assigned</p>
                    ) : (
                      <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                        {ou.users.map((userItem) => (
                          <li key={userItem._id} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                            <span className="truncate">{userItem.name} 
                              <span className="text-xs text-gray-500 ml-1">({userItem.role})</span>
                            </span>
                            <button
                              onClick={() => handleOUAssignment(userItem._id, ou._id, false)}
                              className="text-red-600 hover:text-red-800 text-xs flex-shrink-0 ml-2"
                              title="Remove user from organizational unit"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Assign {selectedUser.name} to Divisions & Organizational Units
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Manage assignments for {selectedUser.email}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Divisions Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Divisions ({safeDivisions.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                    {safeDivisions.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No divisions available</p>
                    ) : (
                      safeDivisions.map((division) => {
                        const isAssigned = selectedUser.divisions?.some(div => div._id === division._id);
                        return (
                          <div key={division._id} className="flex items-center justify-between p-3 border rounded bg-white hover:bg-gray-50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 block truncate">
                                {division.name}
                              </span>
                              {division.description && (
                                <p className="text-xs text-gray-500 mt-1 truncate">{division.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDivisionAssignment(
                                selectedUser._id, 
                                division._id, 
                                !isAssigned
                              )}
                              className={`px-3 py-1 text-xs rounded transition-colors font-medium ${
                                isAssigned
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                              }`}
                            >
                              {isAssigned ? 'Remove' : 'Assign'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Organizational Units Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Organizational Units ({safeOUs.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                    {safeOUs.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">No organizational units available</p>
                    ) : (
                      safeOUs.map((ou) => {
                        const isAssigned = selectedUser.organisationalUnits?.some(unit => unit._id === ou._id);
                        return (
                          <div key={ou._id} className="flex items-center justify-between p-3 border rounded bg-white hover:bg-gray-50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 block truncate">
                                {ou.name}
                              </span>
                              {ou.description && (
                                <p className="text-xs text-gray-500 mt-1 truncate">{ou.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleOUAssignment(
                                selectedUser._id, 
                                ou._id, 
                                !isAssigned
                              )}
                              className={`px-3 py-1 text-xs rounded transition-colors font-medium ${
                                isAssigned
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                              }`}
                            >
                              {isAssigned ? 'Remove' : 'Assign'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  onClick={closeAssignmentModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the safe wrapper
export default AdminPanelWithErrorBoundary;