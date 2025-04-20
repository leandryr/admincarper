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
  Container,
  Box,
  Grid,
  Paper,
  Grow,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Noticias', href: '/' },
    { label: 'Empadronamiento', href: '/registro' },
    { label: 'Contacto', href: '/' },
  ];

  const loginItems = [
    { label: 'Administrador', href: '/admin/login' },
    { label: 'Socio', href: '#' },
    { label: 'Integrante', href: '#' },
    { label: 'Organizador', href: '#' },
  ];

  const toggleDrawer = () => setMobileOpen(!mobileOpen);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const drawer = (
    <Box onClick={toggleDrawer} sx={{ width: 250 }}>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} href={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {loginItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} href={item.href}>
              <ListItemText primary={`Ingresar ${item.label}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <CssBaseline />

      {/* el Navbar */}
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

          {!isMobile && navItems.map((item) => (
            <Button
              key={item.label}
              component={Link}
              href={item.href}
              sx={{ color: '#2e7d32', textTransform: 'none', mx: 0.5 }}
            >
              {item.label}
            </Button>
          ))}

          {!isMobile && (
            <Button onClick={openMenu} sx={{ color: '#2e7d32', textTransform: 'none', ml: 2 }}>
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

      {/* el Drawer para móvil */}
      <Drawer
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>

      {/* este es el Hero */}
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
          </Typography>
        </Grow>

        <Grow in timeout={1500}>
          <Typography variant="h5" color="text.secondary" paragraph>
            Noticias, eventos y comunidad. ¡Únete hoy!
          </Typography>
        </Grow>

        <Grow in timeout={2000}>
          <Button
            size="large"
            variant="contained"
            sx={{
              mt: 3,
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Conócenos
          </Button>
        </Grow>
      </Box>

      {/* Última Noticia */}
      <Container sx={{ mb: 6 }}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            bgcolor: '#f1f8e9',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 3
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{ color: '#2e7d32', fontWeight: 'bold' }}
            >
              Última Noticia
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              ¡Empadronamiento disponible! Ayúdanos a hacer crecer nuestra comunidad.
              Empadrónate hoy y forma parte de CARPER.
            </Typography>
            <Button
              component={Link}
              href="/registro"
              variant="contained"
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              Empadrónate
            </Button>
          </Box>
          <Box sx={{ flex: 1, position: 'relative', height: 150 }}>
            <Image
              src="/logo-carper.png"
              alt="Empadronamiento"
              fill
              style={{ objectFit: 'contain', opacity: 0.1 }}
            />
          </Box>
        </Paper>
      </Container>

      {/* Noticias Destacadas */}
      <Container sx={{ py: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 3 }}
        >
          Noticias Destacadas
        </Typography>

        <Grid container columnSpacing={4} rowSpacing={4}>
          {['Apertura temporada', 'Torneo interno', 'Equipo campeón'].map((title, i) => (
            <Grid key={i} span={{ xs: 12, sm: 6, md: 4 }}>
              <Grow in timeout={500 * (i + 1)}>
                <Paper elevation={6} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Breve descripción de la noticia «{title}». Información relevante.
                  </Typography>
                  <Button size="small" sx={{ mt: 2, color: '#2e7d32' }}>
                    Leer más
                  </Button>
                </Paper>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ py: 3, textAlign: 'center', bgcolor: '#f4f6f8' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Club CARPER. Sitio Web en construcción.
        </Typography>
      </Box>
    </>
  );
}
