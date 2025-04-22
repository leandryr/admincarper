'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemText,
  Typography, Divider, CircularProgress, Collapse, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const drawerWidth = 220;

export default function SidebarAdmin() {
  const [rol, setRol] = useState(null);
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [ultimaVersion, setUltimaVersion] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me');
        const { user } = await res.json();
        setUser(user);
        setRol(user.rol);
      } catch {
        window.location.href = '/admin/login';
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (rol === 'superadmin') {
      fetch('/api/actualizaciones/ultima')
        .then(res => res.json())
        .then(data => {
          if (data?.version) setUltimaVersion(data.version);
        })
        .catch(() => setUltimaVersion(''));
    }
  }, [rol]);

  const cerrarSesion = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    localStorage.clear();
    window.location.href = '/admin/login';
  };

  const traducirRol = rol => {
    if (rol === 'superadmin') return 'Administrador';
    if (rol === 'asistente') return 'Asistente';
    return 'Solo Lectura';
  };

  if (cargando) {
    return (
      <Box
        sx={{
          width: drawerWidth,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#e8f5e9',
            color: '#2e7d32',
            borderRight: '1px solid #c8e6c9',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box sx={{
              width: 64, height: 64, position: 'relative',
              bgcolor: 'white', borderRadius: '50%', p: 1
            }}>
              <Image src="/logo-carper.png" alt="Logo" fill style={{ objectFit: 'contain' }} />
            </Box>
          </Box>

          {user && (
            <Box textAlign="center" sx={{ mt: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1b5e20' }}>
                {user.nombre} {user.apellido}
              </Typography>
              <Typography variant="caption" sx={{ color: '#388e3c', display: 'block' }}>
                {traducirRol(rol)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#388e3c', display: 'block' }}>
                {user.cargo}
              </Typography>
            </Box>
          )}

          <Divider sx={{ borderColor: '#a5d6a7', mx: 2 }} />

          <List>
            <ListItem disablePadding>
              <Link href="/admin" passHref legacyBehavior>
                <ListItemButton sx={{ px: 3 }}>
                  <HomeIcon sx={{ mr: 1 }} />
                  <ListItemText primary="Inicio" />
                </ListItemButton>
              </Link>
            </ListItem>

            <ListItem disablePadding>
              <Link href="/admin/registros" passHref legacyBehavior>
                <ListItemButton sx={{ px: 3 }}>
                  <GroupIcon sx={{ mr: 1 }} />
                  <ListItemText primary="Integrantes" />
                </ListItemButton>
              </Link>
            </ListItem>

            {(rol === 'superadmin' || rol === 'asistente') && (
              <ListItem disablePadding>
                <Link href="/admin/importar" passHref legacyBehavior>
                  <ListItemButton sx={{ px: 3 }}>
                    <UploadFileIcon sx={{ mr: 1 }} />
                    <ListItemText primary="Importar" />
                  </ListItemButton>
                </Link>
              </ListItem>
            )}

            {rol === 'superadmin' && (
              <>
                <ListItem disablePadding>
                  <Link href="/admin/usuarios" passHref legacyBehavior>
                    <ListItemButton sx={{ px: 3 }}>
                      <PeopleAltIcon sx={{ mr: 1 }} />
                      <ListItemText primary="Usuarios" />
                    </ListItemButton>
                  </Link>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton onClick={() => setOpenHistorial(!openHistorial)} sx={{ px: 3 }}>
                    <HistoryIcon sx={{ mr: 1 }} />
                    <ListItemText primary="Historial" />
                    {openHistorial ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openHistorial} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <Link href="/admin/historial" passHref legacyBehavior>
                      <ListItemButton sx={{ pl: 6 }}>
                        <ListItemText primary="Acciones" />
                      </ListItemButton>
                    </Link>
                    <Link href="/admin/actualizaciones" passHref legacyBehavior>
                      <ListItemButton sx={{ pl: 6 }}>
                        <ListItemText primary="Actualizaciones" />
                      </ListItemButton>
                    </Link>
                  </List>
                </Collapse>
              </>
            )}
          </List>
        </Box>

        <Box sx={{ mb: 2, px: 2 }}>
          <Divider sx={{ borderColor: '#a5d6a7' }} />
          <Box textAlign="center" mt={1}>
            <Typography variant="caption" color="text.secondary">
              {ultimaVersion ? `v${ultimaVersion}` : 'v1.0.2'}
            </Typography>
          </Box>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setConfirmLogoutOpen(true)}
              sx={{ px: 3, '&:hover': { bgcolor: '#ffcdd2', color: '#c62828' } }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>

      <Dialog open={confirmLogoutOpen} onClose={() => setConfirmLogoutOpen(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cerrar la sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogoutOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
