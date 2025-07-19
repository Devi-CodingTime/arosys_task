import React from 'react'
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  AppBar,
  Toolbar
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
function Header() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  return (
    <>
      <AppBar position="static" color="primary" elevation={4}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ChatIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Chat App
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {user?.name}
            </Typography>
            <IconButton color="inherit" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  )
}

export default Header
