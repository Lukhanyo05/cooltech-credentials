import React, { useState } from 'react';
import { credentialsService } from '../../services/credentialsService.js';

const AddCredentialModal = ({ isOpen, onClose, divisionId, onCredentialAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    website: '',
    username: '', // CHANGED BACK: Backend expects 'username' not 'email'
    password: '',
    description: '' // CHANGED: Backend expects 'description' not 'notes'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔧 AddCredentialModal - Sending data:', {
        ...formData,
        divisionId: divisionId // CHANGED: Backend expects 'divisionId' not 'division'
      });

      // USE REAL API CALL - REMOVE DEMO CODE
      await credentialsService.createCredential({
        ...formData,
        divisionId: divisionId // CHANGED: Send 'divisionId' not 'division'
      });
      
      console.log('✅ Credential added successfully');
      onCredentialAdded();
      onClose();
      setFormData({ title: '', website: '', username: '', password: '', description: '' });
      
    } catch (err) {
      console.error('❌ AddCredentialModal - Error:', err);
      setError(err.response?.data?.message || 'Failed to add credential');
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

  const handleClose = () => {
    setFormData({ title: '', website: '', username: '', password: '', description: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Credential</h3>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                  Username * {/* CHANGED BACK: Backend expects 'username' */}
                </label>
                <input
                  type="text" // CHANGED BACK: from 'email' to 'text'
                  name="username" // CHANGED BACK: from 'email' to 'username'
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="admin_user" // Updated placeholder
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
                  Description {/* CHANGED: Backend expects 'description' */}
                </label>
                <textarea
                  name="description" // CHANGED: from 'notes' to 'description'
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Additional information about this credential..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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

export default AddCredentialModal;