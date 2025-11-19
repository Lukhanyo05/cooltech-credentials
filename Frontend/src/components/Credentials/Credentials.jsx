import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { credentialsService } from '../../services/credentialsService.js';
import { toast } from 'react-toastify';

const Credentials = () => {
  const { divisionId } = useParams();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    website: '',
    username: '',
    password: '',
    notes: ''
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    website: '',
    username: '',
    password: '',
    notes: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    loadCredentials();
  }, [divisionId]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      // For demo - simulate API call with mock data
      setTimeout(() => {
        const mockCredentials = [
          {
            _id: '1',
            title: 'WordPress Admin',
            website: 'https://cooltech.com/wp-admin',
            username: 'admin@cooltech.com',
            password: 'supersecret123',
            notes: 'Main company website admin panel',
            division: divisionId
          },
          {
            _id: '2',
            title: 'Server SSH Access',
            website: 'ssh://server.cooltech.com',
            username: 'ubuntu',
            password: 'serverpass123',
            notes: 'Production server SSH access',
            division: divisionId
          },
          {
            _id: '3',
            title: 'Database Admin',
            website: 'https://phpmyadmin.cooltech.com',
            username: 'dbadmin',
            password: 'dbpassword123',
            notes: 'MySQL database administration',
            division: divisionId
          }
        ];
        setCredentials(mockCredentials);
        setLoading(false);
      }, 1000);
    } catch (err) {
      toast.error('Failed to load credentials');
      setLoading(false);
    }
  };

  const handleAddCredential = async (e) => {
    e.preventDefault();
    try {
      const newCredential = {
        _id: Date.now().toString(),
        ...formData,
        division: divisionId
      };
      setCredentials(prev => [...prev, newCredential]);
      toast.success('Credential added successfully');
      setIsModalOpen(false);
      setFormData({ title: '', website: '', username: '', password: '', notes: '' });
    } catch (err) {
      toast.error('Failed to add credential');
    }
  };

  const handleEditCredential = async (e) => {
    e.preventDefault();
    try {
      setCredentials(prev => 
        prev.map(cred => 
          cred._id === selectedCredential._id 
            ? { ...cred, ...editFormData }
            : cred
        )
      );
      toast.success('Credential updated successfully');
      setIsEditModalOpen(false);
      setSelectedCredential(null);
      setEditFormData({ title: '', website: '', username: '', password: '', notes: '' });
    } catch (err) {
      toast.error('Failed to update credential');
    }
  };

  const handleDelete = async (credentialId) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        setCredentials(prev => prev.filter(cred => cred._id !== credentialId));
        toast.success('Credential deleted successfully');
      } catch (err) {
        toast.error('Failed to delete credential');
      }
    }
  };

  const handleView = (credential) => {
    setSelectedCredential(credential);
    setIsViewModalOpen(true);
    setShowPassword(false); // Reset password visibility
  };

  const handleEdit = (credential) => {
    setSelectedCredential(credential);
    setEditFormData({
      title: credential.title,
      website: credential.website,
      username: credential.username,
      password: credential.password,
      notes: credential.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {divisionId?.replace(/-/g, ' ').toUpperCase()} - Credentials
        </h1>
        <p className="text-gray-600 mt-2">
          Manage login credentials for this division
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Add New Credential
        </button>
      </div>

      {/* Credentials list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {credentials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials found</h3>
            <p className="text-gray-500">Get started by adding your first credential to this division.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {credentials.map((credential) => (
                  <tr key={credential._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{credential.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {credential.website ? (
                        <a 
                          href={credential.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-900 truncate block max-w-xs"
                        >
                          {credential.website}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No website</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{credential.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button 
                        onClick={() => handleView(credential)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      
                      {/* Only show Edit button for Managers and Admins */}
                      {(user.role === 'manager' || user.role === 'admin') && (
                        <button 
                          onClick={() => handleEdit(credential)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Edit
                        </button>
                      )}
                      
                      {/* Only show Delete button for Managers and Admins */}
                      {(user.role === 'manager' || user.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(credential._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Credential Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Credential</h3>
              
              <form onSubmit={handleAddCredential}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., WordPress Admin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="username or email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Additional information..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Add Credential
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced View Credential Modal */}
      {isViewModalOpen && selectedCredential && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Credential Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                    {selectedCredential.title}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                    {selectedCredential.website || 'No website'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                      {selectedCredential.username}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCredential.username);
                        toast.success('Username copied to clipboard!');
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 font-mono">
                      {showPassword ? selectedCredential.password : '••••••••'}
                    </div>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCredential.password);
                        toast.success('Password copied to clipboard!');
                      }}
                      className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 min-h-[80px]">
                    {selectedCredential.notes || 'No notes'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedCredential(null);
                    setShowPassword(false);
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

      {/* Edit Credential Modal */}
      {isEditModalOpen && selectedCredential && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Credential</h3>
              
              <form onSubmit={handleEditCredential}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={editFormData.title}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={editFormData.website}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={editFormData.username}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={editFormData.password}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows="3"
                      value={editFormData.notes}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedCredential(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Update Credential
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credentials;