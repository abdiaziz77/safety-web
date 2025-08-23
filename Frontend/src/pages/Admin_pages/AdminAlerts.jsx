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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Delete,
  Edit,
  Visibility,
  Add,
  Refresh,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminAlertsList = () => {
  const [alerts, setAlerts] = useState([]); // initialize as empty array
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/api/alerts/admin/alerts', {
        withCredentials: true
      });
      // Safe check: make sure it's an array
      const alertsData = Array.isArray(response.data) ? response.data : response.data?.alerts || [];
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setSnackbar({ open: true, message: 'Failed to load alerts', severity: 'error' });
      
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      await axios.patch(`/api/alerts/admin/alerts/${alertId}/status`, 
        { status: newStatus },
        { withCredentials: true }
      );
      setSnackbar({ open: true, message: 'Alert status updated', severity: 'success' });
      fetchAlerts();
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleDeleteAlert = async () => {
    if (!currentAlert) return;
    try {
      await axios.delete(`/api/alerts/admin/alerts/${currentAlert.id}`, { withCredentials: true });
      setSnackbar({ open: true, message: 'Alert deleted', severity: 'success' });
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      setSnackbar({ open: true, message: 'Failed to delete alert', severity: 'error' });
    } finally {
      setOpenDeleteDialog(false);
      setCurrentAlert(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle color="success" />;
      case 'Inactive':
        return <Warning color="warning" />;
      case 'Resolved':
        return <CheckCircle color="info" />;
      case 'Critical':
        return <Error color="error" />;
      default:
        return <Warning color="warning" />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Alerts Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/dashboard/alertsform')}
            sx={{ mr: 2 }}
          >
            Create Alert
          </Button>
          <IconButton onClick={fetchAlerts}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>{alert.title}</TableCell>
                  <TableCell>
                    <Chip label={alert.type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(alert.status)}
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={alert.status}
                          onChange={(e) => handleStatusChange(alert.id, e.target.value)}
                        >
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="Inactive">Inactive</MenuItem>
                          <MenuItem value="Critical">Critical</MenuItem>
                          <MenuItem value="Resolved">Resolved</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCurrentAlert(alert);
                          setOpenDialog(true);
                        }}
                      >
                        <Visibility color="primary" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/dashboard/alertsform/${alert.id}/edit`)}
                      >
                        <Edit color="secondary" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCurrentAlert(alert);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No alerts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Alert Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent dividers>
          {currentAlert && (
            <Box>
              <Typography variant="h6" gutterBottom>{currentAlert.title}</Typography>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {currentAlert.type} • {currentAlert.status}
              </Typography>
              <Box my={2}>
                <Typography variant="body1">{currentAlert.message}</Typography>
              </Box>
              {currentAlert.affected_area && (
                <Box my={2}>
                  <Typography variant="subtitle2">Affected Area:</Typography>
                  <Typography>{currentAlert.affected_area}</Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Typography variant="caption">
                  Created: {currentAlert.created_at ? new Date(currentAlert.created_at).toLocaleString() : '-'}
                </Typography>
                <Typography variant="caption">
                  Updated: {currentAlert.updated_at ? new Date(currentAlert.updated_at).toLocaleString() : '-'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (currentAlert) {
                setOpenDialog(false);
                navigate(`/admin/dashboard/alertsform/${alert.id}/edit`);
              }
            }}
          >
            Edit Alert
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this alert?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAlert}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAlertsList;
