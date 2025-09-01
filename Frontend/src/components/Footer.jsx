import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import LocationOnIcon from "@mui/icons-material/LocationOn"; // ✅ replaces MapPin
import GitHubIcon from "@mui/icons-material/GitHub"; // ✅ correct name
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn"; // ✅ correct name
import PublicIcon from "@mui/icons-material/Public"; // ✅ replaces Globe

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.main",
        color: "primary.contrastText",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand & Description */}
          <Grid item xs={12} md={6} lg={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/src/assets/image/logo.png"
                  alt="SafeZone101 Logo"
                  style={{ width: 24, height: 24 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    // fallback icon
                    const fallback = document.createElement("div");
                    fallback.innerHTML =
                      '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path fill="white" d="M12 2 2 7v6c0 5 3.7 9.4 9 10 5.3-.6 9-5 9-10V7l-9-5z"/></svg>';
                    e.target.parentNode.appendChild(fallback);
                  }}
                />
              </Box>
              <Typography variant="h5" component="h3" sx={{ fontWeight: "bold" }}>
                SafeZone101
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                maxWidth: "400px",
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Next-generation community safety platform connecting citizens with
              emergency responders. Real-time reporting, coordination, and
              response for police, fire, medical, and community safety.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                sx={{
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <TwitterIcon sx={{ width: 16, height: 16 }} />
              </IconButton>
              <IconButton
                sx={{
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <LinkedInIcon sx={{ width: 16, height: 16 }} />
              </IconButton>
              <IconButton
                sx={{
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                <GitHubIcon sx={{ width: 16, height: 16 }} />
              </IconButton>
            </Box>
          </Grid>

          {/* Emergency Services */}
          <Grid item xs={12} md={3} lg={2}>
            <Typography
              variant="h6"
              component="h4"
              sx={{ fontWeight: "semibold", mb: 3 }}
            >
              Emergency Services
            </Typography>
            <List dense sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              {[
                "Police Reports",
                "Fire Emergencies",
                "Medical Response",
                "Missing Persons",
                "Public Hazards",
                "Emergency Resources",
              ].map((item) => (
                <ListItem key={item} sx={{ px: 0, py: 0.5 }}>
                  <Link
                    href="#"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      "&:hover": { color: "primary.contrastText" },
                    }}
                  >
                    {item}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Contact & Support */}
          <Grid item xs={12} md={3} lg={2}>
            <Typography
              variant="h6"
              component="h4"
              sx={{ fontWeight: "semibold", mb: 3 }}
            >
              Contact & Support
            </Typography>
            <List dense sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
                  <PhoneIcon sx={{ width: 16, height: 16 }} />
                </ListItemIcon>
                <ListItemText primary="Emergency: 101" sx={{ m: 0 }} />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
                  <PhoneIcon sx={{ width: 16, height: 16 }} />
                </ListItemIcon>
                <ListItemText primary="Support: (555) 123-4567" sx={{ m: 0 }} />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
                  <MailIcon sx={{ width: 16, height: 16 }} />
                </ListItemIcon>
                <ListItemText primary="help@safezone101.com" sx={{ m: 0 }} />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 24, color: "inherit" }}>
                  <PublicIcon sx={{ width: 16, height: 16 }} />
                </ListItemIcon>
                <ListItemText primary="24/7 Operations Center" sx={{ m: 0 }} />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        {/* Emergency Notice */}
<Paper
  elevation={0}
  sx={{
    bgcolor: "#fff5f5", // ✅ white background
    border: "1px solid",
    borderColor: "error.main",
    borderRadius: 2,
    p: 4,
    mb: 4,
  }}
>
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        bgcolor: "error.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: 0.5,
      }}
    >
      <PhoneIcon
        sx={{ width: 12, height: 12, color: "error.contrastText" }}
      />
    </Box>
    <Box>
      <Typography
        variant="h6"
        component="h5"
        color="error.main"
        sx={{ fontWeight: "semibold", mb: 1 }}
      >
        Emergency Notice
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(0, 0, 0, 0.8)" }}
      >
        For immediate life-threatening emergencies,{" "}
        <strong>always call 101 first</strong>. SafeZone101 is designed
        to supplement and coordinate emergency response, not replace
        traditional emergency services.
      </Typography>
    </Box>
  </Box>
</Paper>

        {/* Bottom Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            pt: 4,
            borderTop: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.1)",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.6)",
              textAlign: { xs: "center", md: "left" },
            }}
          >
            © {currentYear} SafeZone101. All rights reserved.
            <Box component="span" sx={{ ml: 1 }}>
              Built for community safety and emergency response coordination.
            </Box>
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            {[
              "Privacy Policy",
              "Terms of Service",
              "Accessibility",
              "Security",
            ].map((item) => (
              <Link
                key={item}
                href="#"
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  textDecoration: "none",
                  "&:hover": { color: "primary.contrastText" },
                }}
              >
                {item}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
