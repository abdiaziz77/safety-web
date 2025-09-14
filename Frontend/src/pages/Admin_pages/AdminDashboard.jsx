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
  AlertCircle,
  MapPin,
  Eye,
  ChevronRight,
  Search,
  Filter,
  Download,
  MoreVertical
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
  const [showLoader, setShowLoader] = useState(true);
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
      setShowLoader(true);
      setError(null);
      setAuthError(false);
      setPermissionError(false);
      
      if (!currentAdmin || currentAdmin.role !== 'admin') {
        setPermissionError(true);
        setError('You do not have permission to access this resource.');
        setLoading(false);
        setShowLoader(false);
        return;
      }
      
      let reportsData = [];
      let alertsData = [];
      let usersData = [];

      try {
        const reportsRes = await api.get('/api/reports/admin/reports');
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
      setTimeout(() => {
        setLoading(false);
        setShowLoader(false);
      }, 2000);
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
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-gray-800';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
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

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center mt-3 text-xs ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value > 0 ? (
            <TrendingUp size={14} className="mr-1" />
          ) : (
            <TrendingUp size={14} className="mr-1 transform rotate-180" />
          )}
          <span>{trend.value}% {trend.label}</span>
        </div>
      )}
    </div>
  );

  if (authLoading || showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading Dashboard...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait while we gather your data</p>
        </div>
      </div>
    );
  }

  if (!currentAdmin || currentAdmin.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
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

  if (permissionError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <Shield className="text-blue-600 mr-3" size={28} />
            {getGreeting()}, {currentAdmin.name || currentAdmin.email?.split('@')[0] || 'Admin'}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Welcome to your safety management dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm md:text-base"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && !authError && !permissionError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-sm md:text-base">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-red-700 hover:text-red-900 text-sm md:text-base"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard 
          title="Total Reports" 
          value={stats.totalReports} 
          icon={<FileText className="text-blue-600" size={20} />} 
          color="text-blue-600"
          trend={{ value: 12, label: 'from last week' }}
        />
        <StatCard 
          title="Active Alerts" 
          value={stats.activeAlerts} 
          icon={<AlertTriangle className="text-orange-600" size={20} />} 
          color="text-orange-600"
          trend={{ value: -3, label: 'from yesterday' }}
        />
        <StatCard 
          title="Resolved Reports" 
          value={stats.resolvedReports} 
          icon={<CheckCircle className="text-green-600" size={20} />} 
          color="text-green-600"
          trend={{ value: 8, label: 'from last week' }}
        />
        <StatCard 
          title="Registered Users" 
          value={stats.totalUsers} 
          icon={<Users className="text-purple-600" size={20} />} 
          color="text-purple-600"
          trend={{ value: 5, label: 'this month' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Reports
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Filter size={16} />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Download size={16} />
                </button>
                <Link to="/admin/dashboard/reports" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  View all <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentReports.length > 0 ? (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm truncate">{report.title || 'Untitled Report'}</h3>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <MapPin size={12} className="mr-1" />
                            <span>{report.location || 'No location'}</span>
                            <span className="mx-2">•</span>
                            <Clock size={12} className="mr-1" />
                            <span>2 hours ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status || 'Unknown'}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-blue-600 transition-opacity">
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500">No reports found</p>
                  <p className="text-gray-400 text-sm mt-1">All reports will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Active Alerts
              </h2>
              <Link to="/admin/dashboard/alerts" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            <div className="p-6">
              {activeAlerts.length > 0 ? (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800 text-sm truncate">{alert.title || 'Untitled Alert'}</h3>
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-blue-600 transition-opacity">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 truncate">{alert.affected_area || alert.location || 'No location specified'}</p>
                      <div className="flex gap-2 flex-wrap">
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
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500">No alerts found</p>
                  <p className="text-gray-400 text-sm mt-1">All active alerts will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
        {/* Registered Users */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Registered Users
              </h2>
              <Link to="/admin/dashboard/usermanagement" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                Manage Users <ChevronRight size={16} />
              </Link>
            </div>
            <div className="p-6">
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <User size={14} className="text-blue-600" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </span>
                                <p className="text-xs text-gray-500 sm:hidden">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 hidden sm:table-cell">
                            {user.email}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500">No users found</p>
                  <p className="text-gray-400 text-sm mt-1">All registered users will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <Link 
                to="/admin/dashboard/alerts" 
                className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg mr-3">
                    <AlertTriangle size={16} />
                  </div>
                  <span>Send Emergency Alert</span>
                </div>
                <Plus size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/admin/dashboard/analytics" 
                className="flex items-center justify-between p-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
                    <BarChart2 size={16} />
                  </div>
                  <span>View Analytics</span>
                </div>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="#" 
                className="flex items-center justify-between p-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors group"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3 group-hover:bg-blue-100 transition-colors">
                    <Settings size={16} />
                  </div>
                  <span>System Settings</span>
                </div>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mt-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="p-2 bg-green-100 rounded-full mr-4">
                    <CheckCircle size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Report #1234 was resolved</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-full mr-4">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-orange-100 rounded-full mr-4">
                    <AlertTriangle size={14} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New alert was triggered</p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;