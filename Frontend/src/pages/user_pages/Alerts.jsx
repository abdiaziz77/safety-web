import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Search,
  Clock,
  MapPin,
  ChevronRight,
  Loader2,
  Filter,
  X,
  User,
  Calendar,
  Navigation,
  Shield,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get("/api/alerts", {
          withCredentials: true, // Send session cookie
        });
        // ✅ Ensure we always set an array
        setAlerts(res.data.alerts || []);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to load alerts");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [navigate]);

  const filteredAlerts = (alerts || []).filter((alert) => {
    const matchesSearch =
      alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType ? alert.type === filterType : true;
    return matchesSearch && matchesFilter;
  });

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAlert(null);
  };

  const AlertDetailModal = ({ alert, onClose }) => {
    if (!alert) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                alert.type === "Emergency" ? "bg-red-100 text-red-600" :
                alert.type === "Weather" ? "bg-blue-100 text-blue-600" :
                alert.type === "Security" ? "bg-orange-100 text-orange-600" :
                "bg-gray-100 text-gray-600"
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">{alert.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Alert Message */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Alert Message</h3>
              <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{alert.message}</p>
            </div>

            {/* Alert Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issued</p>
                  <p className="font-medium">
                    {new Date(alert.start_date).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alert Type</p>
                  <p className="font-medium">{alert.type || "General"}</p>
                </div>
              </div>

              {alert.affected_area && (
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Affected Area</p>
                    <p className="font-medium">{alert.affected_area}</p>
                  </div>
                </div>
              )}

              {alert.severity && (
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Severity Level</p>
                    <p className="font-medium capitalize">{alert.severity}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            {alert.additional_info && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h3>
                <p className="text-gray-700">{alert.additional_info}</p>
              </div>
            )}

            {/* Instructions */}
            {alert.instructions && (
              <div>
                <h3 className="textsm font-medium text-gray-500 mb-2">Recommended Actions</h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-yellow-700">{alert.instructions}</p>
                </div>
              </div>
            )}

            {/* Source Information */}
            {alert.source && (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>Issued by: {alert.source}</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end p-6 border-t gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Handle alert action (acknowledge, share, etc.)
                console.log("Action taken on alert:", alert.id);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Acknowledge Alert
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-100">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100">
      {/* Header Section - Outside the box */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-3 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">Active Alerts</h1>
          </div>
          <p className="text-blue-100 opacity-90">
            Stay informed about important notifications and emergencies in your area
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-6 -mt-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 flex-1 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <Search className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search alerts by title or description..."
                className="w-full outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <Filter className="text-gray-500 mr-2" />
              <select
                className="outline-none bg-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Alert Types</option>
                <option value="General">General</option>
                <option value="Emergency">Emergency</option>
                <option value="Weather">Weather</option>
                <option value="Security">Security</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600 text-sm">
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </p>
            {filterType && (
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                Filtered by: {filterType}
              </span>
            )}
          </div>

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No alerts found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || filterType 
                  ? "Try adjusting your search or filter criteria" 
                  : "No active alerts at this time"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 hover:border-blue-100 cursor-pointer"
                  onClick={() => handleViewAlert(alert)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          alert.type === "Emergency" ? "bg-red-100 text-red-600" :
                          alert.type === "Weather" ? "bg-blue-100 text-blue-600" :
                          alert.type === "Security" ? "bg-orange-100 text-orange-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">{alert.title}</h2>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            alert.type === "Emergency" ? "bg-red-500 text-white" :
                            alert.type === "Weather" ? "bg-blue-500 text-white" :
                            alert.type === "Security" ? "bg-orange-500 text-white" :
                            "bg-gray-500 text-white"
                          }`}>
                            {alert.type || "General"}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">{alert.message}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(alert.start_date).toLocaleString()}
                        </span>
                        {alert.affected_area && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {alert.affected_area}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-3 md:mt-0 md:ml-4 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAlert(alert);
                      }}
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Alert Detail Modal */}
          {showModal && (
            <AlertDetailModal 
              alert={selectedAlert} 
              onClose={closeModal} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertsList;