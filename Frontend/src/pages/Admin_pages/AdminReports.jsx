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
  Alert
} from '@mui/material';
import {
  Visibility,
  Delete,
  Refresh,
  Search,
  Clear
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
        report.user_email?.toLowerCase().includes(term) ||
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
      
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Reports Management
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchReports}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search reports..."
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
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
          >
            Clear Search
          </Button>
        )}
      </Box>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>#{report.id?.slice(0, 8) || 'N/A'}</TableCell>
                    <TableCell>{report.title || 'No title'}</TableCell>
                    <TableCell>{report.user_email || 'Anonymous'}</TableCell>
                    <TableCell>
                      <Chip label={report.report_type || 'Unknown'} size="small" />
                    </TableCell>
                    <TableCell>
                      {report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={report.status || 'Pending'}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        {statusOptions.filter(s => s !== 'All').map(status => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/dashboard/reports/${report.id}`)}
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
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" color="textSecondary" py={3}>
                      No reports found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the report "{reportToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsList;