import React from 'react'
import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box sx={{
      width: '100%',
      position: 'fixed',
      bottom: 0,
      left: 0,
      zIndex: 1201,
      bgcolor: 'background.paper',
      borderTop: 1,
      borderColor: 'divider',
      py: 1,
      textAlign: 'center'
    }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} AroSys Chat App
      </Typography>
    </Box>
  )
}

export default Footer
