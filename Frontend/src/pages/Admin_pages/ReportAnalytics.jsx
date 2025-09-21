import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Calendar, Filter, Download, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle 
} from 'lucide-react';

// ✅ Axios global setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://127.0.0.1:5000";

const statusColors = {
  'Pending': '#ff9800',
  'In Progress': '#2196f3',
  'Resolved': '#4caf50',
  'Rejected': '#f44336',
  'Closed': '#9e9e9e'
};

const ReportAnalytics = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let url = '/api/reports/admin/reports';
      if (statusFilter && statusFilter !== 'All') {
        url += `?status=${statusFilter}`;
      }
      const response = await axios.get(url);
      const reportsData = response.data.reports || [];
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process data for charts
  const getStatusDistribution = () => {
    const statusCount = {
      'Pending': 0,
      'In Progress': 0,
      'Resolved': 0,
      'Rejected': 0,
      'Closed': 0
    };

    reports.forEach(report => {
      if (statusCount.hasOwnProperty(report.status)) {
        statusCount[report.status]++;
      }
    });

    return Object.keys(statusCount).map(status => ({
      name: status,
      value: statusCount[status],
      color: statusColors[status]
    }));
  };

  const getReportsByType = () => {
    const typeCount = {};
    
    reports.forEach(report => {
      const type = report.report_type || 'Unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return Object.keys(typeCount).map(type => ({
      name: type,
      value: typeCount[type]
    }));
  };

  const getMonthlyTrend = () => {
    // Generate last 6 months data
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      // Count reports for this month
      const count = reports.filter(report => {
        if (!report.created_at) return false;
        const reportDate = new Date(report.created_at);
        return reportDate.getMonth() === date.getMonth() && 
               reportDate.getFullYear() === date.getFullYear();
      }).length;
      
      months.push({
        name: `${monthName} ${year}`,
        reports: count
      });
    }
    
    return months;
  };

  const getResolutionTimeData = () => {
    // This is a mockup - in a real app you would calculate actual resolution times
    return [
      { name: 'Jan', days: 5.2 },
      { name: 'Feb', days: 4.8 },
      { name: 'Mar', days: 6.1 },
      { name: 'Apr', days: 5.5 },
      { name: 'May', days: 4.2 },
      { name: 'Jun', days: 3.9 },
    ];
  };

  const statusDistribution = getStatusDistribution();
  const reportsByType = getReportsByType();
  const monthlyTrend = getMonthlyTrend();
  const resolutionTimeData = getResolutionTimeData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Report Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights into your safety reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center">
          <Calendar className="text-gray-500 mr-2" size={18} />
          <select 
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div className="flex items-center">
          <Filter className="text-gray-500 mr-2" size={18} />
          <select 
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <button className="ml-auto flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
          <Download size={16} className="mr-2" />
          Export Data
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              <AlertCircle size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Reports</p>
              <p className="text-2xl font-bold">{reports.length}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp size={14} className="text-green-500 mr-1" />
            <span className="text-green-500">+12%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-orange-100 mr-3">
              <Clock size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold">
                {statusDistribution.find(s => s.name === 'Pending')?.value || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-500">Requiring attention</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 mr-3">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Resolved</p>
              <p className="text-2xl font-bold">
                {statusDistribution.find(s => s.name === 'Resolved')?.value || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-500">Successfully handled</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 mr-3">
              <XCircle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Rejected</p>
              <p className="text-2xl font-bold">
                {statusDistribution.find(s => s.name === 'Rejected')?.value || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-500">Not valid reports</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Report Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Reports Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="reports" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Type */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Reports by Type</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportsByType}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Average Resolution Time (Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={resolutionTimeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="days" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.slice(0, 5).map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{report.id?.slice(0, 8)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.title || 'No title'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.report_type || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      style={{ 
                        backgroundColor: `${statusColors[report.status]}20`,
                        color: statusColors[report.status]
                      }}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalytics;