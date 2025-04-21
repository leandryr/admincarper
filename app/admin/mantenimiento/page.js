'use client';

import React, { useEffect, useState } from 'react';
import SidebarAdmin from '../components/SidebarAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import AdminThemeProvider from '../AdminThemeProvider';
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Button,
  CircularProgress
} from '@mui/material';

export default function MantenimientoPage() {
  const [progreso, setProgreso] = useState(0);
  const [limpiando, setLimpiando] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState('');
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar datos del usuario
  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Error al verificar sesión:', err);
      } finally {
        setCargando(false);
      }
    };
    verificar();
  }, []);

  const limpiarCache = () => {
    setProgreso(0);
    setMensajeFinal('');
    setLimpiando(true);

    const intervalo = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 100) {
          clearInterval(intervalo);
          setMensajeFinal('Archivos eliminados correctamente ✅');
          setLimpiando(false);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
  };

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AdminThemeProvider>
      <div style={{ display: 'flex', height: '100vh' }}>
        <SidebarAdmin />
        <div style={{ flexGrow: 1, width: '100%' }}>
          <HeaderAdmin />
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="calc(100vh - 64px)"
            sx={{ bgcolor: '#e8f5e9', textAlign: 'center' }}
          >
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 400 }}>
              <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                Limpieza de caché
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Optimización del sistema
              </Typography>

              {/* Solo superadmin ve el botón */}
              {user?.rol === 'superadmin' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={limpiarCache}
                  disabled={limpiando}
                  sx={{ mb: 2 }}
                >
                  Limpiar caché
                </Button>
              )}

              {limpiando || progreso > 0 ? (
                <>
                  <LinearProgress
                    variant="determinate"
                    value={progreso}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      mb: 1,
                      backgroundColor: '#c8e6c9',
                      '& .MuiLinearProgress-bar': { backgroundColor: '#2e7d32' },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {progreso}%
                  </Typography>
                </>
              ) : null}

              {mensajeFinal && (
                <Typography variant="body2" color="success.main" mt={2}>
                  {mensajeFinal}
                </Typography>
              )}
            </Paper>
          </Box>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
