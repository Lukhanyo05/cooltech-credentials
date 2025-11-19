import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      console.log('🔑 Login response:', response.data); // Debug log
      
      if (response.data.token) {
        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('🔑 Token stored in localStorage:', !!localStorage.getItem('token')); // Debug log
        console.log('🔑 User data stored:', localStorage.getItem('user')); // Debug log
        
        // Update auth context
        login(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('🔑 Login error:', err); // Debug log
      toast.error(err.response?.data?.message || 'Login failed');
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

  const handleDemoLogin = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Demo Credentials:</h3>
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('admin.user@cooltech.com', 'password123')}
              className="w-full text-left text-xs text-yellow-700 hover:text-yellow-800 p-2 hover:bg-yellow-100 rounded"
            >
              <strong>Admin:</strong> admin.user@cooltech.com / password123
            </button>
            <button
              onClick={() => handleDemoLogin('manager.user@cooltech.com', 'password123')}
              className="w-full text-left text-xs text-yellow-700 hover:text-yellow-800 p-2 hover:bg-yellow-100 rounded"
            >
              <strong>Manager:</strong> manager.user@cooltech.com / password123
            </button>
            <button
              onClick={() => handleDemoLogin('normal.user@cooltech.com', 'password123')}
              className="w-full text-left text-xs text-yellow-700 hover:text-yellow-800 p-2 hover:bg-yellow-100 rounded"
            >
              <strong>User:</strong> normal.user@cooltech.com / password123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;