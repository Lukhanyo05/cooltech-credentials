// frontend/src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { credentialsService } from '../../services/credentialsService';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [divisions, setDivisions] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔧 Dashboard - User changed:', user);
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      console.log('🔧 Dashboard - Starting to load data...');
      setLoading(true);
      setError(null);

      // Check if user has divisions populated
      if (user && user.divisions && user.divisions.length > 0) {
        console.log('🔧 Dashboard - User divisions:', user.divisions);
        setDivisions(user.divisions);
        setSelectedDivision(user.divisions[0]);
      } else {
        console.log('🔧 Dashboard - No divisions found for user');
        setDivisions([]);
      }

      // Load credentials
      console.log('🔧 Dashboard - Loading credentials...');
      const credentialsData = await credentialsService.getMyCredentials();
      console.log('🔧 Dashboard - Credentials loaded:', credentialsData);
      setCredentials(credentialsData);
      
    } catch (error) {
      console.error('🔧 Dashboard - Error loading data:', error);
      setError(error.message);
      toast.error('Failed to load dashboard data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = async (credentialData) => {
    try {
      console.log('🔧 Dashboard - RAW credential data received:', credentialData);
      
      // CORRECTED: Backend expects 'division' not 'divisionId'
      const dataToSend = {
        title: credentialData.title,
        username: credentialData.username,
        password: credentialData.password,
        website: credentialData.website || '',
        description: credentialData.description || '',
        division: credentialData.divisionId // FIXED: divisionId → division
      };

      console.log('🔧 Dashboard - Data being sent to backend:', JSON.stringify(dataToSend, null, 2));
      
      await credentialsService.createCredential(dataToSend);
      toast.success('Credential added successfully');
      setShowAddModal(false);
      await loadUserData(); // Reload data
    } catch (error) {
      console.error('🔧 Dashboard - Full error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error('Failed to add credential: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateCredential = async (credentialId, updates) => {
    try {
      await credentialsService.updateCredential(credentialId, updates);
      toast.success('Credential updated successfully');
      await loadUserData();
    } catch (error) {
      console.error('Error updating credential:', error);
      toast.error('Failed to update credential: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) {
      return;
    }

    try {
      await credentialsService.deleteCredential(credentialId);
      toast.success('Credential deleted successfully');
      await loadUserData();
    } catch (error) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 flex-col space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadUserData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry Loading Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name || user?.email}
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

      {/* Divisions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Divisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <div className="text-gray-400 text-6xl mb-4">🏢</div>
              <p>No divisions assigned</p>
              <p className="text-sm text-gray-400 mt-2">
                Contact an administrator to be assigned to divisions
              </p>
            </div>
          ) : (
            divisions.map((division) => (
              <div 
                key={division._id} 
                className={`bg-white p-6 rounded-lg shadow-md border-2 cursor-pointer transition-all ${
                  selectedDivision?._id === division._id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedDivision(division)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {division.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {division.description}
                </p>
                <div className="text-xs text-gray-500">
                  {credentials.filter(c => c.division?._id === division._id).length} credentials
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Credentials Section */}
      {selectedDivision && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Credentials - {selectedDivision.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage credentials for this division
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Credential
            </button>
          </div>

          <div className="overflow-x-auto">
            {credentials.filter(cred => cred.division?._id === selectedDivision._id).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No credentials found for this division</p>
                <p className="text-sm mt-2">Click "Add Credential" to create your first one</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {credentials
                    .filter(cred => cred.division?._id === selectedDivision._id)
                    .map((credential) => (
                      <CredentialRow 
                        key={credential._id}
                        credential={credential}
                        user={user}
                        onUpdate={handleUpdateCredential}
                        onDelete={handleDeleteCredential}
                      />
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add Credential Modal */}
      {showAddModal && selectedDivision && (
        <AddCredentialModal
          division={selectedDivision}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCredential}
        />
      )}
    </div>
  );
};

// Credential Row Component
const CredentialRow = ({ credential, user, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: credential.title,
    website: credential.website,
    username: credential.username,
    password: credential.password,
    description: credential.description
  });

  const canEdit = user.role === 'admin' || user.role === 'manager' || credential.createdBy?._id === user._id;
  const canDelete = user.role === 'admin' || credential.createdBy?._id === user._id;
  
  // Show password field differently based on user role
  const displayPassword = user.role === 'admin' ? credential.password : '••••••••';

  const handleSave = async () => {
    try {
      await onUpdate(credential._id, editData);
      setIsEditing(false);
    } catch (error) {
      // Error handled in parent
    }
  };

  const handleCancel = () => {
    setEditData({
      title: credential.title,
      website: credential.website,
      username: credential.username,
      password: credential.password,
      description: credential.description
    });
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            className="w-full px-2 py-1 border rounded"
          />
        ) : (
          <div className="text-sm font-medium text-gray-900">{credential.title}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="text"
            value={editData.website}
            onChange={(e) => setEditData({...editData, website: e.target.value})}
            className="w-full px-2 py-1 border rounded"
          />
        ) : (
          <div className="text-sm text-gray-900">{credential.website}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="text"
            value={editData.username}
            onChange={(e) => setEditData({...editData, username: e.target.value})}
            className="w-full px-2 py-1 border rounded"
          />
        ) : (
          <div className="text-sm text-gray-900">{credential.username}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="password"
            value={editData.password}
            onChange={(e) => setEditData({...editData, password: e.target.value})}
            className="w-full px-2 py-1 border rounded"
            placeholder="Enter new password"
          />
        ) : (
          <div className="text-sm text-gray-900 font-mono">
            {displayPassword}
            {user.role === 'admin' && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(credential.password);
                  toast.success('Password copied to clipboard!');
                }}
                className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                title="Copy password"
              >
                📋
              </button>
            )}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-900"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(credential._id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            )}
          </>
        )}
      </td>
    </tr>
  );
};

// Add Credential Modal Component
const AddCredentialModal = ({ division, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    website: '',
    username: '',
    password: '',
    description: '',
    divisionId: division._id // Keep as divisionId for internal state
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔧 AddCredentialModal - Submitting data:', formData);
      
      // Send the form data - handleAddCredential will convert divisionId → division
      await onSubmit(formData);
      
    } catch (error) {
      // Error is handled in the parent component
      console.error('🔧 AddCredentialModal - Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Add New Credential to {division.name}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., WordPress Admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website *</label>
              <input
                type="text"
                name="website"
                required
                value={formData.website}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., https://wordpress.cooltech.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username *</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., admin_user"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Optional description..."
              />
            </div>
            
            {/* Debug info - shows what's being sent to backend */}
            <div className="bg-gray-100 p-2 rounded text-xs">
              <p><strong>Debug Info:</strong> divisionId = {formData.divisionId}</p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Credential'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;