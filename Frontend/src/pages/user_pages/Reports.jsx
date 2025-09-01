import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Chip,
  IconButton,
  Box,
  LinearProgress,
  useMediaQuery,
  useTheme,
  MobileStepper
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  CloudUpload,
  Delete,
  Image,
  Videocam,
  Mic,
  AttachFile,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from "@mui/icons-material";

const Reports = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState({
    // Basic Information
    report_type: "",
    title: "",
    description: "",
    date: new Date(),
    time: new Date(),
    urgency: "medium",
    
    // Location Details
    location: "",
    latitude: "",
    longitude: "",
    location_type: "public",
    location_details: "",
    
    // Personal Information
    anonymous: false,
    full_name: "",
    email: "",
    phone: "",
    address: "",
    
    // Incident Details
    witnesses: false,
    witness_details: "",
    evidence_available: false,
    evidence_details: "",
    police_involved: false,
    police_details: "",
    
    // Additional Information
    category: "",
    subcategory: "",
    tags: [],
    custom_fields: {},
  });


  const reportTypes = [
    "Crime",
    "Accident",
    "Public Safety",
    "Environmental",
    "Infrastructure",
    "Animal Related",
    "Noise Complaint",
    "Other"
  ];

  const crimeSubcategories = [
    "Theft",
    "Burglary",
    "Assault",
    "Vandalism",
    "Fraud",
    "Cyber Crime",
    "Harassment",
    "Hate Crime"
  ];

  const accidentSubcategories = [
    "Traffic Accident",
    "Workplace Accident",
    "Slip and Fall",
    "Other Accident"
  ];

  const steps = [
    "Report Type",
    "Incident Details",
    "Location Information",
    "Personal Information",
    "Media Uploads",
    "Additional Details",
    "Review & Submit"
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.type.startsWith('video/') || 
      file.type.startsWith('audio/')
    );
    
    if (validFiles.length !== files.length) {
      toast.warning("Only image, video, and audio files are allowed");
    }
    
    setMediaFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type.split('/')[0],
      name: file.name,
      size: file.size,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    }))]);
  };

  const handleRemoveFile = (id) => {
    setMediaFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadMedia = async () => {
    if (mediaFiles.length === 0) return [];
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    mediaFiles.forEach(file => {
      formData.append('media', file.file);
    });
    
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/upload-media", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setIsUploading(false);
      return response.data.mediaUrls;
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to upload media files");
      console.error("Media upload error:", error);
      return [];
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
  };

  const handleTimeChange = (time) => {
    setFormData(prev => ({
      ...prev,
      time: time
    }));
  };

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleStepComplete = (step) => {
    setCompleted(prev => ({ ...prev, [step]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First verify session is active
      const authCheck = await axios.get('http://127.0.0.1:5000/api/auth/get_current_user', {
        withCredentials: true
      });
      
     

      // Upload media files first
      const mediaUrls = await uploadMedia();
      
      const payload = { 
        ...formData, 
        date: formData.date.toISOString(),
        time: formData.time.toISOString(),
        media: mediaUrls
      };

      // Submit report with session
      await axios.post("http://127.0.0.1:5000/api/reports/", payload, {
        withCredentials: true
      });

      toast.success("Report submitted successfully!");
      // Reset form
      setFormData({
        report_type: "",
        title: "",
        description: "",
        date: new Date(),
        time: new Date(),
        urgency: "medium",
        location: "",
        latitude: "",
        longitude: "",
        location_type: "public",
        location_details: "",
        anonymous: false,
        full_name: "",
        email: "",
        phone: "",
        address: "",
        witnesses: false,
        witness_details: "",
        evidence_available: false,
        evidence_details: "",
        police_involved: false,
        police_details: "",
        category: "",
        subcategory: "",
        tags: [],
        custom_fields: {},
      });
      setMediaFiles([]);
      setActiveStep(0);
      navigate('/dashboard/myreports');
    } catch (error) {
      console.error("Error submitting report:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate('/login');
      } else {
        toast.error("Failed to submit report. Please try again!");
      }
    }
  };

  
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                name="report_type"
                value={formData.report_type}
                onChange={handleChange}
                required
              >
                <MenuItem value=""><em>Select a report type</em></MenuItem>
                {reportTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={isMobile ? 3 : 4}
              required
            />

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Incident"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Time of Incident"
                  value={formData.time}
                  onChange={handleTimeChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </div>

            <FormControl component="fieldset" fullWidth>
              <Typography variant="subtitle1">Urgency Level</Typography>
              <RadioGroup
                row={!isMobile}
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                sx={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}
              >
                <FormControlLabel value="low" control={<Radio />} label="Low" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                <FormControlLabel value="high" control={<Radio />} label="High" />
                <FormControlLabel value="critical" control={<Radio />} label="Critical" />
              </RadioGroup>
            </FormControl>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />

            {formData.report_type === "Crime" && (
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Select a subcategory</em></MenuItem>
                  {crimeSubcategories.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {formData.report_type === "Accident" && (
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Select a subcategory</em></MenuItem>
                  {accidentSubcategories.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.witnesses}
                  onChange={handleChange}
                  name="witnesses"
                />
              }
              label="Were there any witnesses?"
            />

            {formData.witnesses && (
              <TextField
                fullWidth
                label="Witness Details"
                name="witness_details"
                value={formData.witness_details}
                onChange={handleChange}
                multiline
                rows={2}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.police_involved}
                  onChange={handleChange}
                  name="police_involved"
                />
              }
              label="Were police involved?"
            />

            {formData.police_involved && (
              <TextField
                fullWidth
                label="Police Details"
                name="police_details"
                value={formData.police_details}
                onChange={handleChange}
                multiline
                rows={2}
              />
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <TextField
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
              />

              <TextField
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>

            <FormControl fullWidth>
              <InputLabel>Location Type</InputLabel>
              <Select
                name="location_type"
                value={formData.location_type}
                onChange={handleChange}
              >
                <MenuItem value="public">Public Place</MenuItem>
                <MenuItem value="private">Private Property</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="residential">Residential</MenuItem>
                <MenuItem value="online">Online/Virtual</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Location Details"
              name="location_details"
              value={formData.location_details}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.anonymous}
                  onChange={handleChange}
                  name="anonymous"
                />
              }
              label="Submit anonymously"
            />

            {!formData.anonymous && (
              <>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <Typography variant="h6">Upload Media Evidence</Typography>
            <Typography variant="body2" color="textSecondary">
              You can upload images, videos, or audio files related to the incident (optional)
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*, video/*, audio/*"
              style={{ display: 'none' }}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current.click()}
              fullWidth
              sx={{ py: 2 }}
            >
              Select Files
            </Button>

            {isUploading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" textAlign="center" mt={1}>
                  Uploading: {uploadProgress}%
                </Typography>
              </Box>
            )}

            {mediaFiles.length > 0 && (
              <div className="mt-4">
                <Typography variant="subtitle1" gutterBottom>
                  Selected Files:
                </Typography>
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                  {mediaFiles.map((media) => (
                    <Paper key={media.id} elevation={2} sx={{ p: 2 }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {media.type === 'image' && <Image color="primary" sx={{ mr: 1 }} />}
                          {media.type === 'video' && <Videocam color="primary" sx={{ mr: 1 }} />}
                          {media.type === 'audio' && <Mic color="primary" sx={{ mr: 1 }} />}
                          <Typography variant="body2" noWrap sx={{ maxWidth: isMobile ? 100 : 150 }}>
                            {media.name}
                          </Typography>
                        </div>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(media.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                      {media.preview && (
                        <Box sx={{ mt: 1 }}>
                          <img
                            src={media.preview}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: 100 }}
                          />
                        </Box>
                      )}
                    </Paper>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.evidence_available}
                  onChange={handleChange}
                  name="evidence_available"
                />
              }
              label="Do you have additional evidence?"
            />

            {formData.evidence_available && (
              <TextField
                fullWidth
                label="Evidence Details"
                name="evidence_details"
                value={formData.evidence_details}
                onChange={handleChange}
                multiline
                rows={3}
              />
            )}

            <TextField
              fullWidth
              label="Tags (comma separated)"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim());
                setFormData(prev => ({ ...prev, tags }));
              }}
            />

            <Typography variant="subtitle1">Custom Fields</Typography>
            <TextField
              fullWidth
              label="Field Name"
              value={formData.custom_fields.fieldName || ''}
              onChange={(e) => {
                const fieldName = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  custom_fields: {
                    ...prev.custom_fields,
                    fieldName
                  }
                }));
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Field Value"
              value={formData.custom_fields.fieldValue || ''}
              onChange={(e) => {
                const fieldValue = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  custom_fields: {
                    ...prev.custom_fields,
                    fieldValue
                  }
                }));
              }}
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <Typography variant={isMobile ? "h6" : "h5"}>Review Your Report</Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Report Type:</Typography>
                    <Typography>{formData.report_type}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Title:</Typography>
                    <Typography>{formData.title}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Description:</Typography>
                    <Typography>{formData.description}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Date:</Typography>
                    <Typography>{formData.date.toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Time:</Typography>
                    <Typography>{formData.time.toLocaleTimeString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Urgency:</Typography>
                    <Typography>{formData.urgency}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Location Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Location:</Typography>
                    <Typography>{formData.location}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Latitude:</Typography>
                    <Typography>{formData.latitude || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Longitude:</Typography>
                    <Typography>{formData.longitude || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Location Type:</Typography>
                    <Typography>{formData.location_type}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Location Details:</Typography>
                    <Typography>{formData.location_details || 'Not provided'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Divider sx={{ mb: 2 }} />
                {formData.anonymous ? (
                  <Typography>Report will be submitted anonymously</Typography>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Full Name:</Typography>
                      <Typography>{formData.full_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Email:</Typography>
                      <Typography>{formData.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Phone:</Typography>
                      <Typography>{formData.phone || 'Not provided'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Address:</Typography>
                      <Typography>{formData.address || 'Not provided'}</Typography>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>

            {mediaFiles.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Media Attachments</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {mediaFiles.map((media, index) => (
                      <Grid item xs={12} sm={6} md={4} key={media.id}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                          <div className="flex items-center">
                            {media.type === 'image' && <Image color="primary" sx={{ mr: 1 }} />}
                            {media.type === 'video' && <Videocam color="primary" sx={{ mr: 1 }} />}
                            {media.type === 'audio' && <Mic color="primary" sx={{ mr: 1 }} />}
                            <Typography variant="body2">{media.name}</Typography>
                          </div>
                          {media.preview && (
                            <Box sx={{ mt: 1 }}>
                              <img
                                src={media.preview}
                                alt={`Preview ${index + 1}`}
                                style={{ maxWidth: '100%', maxHeight: 100 }}
                              />
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Typography variant="body2" color="textSecondary">
              By submitting this report, you confirm that the information provided is accurate to the best of your knowledge.
            </Typography>
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 pt-2 pb-4 md:pt-4 md:pb-8">
  <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-4 md:p-6 mt-2 mb-4 md:mt-4 md:mb-6">
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: isMobile ? 'center' : 'left' }}>
          Incident Report Submission
        </Typography>

        {isMobile ? (
          <MobileStepper
            variant="text"
            steps={steps.length}
            position="static"
            activeStep={activeStep}
            sx={{ 
              mb: 4, 
              bgcolor: 'transparent',
              '& .MuiMobileStepper-dot': {
                width: 8,
                height: 8,
              }
            }}
            nextButton={
              <Button size="small" onClick={handleNext} disabled={activeStep === steps.length - 1}>
                Next
                <KeyboardArrowRight />
              </Button>
            }
            backButton={
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                <KeyboardArrowLeft />
                Back
              </Button>
            }
          />
        ) : (
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label} completed={completed[index]}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {isMobile && (
          <Typography variant="subtitle1" textAlign="center" sx={{ mb: 2, fontWeight: 'bold' }}>
            {steps[activeStep]}
          </Typography>
        )}

        <div className="p-2 md:p-4">
          {getStepContent(activeStep)}
        </div>

        <div className={`flex ${isMobile ? 'flex-col-reverse gap-3' : 'justify-between'} mt-6`}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              size={isMobile ? "medium" : "large"}
              onClick={handleSubmit}
              disabled={isUploading}
              fullWidth={isMobile}
            >
              Submit Report
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size={isMobile ? "medium" : "large"}
              onClick={() => {
                handleStepComplete(activeStep);
                handleNext();
              }}
              fullWidth={isMobile}
            >
              Next
            </Button>
          )}
        </div>

        <Box display="flex" justifyContent="flex-end" mb={2} mt={isMobile ? 2 : 0}>
          <Button
            variant="outlined"
            component={Link}
            to="/dashboard/myreports"
            fullWidth={isMobile}
          >
            View My Reports
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Reports;