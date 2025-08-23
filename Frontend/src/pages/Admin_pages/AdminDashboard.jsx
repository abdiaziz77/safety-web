import React, { useEffect, useState, useContext } from 'react';
import { 
  Shield,
  AlertTriangle,
  FileText,
  CheckCircle,
  Users,
  Plus,
  BarChart2,
  Settings,
  TrendingUp,
  Clock,
  User,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:5000';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    activeAlerts: 0,
    resolvedReports: 0,
    pendingReports: 0,
    totalUsers: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const navigate = useNavigate();
  const { user: currentAdmin, loading: authLoading } = useAuth();

  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(false);
      setPermissionError(false);
      
      if (!currentAdmin || currentAdmin.role !== 'admin') {
        setPermissionError(true);
        setError('You do not have permission to access this resource.');
        setLoading(false);
        return;
      }
      
      let reportsData = [];
      let alertsData = [];
      let usersData = [];

      try {
        const reportsRes = await api.get('/api/reports/admin/reports');
        // Handle both array and object response formats
        reportsData = Array.isArray(reportsRes.data?.reports) ? reportsRes.data.reports : 
                     Array.isArray(reportsRes.data) ? reportsRes.data : [];
        console.log('Reports data:', reportsData);
      } catch (err) {
        console.error('Error fetching reports:', err);
        if (err.response?.status === 401) throw new Error('auth');
        if (err.response?.status === 403) throw new Error('permission');
      }

      try {
        const alertsRes = await api.get('/api/alerts/admin/alerts');
        // Handle both array and object response formats
        alertsData = Array.isArray(alertsRes.data?.alerts) ? alertsRes.data.alerts : 
                    Array.isArray(alertsRes.data) ? alertsRes.data : [];
        console.log('Alerts data:', alertsData);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        if (err.response?.status === 401) throw new Error('auth');
        if (err.response?.status === 403) throw new Error('permission');
      }

      try {
        let usersRes;
        try {
          usersRes = await api.get('/api/auth/users');
        } catch (firstErr) {
          console.log('First users endpoint failed, trying alternative...');
          usersRes = await api.get('/api/admin/users');
        }
        
        // Handle both array and object response formats
        usersData = Array.isArray(usersRes.data?.users) ? usersRes.data.users : 
                   Array.isArray(usersRes.data) ? usersRes.data : [];
        console.log('Users data:', usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        if (err.response?.status === 401) throw new Error('auth');
        if (err.response?.status === 403) throw new Error('permission');
        usersData = [];
      }

      // Process reports data
      setRecentReports(reportsData.slice(0, 5));
      
      // Calculate report stats
      const totalReports = reportsData.length;
      const resolvedReports = reportsData.filter(r => r.status === 'Resolved').length;
      const pendingReports = reportsData.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;

      // Process alerts data
      setActiveAlerts(alertsData.slice(0, 5));
      const activeAlertsCount = alertsData.filter(a => 
        a.status === 'Active' || a.status === 'Critical'
      ).length;

      // Process users data safely
      let safeUsersData = [];
      
      if (usersData.length > 0) {
        safeUsersData = usersData.map(user => ({
          id: user.id || user._id || 'unknown',
          firstName: user.firstName || user.first_name || user.name?.split(' ')[0] || 'Unknown',
          lastName: user.lastName || user.last_name || user.name?.split(' ')[1] || 'User',
          email: user.email || 'no-email@example.com',
          role: user.role || 'user',
          phone: user.phone || ''
        }));
      }
      
      setUsers(safeUsersData.slice(0, 5));

      // Update stats
      setStats({
        totalReports,
        activeAlerts: activeAlertsCount,
        resolvedReports,
        pendingReports,
        totalUsers: safeUsersData.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.message === 'auth') {
        setAuthError(true);
        setError('Authentication failed. Please log in again.');
      } else if (error.message === 'permission') {
        setPermissionError(true);
        setError('You do not have permission to access this resource.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, currentAdmin]);

  const handleRetry = () => {
    fetchData();
  };

  const handleLogin = () => {
    navigate('/admin/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 flex items-center transition-all duration-300 hover:shadow-lg hover:translate-y-1 ${color}`}>
      <div className="mr-4 p-3 rounded-full bg-blue-50">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentAdmin || currentAdmin.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need to be logged in as an admin to access this dashboard.</p>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Shield className="text-blue-600 mr-3" size={32} />
            {getGreeting()}, {currentAdmin.name || currentAdmin.email?.split('@')[0] || 'Admin'}
          </h1>
          <p className="text-gray-600 mt-2">Welcome to your safety management dashboard</p>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && !authError && !permissionError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex justify-between items-center">
          <p>{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-red-700 hover:text-red-900"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Reports" 
          value={stats.totalReports} 
          icon={<FileText className="text-blue-600" size={24} />} 
          color="border-l-4 border-blue-500"
        />
        <StatCard 
          title="Active Alerts" 
          value={stats.activeAlerts} 
          icon={<AlertTriangle className="text-orange-600" size={24} />} 
          color="border-l-4 border-orange-500"
        />
        <StatCard 
          title="Resolved Reports" 
          value={stats.resolvedReports} 
          icon={<CheckCircle className="text-green-600" size={24} />} 
          color="border-l-4 border-green-500"
        />
        <StatCard 
          title="Registered Users" 
          value={stats.totalUsers} 
          icon={<Users className="text-purple-600" size={24} />} 
          color="border-l-4 border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileText className="text-blue-600 mr-2" size={20} />
                Recent Reports
              </h2>
              <Link to="/admin/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="p-6">
              {recentReports.length > 0 ? (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <div>
                        <h3 className="font-medium text-gray-800">{report.title || 'Untitled Report'}</h3>
                        <p className="text-sm text-gray-600">{report.location || 'No location'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status || 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reports found</p>
              )}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <AlertTriangle className="text-orange-600 mr-2" size={20} />
                Active Alerts
              </h2>
              <Link to="/admin/alerts" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="p-6">
              {activeAlerts.length > 0 ? (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
                      <h3 className="font-medium text-gray-800">{alert.title || 'Untitled Alert'}</h3>
                      <p className="text-sm text-gray-600 mb-2">{alert.affected_area || alert.location || 'No location specified'}</p>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity || 'Unknown'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAlertStatusColor(alert.status)}`}>
                          {alert.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No alerts found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Registered Users */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Users className="text-purple-600 mr-2" size={20} />
                Registered Users
              </h2>
              <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Manage Users
              </Link>
            </div>
            <div className="p-6">
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <User size={14} className="text-blue-600" />
                            </div>
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Settings className="text-gray-600 mr-2" size={20} />
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <Link 
                to="/admin/alerts/new" 
                className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Send Emergency Alert</span>
                <Plus size={18} />
              </Link>
              <Link 
                to="/admin/analytics" 
                className="flex items-center justify-between p-4 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <span>View Analytics</span>
                <TrendingUp size={18} />
              </Link>
              <Link 
                to="/admin/settings" 
                className="flex items-center justify-between p-4 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <span>System Settings</span>
                <Settings size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;