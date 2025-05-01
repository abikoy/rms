import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Brightness4 as ThemeIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';

const Settings = () => {
  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: true,
    language: 'English',
    autoApproval: false,
  });

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Settings
        </Typography>

        <Card>
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email Notifications"
                  secondary="Receive email notifications for important updates"
                />
                <Switch
                  edge="end"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <ThemeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Dark Mode"
                  secondary="Toggle dark/light theme"
                />
                <Switch
                  edge="end"
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Two-Factor Authentication"
                  secondary="Enable extra security layer"
                />
                <Switch
                  edge="end"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Auto-Approval"
                  secondary="Automatically approve resource requests"
                />
                <Switch
                  edge="end"
                  checked={settings.autoApproval}
                  onChange={() => handleToggle('autoApproval')}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained" color="primary">Save Changes</Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Settings;
