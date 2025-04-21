'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarAdmin from './components/SidebarAdmin';
import HeaderAdmin from './components/HeaderAdmin';
import AdminThemeProvider from './AdminThemeProvider';
import {
  Box,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function AdminPage() {
  const [stats, setStats] = useState({
    total: 0,
    participantes: 0,
    activos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Verificar sesión
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return router.push('/admin/login');
        const { user } = await res.json();
        setUser(user);
      } catch {
        router.push('/admin/login');
      }
    })();
  }, [router]);

  // Cargar estadísticas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/integrantes');
        const data = await res.json();
        const total = data.length;
        const participantes = data.filter(i => i.participacion === 'SI').length;
        const activos = data.filter(i => i.status === 'ACTIVO').length;
        setStats({ total, participantes, activos });
      } catch (err) {
        console.error('Error cargando estadísticas', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AdminThemeProvider>
      <Box display="flex" height="100vh">
        <SidebarAdmin />
        <Box flexGrow={1}>
          <HeaderAdmin />

          <Box
            sx={{
              p: 4,
              overflow: 'auto',
              transform: { xs: 'scale(0.85)', sm: 'scale(1)' },
              transformOrigin: 'top center',
            }}
          >
            <Typography variant="body1" gutterBottom>
              Bienvenido, {user.nombre}. Desde este panel podrás gestionar registros, visualizar estadísticas y seguir escalando la plataforma con nuevas funcionalidades.
            </Typography>

            <Grid container spacing={3}>
              {loading ? (
                <Grid item xs={12}>
                  <CircularProgress />
                </Grid>
              ) : (
                <>
                  {/* Total Integrantes */}
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <AssessmentIcon /> Total Integrantes
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" color="primary">
                        {stats.total}
                      </Typography>
                      <Typography variant="body2">
                        Registros guardados en base de datos
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Deportista */}
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <SportsSoccerIcon /> Deportista
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" color="success.main">
                        {stats.participantes}
                      </Typography>
                      <Typography variant="body2">
                        Confirmados para próximos eventos
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Activos */}
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <AutoGraphIcon /> Activos
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" color="info.main">
                        {stats.activos}
                      </Typography>
                      <Typography variant="body2">
                        Usuarios actualmente habilitados
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}

              {/* Instrucciones rápidas */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    <InfoOutlinedIcon /> Instrucciones rápidas
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="→ Importa tu base de datos desde Excel." />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="→ Edita los registros y genera fichas en PDF." />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="→ Filtra, busca, exporta o imprime tus registros." />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="→ Guarda imágenes y crea fichas profesionales." />
                    </ListItem>
                  </List>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </AdminThemeProvider>
  );
}
