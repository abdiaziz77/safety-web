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
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  // Fetch report
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:5000/api/reports/admin/reports/${id}`,
          { withCredentials: true }
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
      const response = await axios.get(
        `http://127.0.0.1:5000/api/reports/admin/reports/${id}`,
        {
          status: editedData.status,
          admin_notes: editedData.admin_notes,
        },
        { withCredentials: true }
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
        <Box display="flex" alignItems="center" gap={2}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  setIsEditing(false);
                  setEditedData(report);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </Box>
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
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Location:</Typography>
                  <Typography>{report.location}</Typography>
                </Grid>
                {report.latitude && report.longitude && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Latitude:</Typography>
                      <Typography>{report.latitude}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Longitude:</Typography>
                      <Typography>{report.longitude}</Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Location Type:</Typography>
                  <Typography>{report.location_type}</Typography>
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

        {/* Admin Controls */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin Controls
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editedData.status || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, status: e.target.value })
                  }
                  label="Status"
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
                onChange={(e) =>
                  setEditedData({ ...editedData, admin_notes: e.target.value })
                }
                disabled={!isEditing}
              />
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
                    secondary={`#${report.id.slice(0, 8)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Submitted By"
                    secondary={report.user_email || "Anonymous"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Date Submitted"
                    secondary={new Date(report.created_at).toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={new Date(report.updated_at).toLocaleString()}
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
                          {media.type.startsWith("image") && <ImageIcon />}
                          {media.type.startsWith("video") && <Videocam />}
                          {media.type.startsWith("audio") && <Mic />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={media.name || `Attachment ${index + 1}`}
                        secondary={media.type}
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
