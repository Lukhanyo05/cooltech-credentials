import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { adminService } from '../../services/adminService.js';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [organizationalUnits, setOrganizationalUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  console.log('🔧 AdminPanel - Component mounted');
  console.log('🔧 AdminPanel - Current user:', user);

  useEffect(() => {
    console.log('🔧 AdminPanel - useEffect triggered');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔧 AdminPanel - Starting to load data');
      setLoading(true);
      
      console.log('🔧 AdminPanel - Calling adminService.getUsers()');
      const usersData = await adminService.getUsers();
      console.log('🔧 AdminPanel - Users data received:', usersData);
      
      console.log('🔧 AdminPanel - Calling adminService.getDivisions()');
      const divisionsData = await adminService.getDivisions();
      console.log('🔧 AdminPanel - Divisions data received:', divisionsData);
      
      console.log('🔧 AdminPanel - Calling adminService.getOUs()');
      const ousData = await adminService.getOUs();
      console.log('🔧 AdminPanel - OUs data received:', ousData);
      
      setUsers(usersData);
      setDivisions(divisionsData);
      setOrganizationalUnits(ousData);
      
      console.log('🔧 AdminPanel - All data loaded successfully');
    } catch (error) {
      console.error('🔧 AdminPanel - ERROR loading admin data:', error);
      console.error('🔧 AdminPanel - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load admin data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Test if we can manually call the API
  const testAdminAPI = async () => {
    try {
      console.log('🔧 Testing admin API manually...');
      const token = localStorage.getItem('token');
      console.log('🔧 Token being used:', token ? token.substring(0, 50) + '...' : 'No token');
      
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('🔧 Manual API test response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 Manual API test failed:', errorText);
        toast.error(`API Error: ${response.status} - ${errorText}`);
        return;
      }
      
      const data = await response.json();
      console.log('🔧 Manual API test data:', data);
      toast.success('Admin API test successful!');
    } catch (error) {
      console.error('🔧 Manual API test failed:', error);
      toast.error('Manual API test failed: ' + error.message);
    }
  };

  // Call the test function on component mount
  useEffect(() => {
    testAdminAPI();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      console.log(`🔧 Changing role for user ${userId} to ${newRole}`);
      await adminService.changeUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadData(); // Reload data
    } catch (error) {
      console.error('🔧 Error changing role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDivisionAssignment = async (userId, divisionId, assign = true) => {
    try {
      console.log(`🔧 ${assign ? 'Assigning' : 'Unassigning'} user ${userId} from division ${divisionId}`);
      if (assign) {
        await adminService.assignUserToDivision(userId, divisionId);
        toast.success('User assigned to division successfully');
      } else {
        await adminService.unassignUserFromDivision(userId, divisionId);
        toast.success('User unassigned from division successfully');
      }
      loadData(); // Reload data
    } catch (error) {
      console.error(`🔧 Error ${assign ? 'assigning' : 'unassigning'} from division:`, error);
      toast.error(`Failed to ${assign ? 'assign' : 'unassign'} user from division`);
    }
  };

  const handleOUAssignment = async (userId, ouId, assign = true) => {
    try {
      console.log(`🔧 ${assign ? 'Assigning' : 'Unassigning'} user ${userId} from OU ${ouId}`);
      if (assign) {
        await adminService.assignUserToOU(userId, ouId);
        toast.success('User assigned to organizational unit successfully');
      } else {
        await adminService.unassignUserFromOU(userId, ouId);
        toast.success('User unassigned from organizational unit successfully');
      }
      loadData(); // Reload data
    } catch (error) {
      console.error(`🔧 Error ${assign ? 'assigning' : 'unassigning'} from OU:`, error);
      toast.error(`Failed to ${assign ? 'assign' : 'unassign'} user from organizational unit`);
    }
  };

  const openAssignmentModal = (user) => {
    setSelectedUser(user);
    setShowAssignmentModal(true);
  };

  if (loading) {
    console.log('🔧 AdminPanel - Rendering loading state');
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4">Loading admin data...</span>
      </div>
    );
  }

  console.log('🔧 AdminPanel - Rendering main content');
  console.log('🔧 AdminPanel - Current state:', { 
    usersCount: users.length, 
    divisionsCount: divisions.length, 
    organizationalUnitsCount: organizationalUnits.length 
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Welcome, {user.name || user.email}</p>
        <button 
          onClick={testAdminAPI}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Admin API
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['users', 'divisions', 'organizationalUnits'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'users' && 'User Management'}
              {tab === 'divisions' && 'Divisions'}
              {tab === 'organizationalUnits' && 'Organizational Units'}
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
              Manage user roles and assignments
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
                {users.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userItem.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                        disabled={userItem._id === user._id}
                        className={`text-sm font-medium rounded px-2 py-1 ${
                          userItem.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : userItem.role === 'manager'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        } ${userItem._id === user._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      {userItem._id === user._id && (
                        <span className="text-xs text-gray-500 ml-2">(You)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        {userItem.divisions.length === 0 ? (
                          <span className="text-gray-400">No divisions</span>
                        ) : (
                          userItem.divisions.map((division) => (
                            <div key={division._id} className="flex items-center justify-between">
                              <span>{division.name}</span>
                              <button
                                onClick={() => handleDivisionAssignment(userItem._id, division._id, false)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        {userItem.organizationalUnits.length === 0 ? (
                          <span className="text-gray-400">No OUs</span>
                        ) : (
                          userItem.organizationalUnits.map((ou) => (
                            <div key={ou._id} className="flex items-center justify-between">
                              <span>{ou.name}</span>
                              <button
                                onClick={() => handleOUAssignment(userItem._id, ou._id, false)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openAssignmentModal(userItem)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Divisions Tab */}
      {activeTab === 'divisions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((division) => (
            <div key={division._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{division.name}</h3>
              <p className="text-gray-600 mb-4">{division.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Users:</h4>
                {division.users.length === 0 ? (
                  <p className="text-gray-400 text-sm">No users assigned</p>
                ) : (
                  <ul className="text-sm text-gray-600 space-y-1">
                    {division.users.map((userItem) => (
                      <li key={userItem._id} className="flex justify-between items-center">
                        <span>{userItem.name} ({userItem.role})</span>
                        <button
                          onClick={() => handleDivisionAssignment(userItem._id, division._id, false)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Organizational Units Tab */}
      {activeTab === 'organizationalUnits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizationalUnits.map((ou) => (
            <div key={ou._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{ou.name}</h3>
              <p className="text-gray-600 mb-4">{ou.description}</p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Users:</h4>
                {ou.users.length === 0 ? (
                  <p className="text-gray-400 text-sm">No users assigned</p>
                ) : (
                  <ul className="text-sm text-gray-600 space-y-1">
                    {ou.users.map((userItem) => (
                      <li key={userItem._id} className="flex justify-between items-center">
                        <span>{userItem.name} ({userItem.role})</span>
                        <button
                          onClick={() => handleOUAssignment(userItem._id, ou._id, false)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign {selectedUser.name} to Divisions/OU
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Divisions Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Divisions</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {divisions.map((division) => {
                      const isAssigned = selectedUser.divisions.some(
                        div => div._id === division._id
                      );
                      return (
                        <div key={division._id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{division.name}</span>
                          <button
                            onClick={() => handleDivisionAssignment(
                              selectedUser._id, 
                              division._id, 
                              !isAssigned
                            )}
                            className={`px-3 py-1 text-xs rounded ${
                              isAssigned
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {isAssigned ? 'Remove' : 'Assign'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Organizational Units Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Organizational Units</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {organizationalUnits.map((ou) => {
                      const isAssigned = selectedUser.organizationalUnits.some(
                        unit => unit._id === ou._id
                      );
                      return (
                        <div key={ou._id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{ou.name}</span>
                          <button
                            onClick={() => handleOUAssignment(
                              selectedUser._id, 
                              ou._id, 
                              !isAssigned
                            )}
                            className={`px-3 py-1 text-xs rounded ${
                              isAssigned
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {isAssigned ? 'Remove' : 'Assign'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
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

export default AdminPanel;