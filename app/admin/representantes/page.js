'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';

import SidebarAdmin from '../components/SidebarAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import AdminThemeProvider from '../AdminThemeProvider';
import AgregarRepresentanteModal from '../components/AgregarRepresentanteModal';
import AsignarRepresentante from '../components/AsignarRepresentante';

export default function RepresentantesPage() {
  const [integrantes, setIntegrantes] = useState([]);
  const [filtroOficio, setFiltroOficio] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');
  const [rol, setRol] = useState(null);

  // 👉 estados para doble confirmación
  const [confirmEliminarOpen, setConfirmEliminarOpen] = useState(false);
  const [validarEliminarOpen, setValidarEliminarOpen] = useState(false);
  const [repAEliminar, setRepAEliminar] = useState(null);
  const [docConfirmado, setDocConfirmado] = useState('');

  const fetchData = async () => {
    const res = await fetch('/api/integrantes');
    const data = await res.json();
    setIntegrantes(data);
  };

  useEffect(() => {
    fetchData();
    (async () => {
      try {
        const res = await fetch('/api/me');
        const json = await res.json();
        setRol(json.user.rol);
      } catch {}
    })();
  }, []);

  // dispara la primera confirmación
  const handleEliminarClick = (docNumero, index) => {
    setRepAEliminar({ docNumero, index });
    setConfirmEliminarOpen(true);
  };

  // cuando confirma en el primer diálogo
  const proceedToValidate = () => {
    setConfirmEliminarOpen(false);
    setValidarEliminarOpen(true);
  };

  // la función real que elimina
  const eliminarRepresentante = async () => {
    if (docConfirmado !== repAEliminar.docNumero) {
      setTipoMensaje('error');
      setMensaje('❌ Documento incorrecto');
      return;
    }
    try {
      const res = await fetch('/api/integrantes/representante', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repAEliminar),
      });
      if (!res.ok) throw new Error();
      setTipoMensaje('success');
      setMensaje('Representante eliminado ✅');
      fetchData();
    } catch {
      setTipoMensaje('error');
      setMensaje('Error eliminando representante ❌');
    } finally {
      setValidarEliminarOpen(false);
      setRepAEliminar(null);
      setDocConfirmado('');
    }
  };

  // mapeo de todos los representantes para la tabla
  const filtrados = integrantes.flatMap(i =>
    (i.representantes || []).map((r, idx) => ({
      ...r,
      index: idx,
      integrante: `${i.nombres} ${i.apPaterno}`,
      docNumero: i.docNumero
    }))
  ).filter(r =>
    r.oficio.toLowerCase().includes(filtroOficio.toLowerCase())
  );

  return (
    <AdminThemeProvider>
      <Box display="flex" minHeight="100vh">
        <SidebarAdmin />
        <Box flexGrow={1}>
          <HeaderAdmin />
          <Box p={3}>
            {rol === 'superadmin' && <AsignarRepresentante onSuccess={fetchData} />}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Representantes Registrados
            </Typography>
            <TextField
              label="Buscar por oficio"
              fullWidth
              value={filtroOficio}
              onChange={e => setFiltroOficio(e.target.value)}
              margin="normal"
            />

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {[
                      'Integrante',
                      'Nombres',
                      'Apellidos',
                      'Parentesco',
                      'Oficio',
                      'Empresa',
                      'Contacto',
                      'Acciones'
                    ].map(title => (
                      <TableCell key={title} sx={{ fontWeight: 'bold' }}>
                        {title}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrados.map((r,i) => (
                    <TableRow key={i}>
                      <TableCell>{r.integrante}</TableCell>
                      <TableCell>{r.nombres}</TableCell>
                      <TableCell>{r.apellidos}</TableCell>
                      <TableCell>{r.parentesco}</TableCell>
                      <TableCell>{r.oficio}</TableCell>
                      <TableCell>{r.empresa}</TableCell>
                      <TableCell>{r.contacto}</TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {rol === 'superadmin' && (
                            <AgregarRepresentanteModal
                              docNumero={r.docNumero}
                              onSuccess={fetchData}
                            />
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            color="info"
                            onClick={() =>
                              handleVerDetalles(r.docNumero, r, r.integrante)
                            }
                          >
                            Ver
                          </Button>
                          {(rol === 'superadmin' || rol === 'asistente') && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={() => handleEditar(r.docNumero, r)}
                            >
                              Editar
                            </Button>
                          )}
                          {rol === 'superadmin' && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() =>
                                handleEliminarClick(r.docNumero, r.index)
                              }
                            >
                              Eliminar
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 1️⃣ Confirmación “¿Eliminar representante?” */}
            <Dialog
              open={confirmEliminarOpen}
              onClose={() => setConfirmEliminarOpen(false)}
            >
              <DialogTitle>¿Eliminar representante?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  ¿Seguro que deseas quitar este representante?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmEliminarOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  color="error"
                  onClick={proceedToValidate}
                >
                  Sí, continuar
                </Button>
              </DialogActions>
            </Dialog>

            {/* 2️⃣ Validación por documento */}
            <Dialog
              open={validarEliminarOpen}
              onClose={() => setValidarEliminarOpen(false)}
            >
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogContent>
                <Typography sx={{ mb: 2 }}>
                  Ingresa el número de documento para confirmar:
                  <br />
                  <strong>{repAEliminar?.docNumero}</strong>
                </Typography>
                <TextField
                  fullWidth
                  label="Documento"
                  value={docConfirmado}
                  onChange={e => setDocConfirmado(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setValidarEliminarOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  color="error"
                  variant="contained"
                  onClick={eliminarRepresentante}
                >
                  Eliminar definitivamente
                </Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={!!mensaje}
              autoHideDuration={3000}
              onClose={() => setMensaje('')}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert severity={tipoMensaje}>{mensaje}</Alert>
            </Snackbar>
          </Box>
        </Box>
      </Box>
    </AdminThemeProvider>
  );
}
