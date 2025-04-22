'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminThemeProvider from '../../AdminThemeProvider';
import HeaderAdmin from '../../components/HeaderAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';

export default function RegistrarActualizacionPage() {
  const [version, setVersion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [cambio, setCambio] = useState('');
  const [cambios, setCambios] = useState([]);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  const obtenerUltimaVersion = async () => {
    try {
      const res = await fetch('/api/actualizaciones/ultima');
      const data = await res.json();
      setVersion(data?.version || '1.0.0');
    } catch {
      setVersion('1.0.0');
    }
  };

  const calcularSiguienteVersion = (versionActual) => {
    const partes = versionActual.split('.').map(Number);
    partes[2] += 1;
    return partes.join('.');
  };

  useEffect(() => {
    obtenerUltimaVersion();
  }, []);

  const agregarCambio = () => {
    if (cambio.trim()) {
      setCambios([...cambios, cambio.trim()]);
      setCambio('');
    }
  };

  const eliminarCambio = (index) => {
    const nuevosCambios = [...cambios];
    nuevosCambios.splice(index, 1);
    setCambios(nuevosCambios);
  };

  const guardarActualizacion = async () => {
    setGuardando(true);

    const siguienteVersion = calcularSiguienteVersion(version);
    const actualizacion = { version: siguienteVersion, fecha, hora, cambios };

    try {
      const res = await fetch('/api/actualizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualizacion),
      });

      if (res.ok) {
        setSnack({ open: true, msg: '✅ Actualización guardada correctamente', severity: 'success' });
        setFecha('');
        setHora('');
        setCambios([]);
        setVersion(siguienteVersion);
        setTimeout(() => router.push('/admin/actualizaciones'), 1000);
      } else {
        throw new Error('Error al guardar');
      }
    } catch {
      setSnack({ open: true, msg: '❌ Error al guardar actualización', severity: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AdminThemeProvider>
      <Box display="flex" minHeight="100vh">
        <SidebarAdmin />
        <Box flexGrow={1}>
          <HeaderAdmin />
          <Box p={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Registrar Nueva Actualización
            </Typography>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'transparent' }}>
              {/* Campo versión oculto */}
              {/* <TextField
                label="Versión actual"
                value={version}
                disabled
                fullWidth
                sx={{ mb: 2 }}
              /> */}

              <Box display="flex" gap={2} mb={2}>
                <TextField
                  type="date"
                  label="Fecha"
                  InputLabelProps={{ shrink: true }}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  fullWidth
                />
                <TextField
                  type="time"
                  label="Hora"
                  InputLabelProps={{ shrink: true }}
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  fullWidth
                />
              </Box>

              <Box display="flex" gap={2} mb={2}>
                <TextField
                  label="Agregar cambio (bug, mejora, fix...)"
                  value={cambio}
                  onChange={(e) => setCambio(e.target.value)}
                  fullWidth
                />
                <Button variant="contained" onClick={agregarCambio} startIcon={<AddIcon />}>
                  Agregar
                </Button>
              </Box>

              <List dense>
                {cambios.map((txt, i) => (
                  <ListItem
                    key={i}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => eliminarCambio(i)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={txt} />
                  </ListItem>
                ))}
              </List>

              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ mt: 3 }}
                onClick={guardarActualizacion}
                disabled={!fecha || !hora || cambios.length === 0 || guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar actualización'}
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </AdminThemeProvider>
  );
}
