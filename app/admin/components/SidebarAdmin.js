'use client';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import HistoryIcon from '@mui/icons-material/History';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const drawerWidth = 220;

export default function SidebarAdmin() {
  const router = useRouter();
  const [rol, setRol] = useState(null);
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return router.push('/admin/login');
        const data = await res.json();
        setRol(data.user.rol);
        setUser(data.user);
        setCargando(false);
      } catch {
        router.push('/admin/login');
      }
    };
    verificar();
  }, [router]);

  const cerrarSesion = async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.clear();
    router.push('/admin/login');
  };

  const traducirRol = (rol) => {
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
            <Box
              sx={{
                width: 64,
                height: 64,
                position: 'relative',
                bgcolor: 'white',
                borderRadius: '50%',
                p: 1
              }}
            >
              <Image
                src="/logo-carper.png"
                alt="Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
          </Box>

          {user && (
            <Box textAlign="center" sx={{ mt: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#1b5e20' }}>
                {user.nombre} {user.apellido}
              </Typography>
              <Typography variant="caption" sx={{ color: '#388e3c' }}>
                {traducirRol(rol)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ borderColor: '#a5d6a7', mx: 2 }} />

          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => router.push('/admin')}
                sx={{ px: 3, '&:hover': { bgcolor: '#c8e6c9', color: '#1b5e20' } }}
              >
                <HomeIcon sx={{ mr: 1 }} />
                <ListItemText primary="Inicio" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => router.push('/admin/registros')}
                sx={{ px: 3, '&:hover': { bgcolor: '#c8e6c9', color: '#1b5e20' } }}
              >
                <GroupIcon sx={{ mr: 1 }} />
                <ListItemText primary="Integrantes" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => router.push('/admin/representantes')}
                sx={{ px: 3, '&:hover': { bgcolor: '#c8e6c9', color: '#1b5e20' } }}
              >
                <Diversity3Icon sx={{ mr: 1 }} />
                <ListItemText primary="Representantes" />
              </ListItemButton>
            </ListItem>

            {(rol === 'superadmin' || rol === 'asistente') && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/admin/importar')}
                  sx={{ px: 3, '&:hover': { bgcolor: '#c8e6c9', color: '#1b5e20' } }}
                >
                  <UploadFileIcon sx={{ mr: 1 }} />
                  <ListItemText primary="Importar" />
                </ListItemButton>
              </ListItem>
            )}

            {rol === 'superadmin' && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/admin/usuarios')}
                  sx={{ px: 3, '&:hover': { bgcolor: '#c8e6c9', color: '#1b5e20' } }}
                >
                  <PeopleAltIcon sx={{ mr: 1 }} />
                  <ListItemText primary="Usuarios" />
                </ListItemButton>
              </ListItem>
            )}

            {rol === 'superadmin' && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push('/admin/historial')}
                  sx={{ px: 3, '&:hover': { bgcolor: '#c8e6c9', color: '#1b5e20' } }}
                >
                  <HistoryIcon sx={{ mr: 1 }} />
                  <ListItemText primary="Historial" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Divider sx={{ borderColor: '#a5d6a7', mx: 2 }} />
          <ListItem disablePadding sx={{ mt: 1 }}>
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

      {/* Diálogo de confirmación de logout */}
      <Dialog
        open={confirmLogoutOpen}
        onClose={() => setConfirmLogoutOpen(false)}
      >
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cerrar la sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogoutOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            onClick={() => {
              setConfirmLogoutOpen(false);
              cerrarSesion();
            }}
          >
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
