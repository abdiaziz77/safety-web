import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Warning,
  Error,
  CheckCircle,
  NotificationsActive,
} from '@mui/icons-material';

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 16); // for datetime-local
};

const formatDateForBackend = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toISOString().split('.')[0]; // keep YYYY-MM-DDTHH:mm:ss
};

const AlertFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '',
    message: '',
    type: 'General',
    status: 'Active',
    severity: 'Medium',
    affected_area: '',
    start_date: new Date().toISOString(),
    end_date: '',
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (id) {
      const fetchAlert = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/api/alerts/admin/alerts/${id}`,
            { withCredentials: true }
          );
          setAlertData(response.data);
        } catch (error) {
          console.error('Error fetching alert:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load alert',
            severity: 'error',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchAlert();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlertData({ ...alertData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!alertData.title.trim()) newErrors.title = 'Title is required';
    if (!alertData.message.trim()) newErrors.message = 'Message is required';
    if (!alertData.type) newErrors.type = 'Type is required';
    if (!alertData.status) newErrors.status = 'Status is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...alertData,
        start_date: formatDateForBackend(alertData.start_date),
        end_date: alertData.end_date ? formatDateForBackend(alertData.end_date) : null,
      };

      if (id) {
        await axios.put(
          `http://127.0.0.1:5000/api/alerts/admin/alerts/${id}`,
          payload,
          { withCredentials: true }
        );
        setSnackbar({
          open: true,
          message: 'Alert updated successfully',
          severity: 'success',
        });
      } else {
        await axios.post(
          `http://127.0.0.1:5000/api/alerts/admin/alerts`,
          payload,
          { withCredentials: true }
        );
        setSnackbar({
          open: true,
          message: 'Alert created successfully',
          severity: 'success',
        });
        navigate('/admin/dashboard/alerts');
      }
    } catch (error) {
      console.error('Error saving alert:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save alert',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const getSeverityIcon = () => {
    switch (alertData.severity) {
      case 'High':
        return <Error color="error" />;
      case 'Critical':
        return <Warning color="error" />;
      case 'Medium':
        return <Warning color="warning" />;
      case 'Low':
        return <CheckCircle color="success" />;
      default:
        return <NotificationsActive color="info" />;
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
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/dashboard/alerts')}
        sx={{ mb: 3 }}
      >
        Back to Alerts
      </Button>

      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Alert' : 'Create New Alert'}
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={alertData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={alertData.type}
                  onChange={handleChange}
                  error={!!errors.type}
                  required
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Weather">Weather</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="System">System</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={alertData.status}
                  onChange={handleChange}
                  error={!!errors.status}
                  required
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  name="severity"
                  value={alertData.severity}
                  onChange={handleChange}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Affected Area (optional)"
                name="affected_area"
                value={alertData.affected_area}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="datetime-local"
                name="start_date"
                value={formatDateForInput(alertData.start_date)}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date (optional)"
                type="datetime-local"
                name="end_date"
                value={alertData.end_date ? formatDateForInput(alertData.end_date) : ''}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={alertData.message}
                onChange={handleChange}
                multiline
                rows={4}
                error={!!errors.message}
                helperText={errors.message}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/dashboard/alerts')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Alert'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

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

export default AlertFormPage;
