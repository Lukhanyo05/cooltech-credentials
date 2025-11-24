import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const CredentialList = ({ divisionId, divisionName }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCredentials();
  }, [divisionId]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/credentials/division/${divisionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCredentials(response.data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (credentialId) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/credentials/${credentialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Credential deleted successfully');
      fetchCredentials();
    } catch (error) {
      console.error('Error deleting credential:', error);
      toast.error('Failed to delete credential');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading credentials...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Credentials for {divisionName}</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Add Credential
        </button>
      </div>

      {showAddForm && (
        <AddCredentialForm
          divisionId={divisionId}
          onSuccess={() => {
            setShowAddForm(false);
            fetchCredentials();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingCredential && (
        <EditCredentialForm
          credential={editingCredential}
          onSuccess={() => {
            setEditingCredential(null);
            fetchCredentials();
          }}
          onCancel={() => setEditingCredential(null)}
        />
      )}

      {credentials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No credentials found for this division.
        </div>
      ) : (
        <div className="space-y-4">
          {credentials.map((credential) => (
            <div key={credential._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{credential.title}</h4>
                  <p className="text-gray-600">
                    <strong>Username:</strong> {credential.username}
                  </p>
                  <p className="text-gray-600">
                    <strong>URL:</strong>{' '}
                    {credential.url ? (
                      <a
                        href={credential.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {credential.url}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                  {credential.notes && (
                    <p className="text-gray-600 mt-2">
                      <strong>Notes:</strong> {credential.notes}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Created by: {credential.createdBy.username}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  {(user.role === 'management' || user.role === 'admin') && (
                    <button
                      onClick={() => setEditingCredential(credential)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(credential._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CredentialList;