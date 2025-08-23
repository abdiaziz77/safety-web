import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from "@mui/material";
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Shield,
  Settings,
  AlertTriangle,
  ChevronDown,
  Search,
  File,
  AlertCircle,
  Users,
  Lock
} from "lucide-react";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);

  const faqs = [
    {
      question: "How do I report a safety concern?",
      answer:
        "Navigate to the 'Submit Report' section in your dashboard, fill out the form with details of the incident, including date, time, location, and description, then submit. You'll receive a confirmation email or in-app notification once it's processed. Ensure all required fields are completed for faster processing.",
      category: "Reporting"
    },
    {
      question: "Why am I not receiving alerts?",
      answer:
        "Check your notification settings under 'Settings' > 'Notification Preferences.' Ensure 'Safety Alerts' is enabled and your device's location services are active. Verify your email and phone number are correct. If issues persist, contact support at support@safezone101.com.",
      category: "Alerts"
    },
    {
      question: "How can I update my emergency contacts?",
      answer:
        "Go to 'Settings' > 'Emergency Contacts' in the app. You can add, edit, or remove contacts by filling in their name, phone number, and relation. Click 'Save Changes' to update your profile. Ensure contact details are accurate for emergency use.",
      category: "Account"
    },
    {
      question: "What should I do if I see suspicious activity?",
      answer:
        "1. Stay safe and do not approach the individual(s).\n2. Note details like appearance, location, and time.\n3. Submit a report via the 'Submit Report' section in the app.\n4. For immediate threats, call local authorities or the emergency hotline (1-800-SAFE-ZONE) first.",
      category: "Safety"
    },
    {
      question: "How do I change my account type?",
      answer:
        "Account types (Citizen or Police) are assigned during registration based on verification. To change your account type, contact support at support@safezone101.com with official documentation (e.g., ID for citizens or badge for police). Changes may take up to 48 hours to process.",
      category: "Account"
    },
    {
      question: "How do I reset my password?",
      answer:
        "Click 'Forgot Password' on the login page, enter your registered email, and follow the instructions in the reset email. Check your spam folder if the email doesn't arrive within 10 minutes. For further assistance, contact support.",
      category: "Account"
    },
    {
      question: "Can I submit a report anonymously?",
      answer:
        "Yes, SafeZone101 allows anonymous reporting. In the 'Submit Report' form, select the 'Anonymous' option. Note that anonymous reports may limit follow-up communication, so provide as much detail as possible.",
      category: "Reporting"
    },
    {
      question: "How do I view my submitted reports?",
      answer:
        "Go to the 'My Reports' section in your dashboard to view all submitted reports. You can filter by status (e.g., Pending, Reviewed) and view details or updates. Contact support if you encounter issues accessing your reports.",
      category: "Reporting"
    },
  ];

  const quickLinks = [
    {
      name: "Submit a Report",
      to: "/reports",
      icon: <FileText size={20} />,
      description: "File a new safety incident report"
    },
    {
      name: "Account Settings",
      to: "/settings",
      icon: <Settings size={20} />,
      description: "Update your profile and preferences"
    },
    {
      name: "Safety Resources",
      to: "/safety",
      icon: <Shield size={20} />,
      description: "Learn safety tips and guidelines"
    },
  ];

  const contactMethods = [
    {
      method: "Email Support",
      details: "support@safezone101.com",
      icon: <Mail size={20} />,
      action: "mailto:support@safezone101.com"
    },
    {
      method: "Emergency Hotline",
      details: "1-800-SAFE-ZONE (723-3966)",
      icon: <Phone size={20} />,
      action: "tel:18007233966"
    },
    {
      method: "Live Chat",
      details: "Available 24/7 in the app",
      icon: <MessageSquare size={20} />,
      action: "/chat"
    },
  ];

  const resources = [
    {
      name: "Privacy Policy",
      icon: <Lock size={16} />,
      url: "/privacy"
    },
    {
      name: "Terms of Service",
      icon: <File size={16} />,
      url: "/terms"
    },
    {
      name: "Community Guidelines",
      icon: <Users size={16} />,
      url: "/guidelines"
    },
    {
      name: "Safety Tips",
      icon: <AlertCircle size={16} />,
      url: "/safety-tips"
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <Paper elevation={3} className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-t-lg">
          <div className="flex items-center mb-4">
            <HelpCircle size={40} className="mr-3" />
            <Typography variant="h3" component="h1" className="font-bold">
              SafeZone Help Center
            </Typography>
          </div>
          <Typography variant="subtitle1" className="mb-6">
            Find answers to your questions or get in touch with our support team
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search className="text-gray-400 mr-2" />,
              style: { backgroundColor: 'white', borderRadius: '8px' }
            }}
          />
        </Paper>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - FAQ */}
          <div className="lg:col-span-2 space-y-6">
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h5" component="h2" className="font-semibold mb-4 flex items-center">
                <HelpCircle className="mr-2" size={24} />
                Frequently Asked Questions
              </Typography>
              
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto mb-4 text-gray-400" size={40} />
                  <Typography variant="body1">No results found for "{searchTerm}"</Typography>
                  <Typography variant="body2" className="text-gray-500 mt-2">
                    Try different keywords or contact our support team
                  </Typography>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFaqs.map((faq, index) => (
                    <Accordion 
                      key={index} 
                      expanded={expanded === `panel${index}`}
                      onChange={handleChange(`panel${index}`)}
                      elevation={2}
                    >
                      <AccordionSummary
                        expandIcon={<ChevronDown />}
                        aria-controls={`panel${index}-content`}
                        id={`panel${index}-header`}
                      >
                        <div className="flex items-center">
                          <Chip 
                            label={faq.category} 
                            size="small" 
                            className="mr-3" 
                            color="primary"
                          />
                          <Typography className="font-medium">{faq.question}</Typography>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography className="whitespace-pre-line text-gray-700">
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              )}
            </Paper>
          </div>

          {/* Right Column - Quick Links & Contact */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h5" component="h2" className="font-semibold mb-4 flex items-center">
                <AlertTriangle className="mr-2" size={24} />
                Quick Actions
              </Typography>
              <List>
                {quickLinks.map((link, index) => (
                  <React.Fragment key={index}>
                    <ListItem 
                      button 
                      component={Link} 
                      to={link.to}
                      className="hover:bg-blue-50 rounded-lg"
                    >
                      <ListItemIcon className="text-blue-600">
                        {link.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={link.name}
                        secondary={link.description}
                        primaryTypographyProps={{ className: "font-medium" }}
                      />
                    </ListItem>
                    {index < quickLinks.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            {/* Contact Support */}
            <Paper elevation={2} className="p-6 rounded-lg bg-blue-50 border border-blue-200">
              <Typography variant="h5" component="h2" className="font-semibold mb-4 flex items-center">
                <MessageSquare className="mr-2" size={24} />
                Contact Support
              </Typography>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      {method.icon}
                    </div>
                    <div>
                      <Typography variant="subtitle1" className="font-medium">
                        {method.method}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600 mb-2">
                        {method.details}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        href={method.action}
                        className="mt-1"
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Paper>

            {/* Resources */}
            <Paper elevation={2} className="p-6 rounded-lg">
              <Typography variant="h5" component="h2" className="font-semibold mb-4 flex items-center">
                <FileText className="mr-2" size={24} />
                Resources
              </Typography>
              <List dense>
                {resources.map((resource, index) => (
                  <ListItem 
                    key={index} 
                    button 
                    component={Link} 
                    to={resource.url}
                    className="hover:bg-gray-100 rounded-lg"
                  >
                    <ListItemIcon className="min-w-0 mr-3 text-gray-500">
                      {resource.icon}
                    </ListItemIcon>
                    <ListItemText primary={resource.name} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </div>
        </div>

        {/* Bottom CTA */}
        <Paper elevation={3} className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <Typography variant="h6" className="font-bold mb-2">
                Still need help?
              </Typography>
              <Typography variant="body1">
                Our support team is available 24/7 to assist you
              </Typography>
            </div>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              href="mailto:support@safezone101.com"
              startIcon={<Mail />}
              className="bg-white text-blue-700 hover:bg-gray-100"
            >
              Contact Support
            </Button>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Help;