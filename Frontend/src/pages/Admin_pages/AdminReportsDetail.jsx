import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Pending,
  HourglassEmpty,
  Error as ErrorIcon,
  Image as ImageIcon,
  Videocam,
  Mic,
  Save,
  Edit,
  Cancel,
  Person,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Axios global setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://127.0.0.1:5000";

const AdminReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  // Garissa County areas and wards
  const garissaAreas = [
    "Garissa Town", "Dadaab", "Fafi", "Balambala", "Lagdera", "Ijara", "Hulugho", "Sankuri", "Bulas"
  ];

  const garissaWards = [
    "Garissa Central", "Garissa North", "Garissa West", "Ijara", "Saka", "Shantaba", 
    "Dagahaley", "Ifo", "Ifo II", "Liboi", 
    "Bura", "Dekaharia", "Fafi", "Jarajila", "Nanighi",
    "Balambala", "Danyere", "Jara Jara", "Saka", 
    "Baramagu", "Labisagale", "Lagdera", "Sala", 
    "Hulugho", "Ijara", "Kotile", "Masalani", "Sangailu",
    "Bulas", "Modogashe", "Benane", "Alango", "Saretho"
  ];

  // Fetch report
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/reports/admin/reports/${id}`
        );
        setReport(response.data);
        setEditedData(response.data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  // Save changes
  const handleSave = async () => {
    try {
      const response = await axios.put(
        `/api/reports/admin/reports/${id}`,
        {
          status: editedData.status,
          admin_notes: editedData.admin_notes,
        }
      );

      setReport(response.data);
      toast.success("Report updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating report:", err);
      toast.error("Failed to update report");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle color="success" />;
      case "Pending":
        return <Pending color="warning" />;
      case "In Progress":
        return <HourglassEmpty color="info" />;
      case "Rejected":
      case "Closed":
        return <ErrorIcon color="error" />;
      default:
        return <Pending color="warning" />;
    }
  };

  // Function to get user display info from author object
  const getUserDisplayInfo = (report) => {
    if (!report.author) return "Anonymous";
    
    if (report.author.first_name && report.author.last_name) {
      return `${report.author.first_name} ${report.author.last_name}`;
    } else if (report.author.email) {
      return report.author.email;
    } else if (report.author.name) {
      return report.author.name;
    }
    
    return "Anonymous";
  };

  // Function to get email from author object
  const getUserEmail = (report) => {
    if (report.author?.email) {
      return report.author.email;
    }
    return "Anonymous";
  };

  if (loading) return <LinearProgress />;

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/admin/dashboard/reports")}
          sx={{ mt: 2 }}
        >
          Back to Reports
        </Button>
      </Box>
    );
  }

  if (!report) {
    return (
      <Box p={3}>
        <Typography variant="h6">Report not found</Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/admin/dashboard/reports")}
          sx={{ mt: 2 }}
        >
          Back to Reports
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/admin/dashboard/reports")}
        sx={{ mb: 3 }}
      >
        Back to Reports
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Report Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Report Info */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Report Type:</Typography>
                  <Typography>{report.report_type}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Title:</Typography>
                  <Typography>{report.title}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description:</Typography>
                  <Typography>{report.description}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date of Incident:</Typography>
                  <Typography>{new Date(report.date).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Urgency:</Typography>
                  <Chip
                    label={report.urgency}
                    color={
                      report.urgency === "high" || report.urgency === "critical"
                        ? "error"
                        : report.urgency === "medium"
                        ? "warning"
                        : "default"
                    }
                  />
                </Grid>
                
                {/* Author Information */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person color="primary" fontSize="small" />
                    <Typography variant="subtitle2">Submitted by:</Typography>
                  </Box>
                  <Typography>
                    {getUserDisplayInfo(report)}
                    {report.author?.email && ` (${report.author.email})`}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Location Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Area:</Typography>
                  <Typography>{report.area || "Not specified"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Ward:</Typography>
                  <Typography>{report.ward || "Not specified"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Landmark:</Typography>
                  <Typography>{report.landmark || "No landmark provided"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Location Type:</Typography>
                  <Typography>{report.location_type || "N/A"}</Typography>
                </Grid>
                {report.location_details && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Location Details:</Typography>
                    <Typography>{report.location_details}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status & Admin Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editedData.status || "Pending"}
                  label="Status"
                  onChange={(e) => setEditedData({...editedData, status: e.target.value})}
                  disabled={!isEditing}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Admin Notes"
                multiline
                rows={4}
                fullWidth
                value={editedData.admin_notes || ""}
                onChange={(e) => setEditedData({...editedData, admin_notes: e.target.value})}
                disabled={!isEditing}
              />
              
              <Box display="flex" gap={1} mt={2}>
                {isEditing ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setEditedData(report);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Metadata
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List>
                <ListItem>
                  <ListItemText
                    primary="Report ID"
                    secondary={`#${report.id?.slice(0, 8) || 'N/A'}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Submitted By"
                    secondary={getUserEmail(report)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Date Submitted"
                    secondary={report.created_at ? new Date(report.created_at).toLocaleString() : 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={report.updated_at ? new Date(report.updated_at).toLocaleString() : 'N/A'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {report.media && report.media.length > 0 && (
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Media Attachments
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List>
                  {report.media.map((media, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          {media.type?.startsWith("image") && <ImageIcon />}
                          {media.type?.startsWith("video") && <Videocam />}
                          {media.type?.startsWith("audio") && <Mic />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={media.name || `Attachment ${index + 1}`}
                        secondary={media.type || "Unknown type"}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminReportDetails;