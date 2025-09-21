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
  useTheme,
  Collapse,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
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
  LocationOn,
  Person,
  Note,
  AdminPanelSettings,
  ExpandMore,
  ExpandLess,
  Edit,
  Save,
  Cancel
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Garissa County areas and wards
  const garissaAreas = [
    "Garissa Town", "Dadaab", "Fafi", "Balambala", "Lagdera", "Ijara", "Hulugho", "Sankuri", "Bulas"
  ];

  const garissaWards = [
    // Garissa Town Wards
    "Garissa Central", "Garissa North", "Garissa West", "Ijara", "Saka", "Shantaba", 
    
    // Dadaab Wards
    "Dagahaley", "Ifo", "Ifo II", "Liboi", 
    
    // Fafi Wards
    "Bura", "Dekaharia", "Fafi", "Jarajila", "Nanighi",
    
    // Balambala Wards
    "Balambala", "Danyere", "Jara Jara", "Saka", 
    
    // Lagdera Wards
    "Baramagu", "Labisagale", "Lagdera", "Sala", 
    
    // Ijara Wards
    "Hulugho", "Ijara", "Kotile", "Masalani", "Sangailu",
    
    // Bulas and surrounding areas
    "Bulas", "Modogashe", "Benane", "Alango", "Saretho"
  ];

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

        // Store user information
        setUserInfo(authCheck.data.user);

        // ✅ Fetch reports - Updated endpoint
        const response = await axios.get(
          "http://127.0.0.1:5000/api/reports/",
          {
            withCredentials: true,
          }
        );

        // Handle different response structures
        if (response.data.reports) {
          setReports(response.data.reports);
        } else if (Array.isArray(response.data)) {
          setReports(response.data);
        } else {
          setReports([]);
        }
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "success.main";
      case "pending":
        return "warning.main";
      case "in progress":
        return "info.main";
      case "rejected":
        return "error.main";
      default:
        return "text.primary";
    }
  };

  const handleViewDetails = async (report) => {
    // If we already have detailed information, show it immediately
    if (report.description && report.area && report.admin_notes !== undefined) {
      setSelectedReport(report);
      setEditedData(report);
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
      
      // Handle different response structures
      const reportData = response.data.report || response.data;
      setSelectedReport(reportData);
      setEditedData(reportData);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching report details:", error);
      // If fetch fails, show the basic info we already have
      setSelectedReport(report);
      setEditedData(report);
      setDialogOpen(true);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReport(null);
    setIsEditing(false);
    setExpandedNotes(true);
  };

  const toggleNotesExpansion = () => {
    setExpandedNotes(!expandedNotes);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // If canceling edit, reset to original data
      setEditedData(selectedReport);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/api/reports/${selectedReport.id}`,
        {
          title: editedData.title,
          description: editedData.description,
          report_type: editedData.report_type,
          urgency: editedData.urgency,
          date: editedData.date,
          area: editedData.area,
          ward: editedData.ward,
          landmark: editedData.landmark,
          location_type: editedData.location_type,
          location_details: editedData.location_details,
          // Include other fields that might be needed
          witnesses: editedData.witnesses,
          witness_details: editedData.witness_details,
          evidence_available: editedData.evidence_available,
          evidence_details: editedData.evidence_details,
          police_involved: editedData.police_involved,
          police_details: editedData.police_details,
          category: editedData.category,
          subcategory: editedData.subcategory,
          tags: editedData.tags,
          custom_fields: editedData.custom_fields
        },
        { withCredentials: true }
      );

      // Handle different response structures
      const updatedReport = response.data.report || response.data;
      
      setSelectedReport(updatedReport);
      setEditedData(updatedReport);
      
      // Update the reports list
      setReports(reports.map(report => 
        report.id === selectedReport.id ? updatedReport : report
      ));
      
      toast.success("Report updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating report:", error);
      if (error.response?.data?.error) {
        toast.error(`Failed to update report: ${error.response.data.error}`);
      } else {
        toast.error("Failed to update report");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  const getUserDisplayName = (reportAuthor) => {
    if (!reportAuthor) return "Anonymous";
    
    if (reportAuthor.first_name && reportAuthor.last_name) {
      return `${reportAuthor.first_name} ${reportAuthor.last_name}`;
    } else if (reportAuthor.name) {
      return reportAuthor.name;
    } else if (reportAuthor.email) {
      return reportAuthor.email;
    }
    
    return "Anonymous";
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
            <Box>
              {!isEditing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={handleEditToggle}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    startIcon={<Save />}
                    onClick={handleSave}
                    sx={{ mr: 1 }}
                    variant="contained"
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleEditToggle}
                  >
                    Cancel
                  </Button>
                </>
              )}
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* Status - At the top for visibility */}
              <Grid item xs={12}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    borderLeft: `4px solid`,
                    borderLeftColor: getStatusColor(report.status),
                    backgroundColor: 'background.paper'
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {getStatusIcon(report.status)}
                      <Typography variant="subtitle2" fontWeight="bold">
                        STATUS:
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      color={getStatusColor(report.status)}
                    >
                      {report.status || "Unknown"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Admin Notes - Expandable Section */}
              {report.admin_notes && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ p: '16px !important', pb: expandedNotes ? '16px' : '8px !important' }}>
                      <Box 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center"
                        sx={{ cursor: 'pointer' }}
                        onClick={toggleNotesExpansion}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <AdminPanelSettings color="primary" />
                          <Typography variant="h6" color="primary">
                            Admin Notes
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          {expandedNotes ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      
                      <Collapse in={expandedNotes} timeout="auto" unmountOnExit>
                        <Divider sx={{ my: 2 }} />
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            backgroundColor: 'grey.50',
                            borderColor: 'primary.light'
                          }}
                        >
                          <Typography 
                            variant="body1" 
                            sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                            fontWeight="medium"
                          >
                            {report.admin_notes}
                          </Typography>
                        </Card>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              )}

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
                        <Typography variant="subtitle2" fontWeight="medium">Report Type:</Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedData.report_type || ""}
                              onChange={(e) => handleInputChange('report_type', e.target.value)}
                            >
                              <MenuItem value="Crime">Crime</MenuItem>
                              <MenuItem value="Accident">Accident</MenuItem>
                              <MenuItem value="Public Safety">Public Safety</MenuItem>
                              <MenuItem value="Environmental">Environmental</MenuItem>
                              <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                              <MenuItem value="Animal Related">Animal Related</MenuItem>
                              <MenuItem value="Noise Complaint">Noise Complaint</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{report.report_type || "N/A"}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="medium">Title:</Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editedData.title || ""}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                          />
                        ) : (
                          <Typography>{report.title || "N/A"}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight="medium">Description:</Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={editedData.description || ""}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                          />
                        ) : (
                          <Typography>{report.description || "No description provided"}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="medium">Date:</Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            type="date"
                            size="small"
                            value={editedData.date ? new Date(editedData.date).toISOString().split('T')[0] : ""}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        ) : (
                          <Typography>
                            {report.date ? new Date(report.date).toLocaleDateString() : "N/A"}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="medium">Urgency:</Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedData.urgency || ""}
                              onChange={(e) => handleInputChange('urgency', e.target.value)}
                            >
                              <MenuItem value="low">Low</MenuItem>
                              <MenuItem value="medium">Medium</MenuItem>
                              <MenuItem value="high">High</MenuItem>
                              <MenuItem value="critical">Critical</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
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
                        )}
                      </Grid>
                      {/* User Information */}
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Person color="primary" fontSize="small" />
                          <Typography variant="subtitle2" fontWeight="medium">Submitted by:</Typography>
                        </Box>
                        <Typography>
                          {getUserDisplayName(report.author)}
                          {report.author?.email && ` (${report.author.email})`}
                        </Typography>
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
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn color="primary" fontSize="small" />
                          <Typography variant="subtitle2" fontWeight="medium">Area:</Typography>
                        </Box>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedData.area || ""}
                              onChange={(e) => handleInputChange('area', e.target.value)}
                            >
                              {garissaAreas.map((area) => (
                                <MenuItem key={area} value={area}>
                                  {area}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{report.area || "N/A"}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="medium">Ward:</Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedData.ward || ""}
                              onChange={(e) => handleInputChange('ward', e.target.value)}
                            >
                              {garissaWards.map((ward) => (
                                <MenuItem key={ward} value={ward}>
                                  {ward}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{report.ward || "N/A"}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="medium">Landmark:</Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editedData.landmark || ""}
                            onChange={(e) => handleInputChange('landmark', e.target.value)}
                          />
                        ) : (
                          <Typography>{report.landmark || "N/A"}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="medium">Location Type:</Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedData.location_type || ""}
                              onChange={(e) => handleInputChange('location_type', e.target.value)}
                            >
                              <MenuItem value="Residential">Residential</MenuItem>
                              <MenuItem value="Commercial">Commercial</MenuItem>
                              <MenuItem value="Public Space">Public Space</MenuItem>
                              <MenuItem value="Road/Street">Road/Street</MenuItem>
                              <MenuItem value="Rural Area">Rural Area</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{report.location_type || "N/A"}</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight="medium">Location Details:</Typography>
                        {isEditing ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editedData.location_details || ""}
                            onChange={(e) => handleInputChange('location_details', e.target.value)}
                          />
                        ) : (
                          <Typography>{report.location_details || "N/A"}</Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Additional Information */}
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Additional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight="medium">Witnesses:</Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedData.witnesses || ""}
                              onChange={(e) => handleInputChange('witnesses', e.target.value)}
                            >
                              <MenuItem value="yes">Yes</MenuItem>
                              <MenuItem value="no">No</MenuItem>
                              <MenuItem value="unknown">Unknown</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{report.witnesses || "N/A"}</Typography>
                        )}
                      </Grid>
                      {report.witnesses === "yes" && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" fontWeight="medium">Witness Details:</Typography>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={editedData.witness_details || ""}
                              onChange={(e) => handleInputChange('witness_details', e.target.value)}
                            />
                          ) : (
                            <Typography>{report.witness_details || "N/A"}</Typography>
                          )}
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight="medium">Evidence Available:</Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedData.evidence_available || ""}
                              onChange={(e) => handleInputChange('evidence_available', e.target.value)}
                            >
                              <MenuItem value="yes">Yes</MenuItem>
                              <MenuItem value="no">No</MenuItem>
                              <MenuItem value="unknown">Unknown</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{report.evidence_available || "N/A"}</Typography>
                        )}
                      </Grid>
                      {report.evidence_available === "yes" && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" fontWeight="medium">Evidence Details:</Typography>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={editedData.evidence_details || ""}
                              onChange={(e) => handleInputChange('evidence_details', e.target.value)}
                            />
                          ) : (
                            <Typography>{report.evidence_details || "N/A"}</Typography>
                          )}
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight="medium">Police Involved:</Typography>
                        {isEditing ? (
                          <FormControl fullWidth size="small">
                            <Select
                              value={editedData.police_involved || ""}
                              onChange={(e) => handleInputChange('police_involved', e.target.value)}
                            >
                              <MenuItem value="yes">Yes</MenuItem>
                              <MenuItem value="no">No</MenuItem>
                              <MenuItem value="unknown">Unknown</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>{report.police_involved || "N/A"}</Typography>
                        )}
                      </Grid>
                      {report.police_involved === "yes" && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" fontWeight="medium">Police Details:</Typography>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={editedData.police_details || ""}
                              onChange={(e) => handleInputChange('police_details', e.target.value)}
                            />
                          ) : (
                            <Typography>{report.police_details || "N/A"}</Typography>
                          )}
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Media Attachments */}
                {report.media && report.media.length > 0 && (
                  <Card variant="outlined">
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
                                {media.type?.startsWith('image/') ? <ImageIcon /> : 
                                 media.type?.startsWith('video/') ? <Videocam /> : 
                                 media.type?.startsWith('audio/') ? <Mic /> : 
                                 <Note />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={media.filename || `Attachment ${index + 1}`}
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/submit-report"
        >
          Submit New Report
        </Button>
      </Box>

      {reports.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No reports found
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              You haven't submitted any reports yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              to="/submit-report"
            >
              Submit Your First Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>#{report.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {report.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{report.report_type}</TableCell>
                  <TableCell>
                    {report.date ? new Date(report.date).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>{report.area || "N/A"}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(report.status)}
                      <Typography variant="body2">
                        {report.status || "Unknown"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(report)}
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

      <ReportDetailsDialog
        report={selectedReport}
        open={dialogOpen}
        onClose={handleCloseDialog}
        loading={detailsLoading}
      />
    </Box>
  );
};

export default MyReportsPage;