import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Chip,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  CheckCircle,
  Pending,
  HourglassEmpty,
  Error,
  Add,
  Close,
  Image as ImageIcon,
  Videocam,
  Mic,
  LocationOn
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // ✅ Check if session is active
        const authCheck = await axios.get(
          "http://127.0.0.1:5000/api/auth/get_current_user",
          {
            withCredentials: true,
          }
        );

        if (!authCheck.data.user) {
          toast.error("Please log in to view your reports");
          navigate("/login");
          return;
        }

        // ✅ Fetch reports
        const response = await axios.get(
          "http://127.0.0.1:5000/api/reports/",
          {
            withCredentials: true,
          }
        );

        // Depending on backend structure, adapt this
        setReports(response.data.reports || response.data || []);
      } catch (error) {
        console.error("Error:", error);

        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error("Failed to load reports");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return <CheckCircle color="success" />;
      case "pending":
        return <Pending color="warning" />;
      case "in progress":
        return <HourglassEmpty color="info" />;
      case "rejected":
        return <Error color="error" />;
      default:
        return <Pending color="warning" />;
    }
  };

  const handleViewDetails = async (report) => {
    // If we already have detailed information, show it immediately
    if (report.description && report.location) {
      setSelectedReport(report);
      setDialogOpen(true);
      return;
    }
    
    // Otherwise, try to fetch detailed information
    try {
      setDetailsLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:5000/api/reports/${report.id}`,
        { withCredentials: true }
      );
      
      setSelectedReport(response.data.report || response.data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching report details:", error);
      // If fetch fails, show the basic info we already have
      setSelectedReport(report);
      setDialogOpen(true);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const ReportDetailsDialog = ({ report, open, onClose, loading }) => {
    if (!report) return null;

    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="span">
              Report Details
            </Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                {/* Basic Information */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Report Type:</Typography>
                        <Typography>{report.report_type || "N/A"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Title:</Typography>
                        <Typography>{report.title || "N/A"}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Description:</Typography>
                        <Typography>{report.description || "No description provided"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Date:</Typography>
                        <Typography>
                          {report.date ? new Date(report.date).toLocaleDateString() : "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Urgency:</Typography>
                        <Chip
                          label={report.urgency || "N/A"}
                          color={
                            report.urgency === "high" || report.urgency === "critical"
                              ? "error"
                              : report.urgency === "medium"
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Location Details */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Location Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn color="primary" fontSize="small" />
                          <Typography variant="subtitle2">Location:</Typography>
                        </Box>
                        <Typography>{report.location || "Location not specified"}</Typography>
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

              {/* Metadata & Media */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Report Metadata
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {getStatusIcon(report.status)}
                      <Typography variant="subtitle1">
                        {report.status || "Unknown"}
                      </Typography>
                    </Box>

                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Report ID"
                          secondary={report.id ? `#${report.id.slice(0, 8)}` : "N/A"}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Date Submitted"
                          secondary={
                            report.created_at
                              ? new Date(report.created_at).toLocaleString()
                              : "N/A"
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Last Updated"
                          secondary={
                            report.updated_at
                              ? new Date(report.updated_at).toLocaleString()
                              : "N/A"
                          }
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>

                {report.media?.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Media Attachments
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <List dense>
                        {report.media.map((media, index) => (
                          <ListItem key={index}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {media.type?.startsWith("image") && <ImageIcon fontSize="small" />}
                                {media.type?.startsWith("video") && <Videocam fontSize="small" />}
                                {media.type?.startsWith("audio") && <Mic fontSize="small" />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={media.name || `Attachment ${index + 1}`}
                              secondary={media.type || "N/A"}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
        <Card variant="outlined" sx={{ maxWidth: 600, mx: "auto" }}className="bg-blue-100">
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" gutterBottom>
              You haven't submitted any reports yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Submit your first report to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/dashboard/reports"
            >
              Submit New Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100">
  <div className="max-w-4xl mx-auto p-4 md:p-6 pt-4 pb-6 md:pt-6 md:pb-8">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection={isMobile ? "column" : "row"}
          gap={isMobile ? 2 : 0}
          mb={4}
        >
          <Typography variant="h4" fontWeight="bold" textAlign={isMobile ? "center" : "left"}>
            My Reports
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to="/dashboard/reports"
            fullWidth={isMobile}
          >
            New Report
          </Button>
        </Box>

        {isMobile ? (
          // Mobile view: Card layout
          <Box display="flex" flexDirection="column" gap={2}>
            {reports.map((report) => (
              <Card key={report.id} variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h2">
                      {report.title || 'N/A'}
                    </Typography>
                    <Chip 
                      label={report.report_type || 'N/A'} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {getStatusIcon(report.status)}
                    <Typography variant="body2">
                      {report.status || 'Unknown'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Submitted: {report.created_at 
                      ? new Date(report.created_at).toLocaleDateString() 
                      : 'N/A'
                    }
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    ID: #{report.id?.slice(0, 8) || 'N/A'}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleViewDetails(report)}
                    disabled={detailsLoading}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // Desktop view: Table layout
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>#{report.id?.slice(0, 8) || 'N/A'}</TableCell>
                    <TableCell>{report.title || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={report.report_type || 'N/A'} size="small" />
                    </TableCell>
                    <TableCell>
                      {report.created_at 
                        ? new Date(report.created_at).toLocaleDateString() 
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(report.status)}
                        <Typography variant="body2">
                          {report.status || 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(report)}
                        disabled={detailsLoading}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      <ReportDetailsDialog 
        report={selectedReport} 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        loading={detailsLoading}
      />
    </div>
  );
};

export default MyReportsPage;