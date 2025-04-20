'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableBody, TableCell,
  TableRow, TableContainer, Paper, CircularProgress, Divider,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField
} from '@mui/material';

import SidebarAdmin from '../components/SidebarAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import AdminThemeProvider from '../AdminThemeProvider';

export default function HistorialPage() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [rol, setRol] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filtro, setFiltro] = useState('');

  const fetchHistorial = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/historial');
      const data = await res.json();
      setHistorial(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al obtener historial:', err);
    } finally {
      setCargando(false);
    }
  };

  const fetchRol = async () => {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      setRol(data?.user?.rol || null);
    } catch {
      setRol(null);
    }
  };

  const limpiarHistorial = async () => {
    try {
      const res = await fetch('/api/historial', { method: 'DELETE' });
      if (res.ok) {
        await fetchHistorial(); // 🔄 Actualiza la tabla
        setDialogOpen(false);
      }
    } catch (err) {
      console.error('Error al limpiar historial:', err);
    }
  };

  useEffect(() => {
    fetchHistorial();
    fetchRol();
  }, []);

  const filtrados = historial.filter((item) =>
    item.accion.toLowerCase().includes(filtro.toLowerCase()) ||
    item.usuario?.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    item.usuario?.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <AdminThemeProvider>
      <Box display="flex" minHeight="100vh">
        <SidebarAdmin />
        <Box flexGrow={1}>
          <HeaderAdmin />
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight="bold">
                Historial de Actividades
              </Typography>
              {rol === 'superadmin' && (
                <Button variant="outlined" color="error" onClick={() => setDialogOpen(true)}>
                  Limpiar historial
                </Button>
              )}
            </Box>

            <TextField
              label="Filtrar por nombre, email o acción"
              fullWidth
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ mb: 2 }} />

            {cargando ? (
              <CircularProgress />
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Rol</strong></TableCell>
                      <TableCell><strong>Acción</strong></TableCell>
                      <TableCell><strong>IP</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtrados.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{new Date(item.fecha).toLocaleString()}</TableCell>
                        <TableCell>{item.usuario?.nombre || '—'}</TableCell>
                        <TableCell>{item.usuario?.email || '—'}</TableCell>
                        <TableCell>{item.usuario?.rol || '—'}</TableCell>
                        <TableCell>{item.accion}</TableCell>
                        <TableCell>{item.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <DialogTitle>Confirmar limpieza</DialogTitle>
              <DialogContent>
                ¿Estás seguro de que deseas eliminar todo el historial?
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={limpiarHistorial} variant="contained" color="error">
                  Confirmar
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Box>
    </AdminThemeProvider>
  );
}
