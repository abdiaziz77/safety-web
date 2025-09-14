import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Loader2,
  X,
  User,
  Calendar,
  Shield,
  Bell,
  Megaphone,
  Sparkles,
  CheckCircle,
  History,
  Zap,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [resolvedAlerts, setResolvedAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [newAlerts, setNewAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // In a real application, these would be actual API endpoints
        const [liveRes, resolvedRes] = await Promise.all([
          axios.get("/api/alerts/live"),
          axios.get("/api/alerts/resolved")
        ]);
        
        const currentTime = new Date();
        const liveAlerts = liveRes.data.alerts || [];
        const resolvedAlertsData = resolvedRes.data.alerts || [];
        
        // Check for new alerts (created in last 5 minutes)
        const newlyAdded = liveAlerts.filter(alert => 
          new Date(alert.created_at).getTime() > Date.now() - 300000
        );
        
        // Filter out expired alerts from live alerts
        const activeAlerts = liveAlerts.filter(alert => 
          !alert.end_date || new Date(alert.end_date) > currentTime
        );
        
        setAlerts(activeAlerts);
        setResolvedAlerts(resolvedAlertsData);
        
        // Show new alerts notification
        if (newlyAdded.length > 0) {
          setNewAlerts(newlyAdded);
          setTimeout(() => setNewAlerts([]), 5000);
        }
        
        // Hide welcome message after 5 seconds if there are alerts
        if (activeAlerts.length > 0) {
          setTimeout(() => setShowWelcome(false), 5000);
        }
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to load alerts");
        
        // Fallback to mock data if API fails
        const mockLiveAlerts = [
          {
            id: 1,
            title: "Fire reported in downtown area",
            category: "Fire",
            type: "Emergency",
            message: "Fire department responding to a structure fire. Avoid the area.",
            location: "Main St & 5th Ave",
            start_date: new Date(Date.now() - 30 * 60000),
            end_date: new Date(Date.now() + 2.5 * 3600000),
            severity: "high",
            affected_area: "Downtown district",
            source: "Fire Department"
          },
          {
            id: 2,
            title: "Severe weather warning",
            category: "Weather",
            type: "Weather",
            message: "Thunderstorm warning issued for the area. Seek shelter if outdoors.",
            location: "Northwest district",
            start_date: new Date(Date.now() - 45 * 60000),
            end_date: new Date(Date.now() + 1.25 * 3600000),
            severity: "medium",
            affected_area: "Northwest region",
            source: "National Weather Service"
          }
        ];

        const mockResolvedAlerts = [
          {
            id: 3,
            title: "Power outage resolved",
            category: "Utilities",
            type: "Utilities",
            message: "Power has been restored to all affected customers.",
            location: "Eastside neighborhood",
            start_date: new Date(Date.now() - 4 * 3600000),
            end_date: new Date(Date.now() - 3600000),
            resolvedAt: new Date(Date.now() - 3600000),
            severity: "low",
            source: "Power Company"
          },
          {
            id: 4,
            title: "Suspicious activity investigated",
            category: "Crime",
            type: "Security",
            message: "Reported suspicious activity was investigated and found to be harmless.",
            location: "City Park",
            start_date: new Date(Date.now() - 6 * 3600000),
            end_date: new Date(Date.now() - 2 * 3600000),
            resolvedAt: new Date(Date.now() - 2 * 3600000),
            severity: "medium",
            source: "Police Department"
          }
        ];

        setAlerts(mockLiveAlerts);
        setResolvedAlerts(mockResolvedAlerts);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Set up interval to check for expired alerts
    const interval = setInterval(fetchAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAlert(null);
  };

  const AlertItem = ({ alert, isResolved = false }) => {
    const getCategoryColor = (category) => {
      switch (category) {
        case 'Fire': return 'bg-red-100 text-red-800';
        case 'Crime': return 'bg-purple-100 text-purple-800';
        case 'Weather': return 'bg-blue-100 text-blue-800';
        case 'Utilities': return 'bg-yellow-100 text-yellow-800';
        case 'Emergency': return 'bg-red-100 text-red-800';
        case 'Security': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getTimeRemaining = (alert) => {
      if (isResolved) return 'Resolved';
      
      if (alert.end_date) {
        const currentTime = new Date();
        const endTime = new Date(alert.end_date);
        if (endTime <= currentTime) return 'Expired';
        
        const remainingMs = endTime - currentTime;
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (remainingHours > 0) return `Live for ${remainingHours}h ${remainingMinutes}m`;
        if (remainingMinutes > 0) return `Live for ${remainingMinutes}m`;
        return 'Expiring soon';
      }
      
      return 'Ongoing';
    };

    return (
      <div 
        className={`p-5 mb-4 rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white`}
        onClick={() => handleViewAlert(alert)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {!isResolved && (
                <div className="flex items-center mr-3">
                  <div className={`h-4 w-4 rounded-full mr-2 ${
                    alert.type === "Emergency" ? 'bg-red-500 animate-pulse' : 
                    alert.type === "Weather" ? 'bg-blue-500 animate-pulse' : 
                    alert.type === "Security" ? 'bg-orange-500 animate-pulse' : 
                    'bg-green-500 animate-pulse'
                  }`}></div>
                  <span className="text-sm font-semibold text-blue-600">LIVE</span>
                </div>
              )}
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getCategoryColor(alert.category || alert.type)}`}>
                {alert.category || alert.type}
              </span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-blue-800">{alert.title}</h3>
            <p className="text-gray-600 mb-3">{alert.message}</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{alert.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(alert.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {getTimeRemaining(alert)}
                </span>
              </span>
            </div>
          </div>
          {isResolved ? (
            <div className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolved
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-600 font-medium">
              View Details
            </div>
          )}
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-16 relative overflow-hidden">
      <div className="relative inline-block mb-6">
        <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-full">
          <ShieldCheck className="h-16 w-16 text-blue-500 mx-auto" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Great news! No active alerts.</h2>
      <p className="text-gray-600 max-w-md mx-auto">Your community is safe. We'll notify you immediately if any new alerts are issued.</p>
      
      {/* Decorative elements */}
      <div className="absolute left-1/4 top-1/4 w-20 h-20 bg-blue-50 rounded-full opacity-50 -z-10"></div>
      <div className="absolute right-1/4 bottom-1/4 w-16 h-16 bg-blue-50 rounded-full opacity-30 -z-10"></div>
    </div>
  );

  const AlertDetailModal = ({ alert, onClose }) => {
    if (!alert) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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
              className="text-gray-500 hover:text-gray-700 transition-colors"
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

              {alert.end_date && (
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p className="font-medium">
                      {new Date(alert.end_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alert Type</p>
                  <p className="font-medium">{alert.type || alert.category || "General"}</p>
                </div>
              </div>

              {alert.location && (
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{alert.location}</p>
                  </div>
                </div>
              )}

              {alert.affected_area && (
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-yellow-600" />
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
                <h3 className="text-sm font-medium text-gray-500 mb-2">Recommended Actions</h3>
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
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="p-8 flex flex-col items-center">
          <Loader2 className="animate-spin w-10 h-10 text-blue-500 mb-4" />
          <p className="text-gray-600">Loading latest alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="p-8 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Connection Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 relative">
      {/* Bubble Background (same as SafetyTipsPage) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full"></div>
        <div className="absolute top-5 right-20 w-16 h-16 bg-blue-500 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-500 rounded-full"></div>
      </div>

      {/* Welcome Notification */}
      {showWelcome && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 flex items-center gap-3 max-w-md">
            <div className="bg-blue-100 p-2 rounded-full">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Welcome to Our Alert System</p>
              <p className="text-sm text-gray-600">Stay informed about community safety</p>
            </div>
            <button 
              onClick={() => setShowWelcome(false)} 
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New Alerts Notification */}
      {newAlerts.length > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-md">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-600 mt-0.5 animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-green-800">New Alert{newAlerts.length !== 1 ? 's' : ''}</p>
                <p className="text-sm text-green-600">
                  {newAlerts.length} new alert{newAlerts.length !== 1 ? 's have' : ' has'} been posted
                </p>
              </div>
              <button 
                onClick={() => setNewAlerts([])} 
                className="text-green-400 hover:text-green-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                <Megaphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-800">SafeZone101 Alerts</h1>
                <p className="text-gray-600 mt-2">
                  Community safety notifications and emergency alerts
                </p>
              </div>
            </div>
            
            <div className="bg-blue-100 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className={`rounded-full w-4 h-4 ${alerts.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-blue-800">
                  {alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          {/* Live Alerts Section */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Zap className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-blue-800">Live Alerts</h2>
              {alerts.length > 0 && (
                <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {alerts.length} Active
                </span>
              )}
            </div>

            {alerts.length === 0 ? (
              <EmptyState />
            ) : (
              <div>
                {alerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>

          {/* Resolved Alerts Section */}
          {resolvedAlerts.length > 0 && (
            <div>
              <div className="flex items-center mb-6">
                <Calendar className="h-6 w-6 text-gray-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-800">Recently Resolved</h2>
                <span className="ml-3 bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                  {resolvedAlerts.length} Resolved
                </span>
              </div>

              <div>
                {resolvedAlerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} isResolved={true} />
                ))}
              </div>
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
        
        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Alerts are automatically updated. Page refreshes every 30 seconds.</p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Alerts;