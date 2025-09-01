import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Phone, MapPin, Bell, Clock, Shield, AlertTriangle, 
  CheckCircle, Heart, Flame, FileText,
  ChevronRight, RefreshCw, AlertCircle
} from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [stats, setStats] = useState({
    activeIncidents: 0,
    responseTime: '0 min',
    yourReports: 0,
    communitySafety: '0%'
  });

  const quickActions = [
    { label: "Report Emergency", icon: Phone, variant: "emergency", description: "Call 101 or use app" },
    { label: "Police Report", icon: Shield, variant: "police", description: "Crime or safety concern" },
    { label: "Fire Emergency", icon: Flame, variant: "fire", description: "Fire, gas leak, hazmat" },
    { label: "Medical Help", icon: Heart, variant: "medical", description: "Health emergency" },
    { label: "Public Hazard", icon: AlertTriangle, variant: "hazard", description: "Infrastructure issue" },
    { label: "View Map", icon: MapPin, variant: "outline", description: "Live incident map" }
  ];

  const safetyTips = [
    "Always lock your doors and windows when leaving home",
    "Program emergency numbers into your phone",
    "Know your neighborhood emergency meeting points",
    "Keep a first aid kit and flashlight readily available"
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. First verify access to dashboard
      const accessResponse = await axios.get("http://127.0.0.1:5000/api/auth/access_user_dash", {
        withCredentials: true,
      });
      
      if (!accessResponse.data || accessResponse.data.error) {
        throw new Error(accessResponse.data?.error || "Unauthorized access");
      }

      // 2. Fetch current user data
      const userResponse = await axios.get("http://127.0.0.1:5000/api/auth/get_current_user", {
        withCredentials: true,
      });

      if (!userResponse.data?.user) {
        throw new Error("No user data received");
      }

      const currentUser = userResponse.data.user;
      setUser(currentUser);

      // 3. Fetch reports and alerts in parallel
      const [reportsResponse, alertsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:5000/api/reports/", { withCredentials: true }),
        axios.get("http://127.0.0.1:5000/api/alerts/", { withCredentials: true })
      ]);

      // Handle both array and object response formats
      const reportsData = Array.isArray(reportsResponse.data?.reports) ? reportsResponse.data.reports : 
                         Array.isArray(reportsResponse.data) ? reportsResponse.data : [];
      
      const alertsData = Array.isArray(alertsResponse.data?.alerts) ? alertsResponse.data.alerts : 
                        Array.isArray(alertsResponse.data) ? alertsResponse.data : [];

      console.log('Reports data:', reportsData);
      console.log('Alerts data:', alertsData);

      setRecentReports(reportsData.slice(0, 5)); // Show only recent 5
      
      // Filter active alerts (status: Active or Critical)
      const activeAlertsData = alertsData.filter(alert => 
        alert.status === 'Active' || alert.status === 'Critical'
      );
      setActiveAlerts(activeAlertsData.slice(0, 3)); // Show only top 3

      // 4. Calculate stats - handle different user ID property names
      const userReportsCount = reportsData.filter(report => 
        report.user_id === currentUser.id || 
        report.userId === currentUser.id ||
        report.user?.id === currentUser.id
      ).length;

      setStats({
        activeIncidents: reportsData.length,
        responseTime: `${(Math.random() * 5).toFixed(1)} min`,
        yourAlerts: activeAlertsData.length,
        communitySafety: `${90 + Math.floor(Math.random() * 10)}%`
      });

    } catch (err) {
      console.error("Dashboard error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
      setRecentReports([]);
      setActiveAlerts([]);
      setStats({
        activeIncidents: 0,
        responseTime: '0 min',
        yourAlerts: 0,
        communitySafety: '0%'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetry = () => {
    setError(null);
    fetchData();
  };

  const quickActionIcons = {
    "Report Emergency": Phone,
    "Police Report": Shield,
    "Fire Emergency": Flame,
    "Medical Help": Heart,
    "Public Hazard": AlertTriangle,
    "View Map": MapPin
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto">
            <RefreshCw className="h-6 w-6 mx-auto mt-3" />
          </div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 text-gray-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user ? `${user.firstName} ${user.lastName}` : "User"}!
              </h2>
              <p className="mb-4">Your community safety dashboard for your area</p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-300 mr-2" />
                  <span>All systems operational</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-200 mr-2" />
                  <span>Last login: recently</span>
                </div>
              </div>
            </div>
            
            <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              <MapPin className="h-5 w-5 mr-2" />
              View Your Neighborhood
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-gray-500 text-sm">Active Incidents</div>
            <div className="text-2xl font-bold">{stats.activeIncidents}</div>
            <div className="text-xs text-gray-500 mt-1">+2 from yesterday</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-gray-500 text-sm">Response Time</div>
            <div className="text-2xl font-bold">{stats.responseTime}</div>
            <div className="text-xs text-gray-500 mt-1">Faster than average</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-gray-500 text-sm">Active Alerts</div>
            <div className="text-2xl font-bold">{stats.yourAlerts}</div>
            <div className="text-xs text-gray-500 mt-1">1 currently active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="text-gray-500 text-sm">Community Safety</div>
            <div className="text-2xl font-bold">{stats.communitySafety}</div>
            <div className="text-xs text-gray-500 mt-1">Excellent rating</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emergency Actions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Quick Emergency Actions
                </h3>
                <Link
                  to="/dashboard/chat" className="text-sm text-blue-600 hover:text-blue-800">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {quickActions.map((action, idx) => {
                  const Icon = quickActionIcons[action.label] || AlertTriangle;
                  const variantColors = {
                    emergency: "bg-red-100 text-red-600",
                    police: "bg-blue-100 text-blue-600",
                    fire: "bg-orange-100 text-orange-600",
                    medical: "bg-green-100 text-green-600",
                    hazard: "bg-yellow-100 text-yellow-600",
                    outline: "bg-gray-100 text-gray-600"
                  };
                  
                  return (
                    <button 
                      key={idx}
                      className={`flex flex-col items-center p-4 rounded-lg hover:shadow-md transition-all ${variantColors[action.variant]}`}
                    >
                      <div className="p-3 rounded-full bg-white shadow-sm mb-2">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-semibold">{action.label}</span>
                      <span className="text-xs mt-1 text-gray-600">{action.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  Recent Reports
                </h3>
                <Link 
                to ="/dashboard/reports" className="text-sm text-blue-600 hover:text-blue-800">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {recentReports.length > 0 ? (
                  recentReports.map((report, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 mt-1 mr-3 ${
                          report.report_type === 'police' ? 'text-blue-500' : 
                          report.report_type === 'medical' ? 'text-green-500' : 
                          'text-orange-500'
                        }`}>
                          {report.report_type === 'police' ? <Shield className="h-5 w-5" /> : 
                          report.report_type === 'medical' ? <Heart className="h-5 w-5" /> : 
                          <Flame className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{report.title || 'Untitled Report'}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                              report.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{report.description?.substring(0, 100) || 'No description'}...</p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {report.created_at ? new Date(report.created_at).toLocaleString() : 'Unknown time'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No recent reports found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center">
                  <Bell className="h-5 w-5 text-yellow-500 mr-2" />
                  Active Alerts
                </h3>
                <Link 
                to ="/dashboard/alerts"
                className="text-sm text-blue-600 hover:text-blue-800">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {activeAlerts.length > 0 ? (
                  activeAlerts.map((alert, index) => (
                    <div 
                      key={index} 
                      className={`p-4 ${alert.status === 'Critical' ? 'bg-red-50' : 'bg-yellow-50'}`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 mt-1 mr-3 ${
                          alert.status === 'Critical' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{alert.title || 'Alert'}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.status === 'Critical' ? 'bg-red-200 text-red-800' : 
                              alert.status === 'Active' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {alert.status || 'Alert'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.message?.substring(0, 100) || 'No details available'}...</p>
                          <div className="mt-2 flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Recently'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No active alerts
                  </div>
                )}
              </div>
            </div>

            {/* Safety Status */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Your Safety Status
                </h3>
              </div>
              <div className="p-4 text-center">
                <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h4 className="font-bold text-lg text-green-600 mb-1">All Clear</h4>
                <p className="text-sm text-gray-600 mb-4">No immediate threats detected in your area</p>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Location Safety</span>
                    <span className="text-sm font-bold text-green-600">Safe</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
                
                <Link
                to="/dashboard/settings" className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50">
                  <MapPin className="h-5 w-5 mr-2" />
                  Update My Location
                </Link>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-lg flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  Safety Tips
                </h3>
              </div>
              <div className="p-4">
                <ul className="space-y-3">
                  {safetyTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-3 text-blue-500">
                        <Shield className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </li>
                  ))}
                </ul>
                <button className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-blue-600 hover:bg-blue-50">
                  <ChevronRight className="h-5 w-5 mr-1" />
                  View More Tips
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;