import React, { useState, useEffect } from 'react';
import { credentialsService } from '../../services/credentialsService.js';

const CredentialsList = ({ divisionId }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCredentials();
  }, [divisionId]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      // For demo - simulate API call
      setTimeout(() => {
        setCredentials([
          {
            _id: '1',
            title: 'WordPress Admin',
            website: 'https://cooltech.com/wp-admin',
            username: 'admin@cooltech.com',
            password: 'encrypted-password'
          },
          {
            _id: '2', 
            title: 'Server SSH',
            website: 'ssh://server.cooltech.com',
            username: 'ubuntu',
            password: 'encrypted-password'
          }
        ]);
        setError('');
        setLoading(false);
      }, 1000);
      
      // In real app, use this:
      // const data = await credentialsService.getCredentials(divisionId);
      // setCredentials(data);
    } catch (err) {
      setError('Failed to load credentials');
      console.error('Error loading credentials:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (credentialId) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        await credentialsService.deleteCredential(credentialId);
        loadCredentials(); // Reload the list
      } catch (err) {
        setError('Failed to delete credential');
      }
    }
  };

  if (loading) return (
    <div className="bg-white shadow rounded-lg p-8 text-center">
      <div className="animate-pulse">Loading credentials...</div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <div className="text-red-700">{error}</div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Credentials Repository</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Login details for various services in this division
        </p>
      </div>
      
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
                    <a 
                      href={credential.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-900 truncate block max-w-xs"
                    >
                      {credential.website}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{credential.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      View
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(credential._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CredentialsList;