import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid,
  Avatar,
  Badge,
  Divider,
  alpha
} from '@mui/material';
import {
  Visibility,
  Delete,
  Refresh,
  Search,
  Clear,
  FilterList,
  Report,
  Person,
  CalendarToday,
  MoreVert
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ✅ Axios global setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://127.0.0.1:5000";

const statusOptions = [
  'All',
  'Pending',
  'In Progress',
  'Resolved',
  'Rejected',
  'Closed'
];

const statusColors = {
  'Pending': '#ff9800',
  'In Progress': '#2196f3',
  'Resolved': '#4caf50',
  'Rejected': '#f44336',
  'Closed': '#9e9e9e'
};

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let url = '/api/reports/admin/reports';
      if (statusFilter && statusFilter !== 'All') {
        url += `?status=${statusFilter}`;
      }
      const response = await axios.get(url);
      
      // Handle the new response format: {reports: [...]}
      const reportsData = response.data.reports || [];
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setSnackbar({ open: true, message: 'Failed to fetch reports', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let result = [...reports];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(report =>
        report.title?.toLowerCase().includes(term) ||
        report.description?.toLowerCase().includes(term) ||
        (report.author?.email?.toLowerCase().includes(term)) ||
        (report.author?.first_name?.toLowerCase().includes(term)) ||
        (report.author?.last_name?.toLowerCase().includes(term)) ||
        report.report_type?.toLowerCase().includes(term)
      );
    }
    setFilteredReports(result);
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/reports/admin/reports/${reportToDelete.id}`);
      setSnackbar({ open: true, message: 'Report deleted successfully', severity: 'success' });
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      setSnackbar({ open: true, message: 'Failed to delete report', severity: 'error' });
    } finally {
      setOpenDeleteDialog(false);
      setReportToDelete(null);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      // Use PATCH for status updates to match the new endpoint
      await axios.patch(`/api/reports/admin/reports/${reportId}/status`, { 
        status: newStatus 
      });
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      fetchReports();
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error.message);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to get user display info from author object
  const getUserDisplayInfo = (report) => {
    // Check if author exists and has email
    if (report.author?.email && report.author.email.trim() !== '') {
      return report.author.email;
    }
    
    // Fallback to name if available
    if (report.author?.first_name || report.author?.last_name) {
      return `${report.author.first_name || ''} ${report.author.last_name || ''}`.trim();
    }
    
    // Final fallback
    return 'Anonymous';
  };

  // Function to get initials for avatar from author object
  const getInitials = (report) => {
    if (report.author?.first_name && report.author?.last_name) {
      return `${report.author.first_name[0]}${report.author.last_name[0]}`.toUpperCase();
    }
    if (report.author?.email) {
      return report.author.email[0].toUpperCase();
    }
    return 'A';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} sx={{ mb: 2, color: theme.palette.primary.main }} />
          <Typography variant="h6" color="textSecondary">
            Loading Reports...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          background: 'transparent',
          color: 'inherit',
          boxShadow: 'none'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                Reports Management
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Manage and monitor all safety reports
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={fetchReports} 
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    color: 'primary.main', 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1), 
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) } 
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box display="flex" gap={2} flexWrap="wrap" flexDirection={{ xs: 'column', sm: 'row' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search reports..."
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                minWidth: { xs: '100%', sm: 250 },
                flexGrow: 1
              }}
            />

            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
                startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {searchTerm && (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => setSearchTerm('')}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Clear
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Reports Table/Cards */}
      {isMobile ? (
        // Mobile Card View
        <Box>
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <Card key={report.id} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                      {report.title || 'No title'}
                    </Typography>
                    <Chip 
                      label={report.report_type || 'Unknown'} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: theme.palette.primary.main }}>
                      {getInitials(report)}
                    </Avatar>
                    <Typography variant="body2" color="textSecondary">
                      {getUserDisplayInfo(report)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Select
                      value={report.status || 'Pending'}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      size="small"
                      sx={{ 
                        minWidth: 120,
                        backgroundColor: alpha(statusColors[report.status] || '#ff9800', 0.1),
                        '& .MuiSelect-select': {
                          py: 0.5,
                          color: statusColors[report.status] || '#ff9800',
                          fontWeight: 'medium'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        }
                      }}
                    >
                      {statusOptions.filter(s => s !== 'All').map(status => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                    
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/admin/dashboard/reports/${report.id}`)}
                          sx={{ mr: 1 }}
                        >
                          <Visibility color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(report)}
                        >
                          <Delete color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card sx={{ textAlign: 'center', p: 4, borderRadius: 2 }}>
              <Report sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No reports found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Card>
          )}
        </Box>
      ) : (
        // Desktop Table View
        <Card elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Author</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <TableRow 
                      key={report.id} 
                      hover 
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        #{report.id?.slice(0, 8) || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          {report.title || 'No title'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: theme.palette.primary.main }}>
                            {getInitials(report)}
                          </Avatar>
                          {getUserDisplayInfo(report)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={report.report_type || 'Unknown'} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={report.status || 'Pending'}
                          onChange={(e) => handleStatusChange(report.id, e.target.value)}
                          size="small"
                          sx={{ 
                            minWidth: 120,
                            backgroundColor: alpha(statusColors[report.status] || '#ff9800', 0.1),
                            '& .MuiSelect-select': {
                              py: 0.5,
                              color: statusColors[report.status] || '#ff9800',
                              fontWeight: 'medium'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none'
                            }
                          }}
                        >
                          {statusOptions.filter(s => s !== 'All').map(status => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/dashboard/reports/${report.id}`)}
                              sx={{ 
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                              }}
                            >
                              <Visibility color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(report)}
                              sx={{ 
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) }
                              }}
                            >
                              <Delete color="error" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Report sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        No reports found
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Try adjusting your search or filter criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 2 } }}
      >
        <DialogTitle sx={{ backgroundColor: theme.palette.grey[50], borderBottom: 1, borderColor: 'divider' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: theme.palette.error.main }}>
              <Delete />
            </Avatar>
            <Box>
              <Typography variant="h6">Delete Report</Typography>
              <Typography variant="body2" color="textSecondary">
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
          <Typography variant="body1">
            Are you sure you want to delete the report "{reportToDelete?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Delete Report
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsList;