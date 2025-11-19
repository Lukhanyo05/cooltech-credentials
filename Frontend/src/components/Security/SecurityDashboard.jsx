import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SecurityDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  // Redirect if user is not manager or admin
  useEffect(() => {
    if (user && user.role === 'user') {
      toast.error('Access denied. Manager or Admin role required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Mock security data - in real app, this would come from API
  useEffect(() => {
    if (user && (user.role === 'manager' || user.role === 'admin')) {
      loadSecurityData();
    }
  }, [user, timeRange]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData = generateMockSecurityData(timeRange);
        setSecurityData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security data');
      setLoading(false);
    }
  };

  const generateMockSecurityData = (range) => {
    const baseData = {
      totalLogins: Math.floor(Math.random() * 500) + 200,
      failedAttempts: Math.floor(Math.random() * 20) + 5,
      credentialAccess: Math.floor(Math.random() * 300) + 100,
      adminActions: Math.floor(Math.random() * 50) + 10,
      activeUsers: Math.floor(Math.random() * 15) + 5,
      securityScore: Math.floor(Math.random() * 30) + 70, // 70-100
    };

    // Adjust based on time range
    const multiplier = range === '7d' ? 1 : range === '30d' ? 4 : 12;
    
    return {
      ...baseData,
      totalLogins: baseData.totalLogins * multiplier,
      failedAttempts: baseData.failedAttempts * multiplier,
      credentialAccess: baseData.credentialAccess * multiplier,
      adminActions: baseData.adminActions * multiplier,
      recentActivities: [
        {
          id: 1,
          user: 'admin.user@cooltech.com',
          action: 'User role changed',
          target: 'manager.user@cooltech.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
          ip: '192.168.1.100'
        },
        {
          id: 2,
          user: 'manager.user@cooltech.com',
          action: 'Credential updated',
          target: 'WordPress Admin',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          ip: '192.168.1.150'
        },
        {
          id: 3,
          user: 'normal.user@cooltech.com',
          action: 'Failed login attempt',
          target: 'N/A',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          ip: '192.168.1.200'
        },
        {
          id: 4,
          user: 'admin.user@cooltech.com',
          action: 'User assigned to division',
          target: 'IT Division',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
          ip: '192.168.1.100'
        }
      ],
      riskAlerts: [
        {
          id: 1,
          type: 'warning',
          message: 'Multiple failed login attempts from same IP',
          severity: 'medium',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: 2,
          type: 'info',
          message: 'New user registered in system',
          severity: 'low',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
        }
      ]
    };
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need Manager or Admin privileges to access the Security Dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor security status and access patterns</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={loadSecurityData}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Security Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Score</h3>
          <div className={`text-3xl font-bold ${getSecurityScoreColor(securityData.securityScore)}`}>
            {securityData.securityScore}/100
          </div>
          <p className="text-gray-600 text-sm mt-2">Overall system security rating</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Logins</h3>
          <div className="text-3xl font-bold text-blue-600">
            {securityData.totalLogins.toLocaleString()}
          </div>
          <p className="text-gray-600 text-sm mt-2">Successful authentication attempts</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed Attempts</h3>
          <div className="text-3xl font-bold text-red-600">
            {securityData.failedAttempts}
          </div>
          <p className="text-gray-600 text-sm mt-2">Unsuccessful login attempts</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
          <div className="text-3xl font-bold text-green-600">
            {securityData.activeUsers}
          </div>
          <p className="text-gray-600 text-sm mt-2">Currently active in system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {securityData.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.action} • {activity.target}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        <div>{new Date(activity.timestamp).toLocaleDateString()}</div>
                        <div>{new Date(activity.timestamp).toLocaleTimeString()}</div>
                        <div className="text-gray-400">{activity.ip}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {securityData.riskAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${
                    alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-900 mt-1">
                          {alert.message}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Credential Access</h3>
          <div className="text-2xl font-bold text-purple-600">
            {securityData.credentialAccess.toLocaleString()}
          </div>
          <p className="text-gray-600 text-sm mt-2">Total credential views and accesses</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
          <div className="text-2xl font-bold text-orange-600">
            {securityData.adminActions}
          </div>
          <p className="text-gray-600 text-sm mt-2">Administrative changes made</p>
        </div>
      </div>

      {/* Security Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Security Best Practices</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Regularly review user access and permissions</li>
          <li>• Monitor for unusual login patterns</li>
          <li>• Ensure all users follow password policies</li>
          <li>• Review security alerts daily</li>
          <li>• Keep system and dependencies updated</li>
        </ul>
      </div>
    </div>
  );
};

export default SecurityDashboard;