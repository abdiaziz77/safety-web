import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Shield,
  Download,
  ChevronDown
} from 'lucide-react';

// Direct API URL
const API_BASE_URL = 'http://127.0.0.1:5000';

const AdminAnalytics = () => {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, 90days, 1year
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true); // Set refreshing state to true
      setLoading(true);
      
      // Add a 2-second delay before fetching data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch data with error handling for each endpoint
      const fetchReports = axios.get(`${API_BASE_URL}/api/reports/admin/reports`, { withCredentials: true })
        .then(response => {
          // Handle both array and object response formats
          return Array.isArray(response.data?.reports) ? response.data.reports : 
                 Array.isArray(response.data) ? response.data : [];
        })
        .catch(() => []);

      const fetchAlerts = axios.get(`${API_BASE_URL}/api/alerts/admin/alerts`, { withCredentials: true })
        .then(response => {
          // Handle both array and object response formats
          return Array.isArray(response.data?.alerts) ? response.data.alerts : 
                 Array.isArray(response.data) ? response.data : [];
        })
        .catch(() => []);

      const fetchUsers = axios.get(`${API_BASE_URL}/api/auth/users`, { withCredentials: true })
        .then(response => {
          // Handle both array and object response formats
          return Array.isArray(response.data?.users) ? response.data.users : 
                 Array.isArray(response.data) ? response.data : [];
        })
        .catch(() => []);

      const [reportsData, alertsData, usersData] = await Promise.all([
        fetchReports, fetchAlerts, fetchUsers
      ]);

      console.log('Analytics data loaded:', {
        reports: reportsData.length,
        alerts: alertsData.length,
        users: usersData.length
      });

      setReports(reportsData);
      setAlerts(alertsData);
      setUsers(usersData);
      
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false); // Set refreshing state to false
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data based on selected time range
  const filterDataByTimeRange = (data, dateField) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField] || item.timestamp || item.created_at || item.date);
      return itemDate >= startDate;
    });
  };

  // Memoized filtered data
  const filteredReports = useMemo(() => 
    filterDataByTimeRange(reports, 'created_at'), [reports, timeRange]);
  
  const filteredAlerts = useMemo(() => 
    filterDataByTimeRange(alerts, 'created_at'), [alerts, timeRange]);

  // Process data for visualizations using filtered data
  const totalReports = filteredReports.length;
  const totalAlerts = filteredAlerts.length;
  const activeAlerts = filteredAlerts.filter(alert => 
    alert.status === 'Active' || alert.status === 'Critical'
  ).length;
  const totalUsers = users.length;

  // Reports by status
  const statusCount = {};
  filteredReports.forEach(report => {
    const status = report.status || 'Unknown';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });
  const reportsByStatus = Object.entries(statusCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Alerts by severity
  const severityCount = {};
  filteredAlerts.forEach(alert => {
    const severity = alert.severity || 'Unknown';
    severityCount[severity] = (severityCount[severity] || 0) + 1;
  });
  const alertsBySeverity = Object.entries(severityCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Users by role
  const roleCount = {};
  users.forEach(user => {
    const role = user.role || 'user';
    roleCount[role] = (roleCount[role] || 0) + 1;
  });
  const usersByRole = Object.entries(roleCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Reports over time based on selected range
  const getDaysInRange = () => {
    switch (timeRange) {
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      case '1year': return 365;
      default: return 30;
    }
  };

  const getDateLabels = () => {
    const days = getDaysInRange();
    const now = new Date();
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(now.getDate() - (days - 1 - i));
      
      if (timeRange === '1year') {
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    });
  };

  const reportsOverTime = useMemo(() => {
    const days = getDaysInRange();
    const now = new Date();
    const dateLabels = getDateLabels();
    
    const reportsByDate = {};
    
    // Initialize with zeros
    dateLabels.forEach(label => {
      reportsByDate[label] = 0;
    });
    
    // Count reports for each date
    filteredReports.forEach(report => {
      const reportDate = new Date(report.created_at || report.timestamp || report.date);
      let label;
      
      if (timeRange === '1year') {
        label = reportDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      } else {
        label = reportDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (reportsByDate.hasOwnProperty(label)) {
        reportsByDate[label]++;
      }
    });
    
    return dateLabels.map(label => ({
      date: label,
      reports: reportsByDate[label]
    }));
  }, [filteredReports, timeRange]);

  // Calculate metrics
  const resolvedReports = filteredReports.filter(r => 
    r.status === 'Resolved' || r.status === 'Closed'
  ).length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  // Chart colors
  const COLORS = {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    gray: '#9CA3AF'
  };

  const statusColors = {
    'Pending': COLORS.warning,
    'In Progress': COLORS.info,
    'Resolved': COLORS.success,
    'Rejected': COLORS.danger,
    'Closed': COLORS.gray,
    'Unknown': COLORS.gray
  };

  const severityColors = {
    'Low': COLORS.success,
    'Medium': COLORS.warning,
    'High': COLORS.danger,
    'Critical': '#7C2D12',
    'Unknown': COLORS.gray
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading Analytics Dashboard...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait while we gather your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                <TrendingUp className="text-white" size={isMobile ? 24 : 32} />
              </div>
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Comprehensive insights and performance metrics</p>
            <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">
              Showing data for: {timeRange === '7days' ? 'Last 7 days' : 
                               timeRange === '30days' ? 'Last 30 days' : 
                               timeRange === '90days' ? 'Last 90 days' : 
                               'Last 1 year'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full md:w-auto gap-2">
            <div className="relative w-full md:w-auto">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-white/80 backdrop-blur-sm border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm w-full pr-8"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last 1 year</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button 
              onClick={fetchData}
              disabled={refreshing}
              className="bg-white/80 backdrop-blur-sm border-0 rounded-xl px-4 py-2 text-sm flex items-center justify-center shadow-sm hover:shadow-md transition-shadow w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <Download size={16} className="mr-2" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-100/50">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{totalReports}</h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Reports</p>
            <div className="mt-2 sm:mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((totalReports / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-orange-100/50">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{activeAlerts}</h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Active Alerts</p>
            <div className="mt-2 sm:mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((activeAlerts / Math.max(totalAlerts, 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-purple-100/50">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{totalUsers}</h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Registered Users</p>
            <div className="mt-2 sm:mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min((totalUsers / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 md:mb-8">
          {/* Reports Over Time */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Reports Over Time</h2>
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <AreaChart data={reportsOverTime}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: timeRange === '1year' || isMobile ? 10 : 12 }}
                  interval={timeRange === '1year' || isMobile ? 2 : 0}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reports" 
                  stroke={COLORS.primary} 
                  fill="url(#colorReports)" 
                  strokeWidth={2}
                  activeDot={{ r: isMobile ? 4 : 6, fill: COLORS.primary }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Report Status Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Report Status</h2>
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <PieChart>
                <Pie
                  data={reportsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => isMobile ? `${value}` : `${name}: ${value}`}
                  outerRadius={isMobile ? 80 : 100}
                  innerRadius={isMobile ? 40 : 60}
                  dataKey="value"
                >
                  {reportsByStatus.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={statusColors[entry.name] || COLORS.gray} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                />
                {!isMobile && <Legend />}
              </PieChart>
            </ResponsiveContainer>
            {isMobile && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {reportsByStatus.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: statusColors[entry.name] || COLORS.gray }}
                    ></div>
                    <span className="text-xs">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 md:mb-8">
          {/* Alert Severity Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Alert Severity</h2>
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <PieChart>
                <Pie
                  data={alertsBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => isMobile ? `${value}` : `${name}: ${value}`}
                  outerRadius={isMobile ? 80 : 100}
                  innerRadius={isMobile ? 40 : 60}
                  dataKey="value"
                >
                  {alertsBySeverity.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={severityColors[entry.name] || COLORS.gray} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                />
                {!isMobile && <Legend />}
              </PieChart>
            </ResponsiveContainer>
            {isMobile && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {alertsBySeverity.map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: severityColors[entry.name] || COLORS.gray }}
                    ></div>
                    <span className="text-xs">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Role Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">User Distribution</h2>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart data={usersByRole}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={COLORS.secondary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-sm mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">{resolutionRate}%</div>
              <p className="text-xs sm:text-sm text-gray-600">Report Resolution Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-1 sm:mb-2">
                {totalReports > 0 ? Math.round(totalReports / getDaysInRange() * 10) / 10 : 0}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Avg. Reports Per Day</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">
                {totalAlerts > 0 ? Math.round((activeAlerts / totalAlerts) * 100) : 0}%
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Active Alert Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;