import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Edit,
  Trash2,
  Bell,
  Filter,
  Search,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

function AdminAlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notifyAlert, setNotifyAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'All' 
        ? '/api/alerts/admin/alerts' 
        : `/api/alerts/admin/alerts?status=${filterStatus}`;
      
      const response = await axios.get(url);
      setAlerts(response.data.alerts || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId) => {
    try {
      await axios.delete(`/api/alerts/admin/alerts/${alertId}`);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError('Failed to delete alert');
    }
  };

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      const response = await axios.patch(
        `/api/alerts/admin/alerts/${alertId}/status`,
        { status: newStatus }
      );
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? response.data : alert
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update alert status');
    }
  };

  const handleNotify = async (alertId) => {
    try {
      await axios.post(`/api/alerts/admin/alerts/${alertId}/notify`);
      setNotifyAlert(alertId);
      setTimeout(() => setNotifyAlert(null), 3000);
    } catch (err) {
      console.error('Error sending notifications:', err);
      setError('Failed to send notifications');
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Resolved': return 'bg-blue-100 text-blue-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-red-700">{error}</p>
        <button onClick={() => setError(null)} className="ml-auto">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Alerts</h2>
        <a
          href="/admin/dashboard/alertsform"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          New Alert
        </a>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2 flex-1">
          <Search className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search alerts..."
            className="w-full outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 min-w-[200px]">
          <Filter className="text-gray-500 mr-2" />
          <select
            className="outline-none bg-transparent w-full"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Critical">Critical</option>
            <option value="Inactive">Inactive</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Title</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Severity</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Location</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((alert) => (
              <tr key={alert.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-1">{alert.message}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {alert.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    {getSeverityIcon(alert.severity)}
                    <span className="capitalize">{alert.severity}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={alert.status}
                    onChange={(e) => handleStatusChange(alert.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-none ${getStatusBadgeClass(alert.status)}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Critical">Critical</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {alert.location || 'N/A'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm text-gray-600">
                    {new Date(alert.start_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/admin/alerts/edit/${alert.id}`}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </a>
                    
                    <button
                      onClick={() => handleNotify(alert.id)}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Send Notifications"
                      disabled={notifyAlert === alert.id}
                    >
                      {notifyAlert === alert.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(alert.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No alerts found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this alert? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAlertsList;