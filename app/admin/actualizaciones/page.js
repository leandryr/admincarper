'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import SidebarAdmin from '../components/SidebarAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import AdminThemeProvider from '../AdminThemeProvider';

export default function ActualizacionesPage() {
  const [actualizaciones, setActualizaciones] = useState([]);

  useEffect(() => {
    const fetchActualizaciones = async () => {
      try {
        const res = await fetch('/api/actualizaciones');
        const data = await res.json();
        setActualizaciones(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error al obtener actualizaciones:', err);
      }
    };

    fetchActualizaciones();
  }, []);

  return (
    <AdminThemeProvider>
      <Box display="flex" minHeight="100vh">
        <SidebarAdmin />
        <Box flexGrow={1}>
          <HeaderAdmin />
          <Box p={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Registro de Actualizaciones del Sistema
            </Typography>

            {actualizaciones.map((act, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'transparent',
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Versión {act.version}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {act.fecha} – {act.hora}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <List dense>
                  {act.cambios.map((cambio, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={cambio} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </AdminThemeProvider>
  );
}
