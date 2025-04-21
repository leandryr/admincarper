'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Grow,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loginItems = [
    { label: 'Admin', href: '/admin/login' }
  ];

  const toggleDrawer = () => setMobileOpen(!mobileOpen);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const drawer = (
    <Box onClick={toggleDrawer} sx={{ width: 250 }}>
      <List>
        {loginItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} href={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <CssBaseline />

      {/* Navbar */}
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: 'blur(10px)', bgcolor: 'rgba(255,255,255,0.8)' }}
      >
        <Toolbar>
          {isMobile ? (
            <IconButton edge="start" onClick={toggleDrawer} aria-label="menu">
              <MenuIcon sx={{ color: '#2e7d32' }} />
            </IconButton>
          ) : (
            <Box sx={{ width: 36, height: 36, position: 'relative', mr: 2 }}>
              <Image
                src="/logo-carper.png"
                alt="Logo CARPER"
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
          )}

          <Typography
            variant="h6"
            sx={{ color: '#2e7d32', fontWeight: 'bold', flexGrow: 1 }}
          >
            Club CARPER
          </Typography>

          {!isMobile && (
            <Button onClick={openMenu} sx={{ color: '#2e7d32', textTransform: 'none' }}>
              Ingresar
            </Button>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            PaperProps={{ sx: { mt: 1 } }}
          >
            {loginItems.map((item) => (
              <MenuItem
                key={item.label}
                component={Link}
                href={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil */}
      <Drawer
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>

      {/* Hero */}
      <Box
        sx={{
          mt: { xs: 8, md: 10 },
          py: { xs: 6, md: 12 },
          textAlign: 'center',
          bgcolor: 'radial-gradient(circle at top, #e8f5e9, #ffffff)'
        }}
      >
        <Grow in timeout={1000}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ color: '#1b5e20', fontWeight: 'bold' }}
          >
            Vive la pasión de CARPER  
            <br />
            eventos y comunidad. ¡Regístrate Hoy!
          </Typography>
        </Grow>

        <Grow in timeout={1500}>
          <Button
            size="large"
            variant="contained"
            component={Link}
            href="/registro"
            sx={{
              mt: 3,
              bgcolor: '#2e7d32',
              textTransform: 'none',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Empadrónate
          </Button>
        </Grow>
      </Box>

      {/* Footer fijo */}
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          py: 2,
          textAlign: 'center',
          bgcolor: '#f4f6f8'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Propiedad de Carper | Desarrollado por{' '}
          <a
            href="https://rivasdev.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            RivasDev
          </a>
          <br />
          2025. Todos los derechos reservados
        </Typography>
      </Box>
    </>
  );
}
