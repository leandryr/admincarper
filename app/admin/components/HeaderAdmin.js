'use client';

import { AppBar, Toolbar, Typography, Box, useTheme, useMediaQuery } from '@mui/material';

const drawerWidth = 220;

export default function HeaderAdmin() {
  const theme = useTheme();
  // `isMobile` ya no es necesario, usamos directamente los breakpoints en el sx
  return (
    <>
      {/* Oculto en xs, muestro en sm+ */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: '#e8f5e9',
            color: '#1b5e20',
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            borderBottom: '1px solid #c8e6c9',
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Panel Administrativo – Club CARPER
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Compensación sólo en pantallas ≥ sm */}
        <Box sx={{ height: '64px' }} />
      </Box>
    </>
  );
}
