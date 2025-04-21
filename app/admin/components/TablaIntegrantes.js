'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import VerDetallesModal from './VerDetallesModal';
import FichaIntegrantePDF from './FichaIntegrantePDF';

export default function TablaIntegrantes({ onEditar, rol }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [data, setData] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');

  const [confirmEliminarOpen, setConfirmEliminarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [docConfirmado, setDocConfirmado] = useState('');
  const [integranteAEliminar, setIntegranteAEliminar] = useState(null);

  useEffect(() => {
    fetch('/api/integrantes')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(() => {
        setTipoMensaje('error');
        setMensaje('Error al cargar registros ❌');
      });
  }, []);

  const registrarHistorial = async (accion) => {
    try {
      await fetch('/api/historial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion }),
      });
    } catch (error) {
      console.error('Error registrando historial:', error);
    }
  };

  const actualizarCampo = async (id, campo, valor) => {
    try {
      const res = await fetch(`/api/integrantes-id/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: valor }),
      });
      if (res.ok) {
        setMensaje(`Campo ${campo} actualizado ✅`);
        setTipoMensaje('success');
        setData(prev =>
          prev.map(i => (i._id === id ? { ...i, [campo]: valor } : i))
        );
      } else {
        const err = await res.json();
        setMensaje(err.error || `Error al actualizar ${campo} ❌`);
        setTipoMensaje('error');
      }
    } catch {
      setMensaje(`Error al actualizar ${campo} ❌`);
      setTipoMensaje('error');
    }
  };

  const eliminarIntegrante = async () => {
    if (!integranteAEliminar || docConfirmado !== integranteAEliminar.telefono) {
      setTipoMensaje('error');
      setMensaje('❌ Número de teléfono incorrecto');
      return;
    }
    try {
      const res = await fetch(`/api/integrantes-id/${integranteAEliminar._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMensaje('Integrante eliminado correctamente ✅');
        setTipoMensaje('success');
        setData(prev => prev.filter(i => i._id !== integranteAEliminar._id));
        setDialogOpen(false);
        setDocConfirmado('');
        setIntegranteAEliminar(null);
      } else {
        const err = await res.json();
        setMensaje(err.error || 'Error al eliminar integrante ❌');
        setTipoMensaje('error');
      }
    } catch {
      setMensaje('Error del servidor al eliminar ❌');
      setTipoMensaje('error');
    }
  };

  const filtrados = data.filter(i =>
    [i.nombres, i.apPaterno, i.apMaterno, i.codigo, i.telefono]
      .some(c => c?.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <Box
      p={3}
      sx={{
        transform: isMobile ? 'scale(0.8)' : 'none',
        transformOrigin: 'top left',
        width: isMobile ? '125%' : 'auto'
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Lista de Integrantes
      </Typography>

      <TextField
        fullWidth
        label="Buscar por nombre, código o teléfono"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        margin="normal"
      />

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Código</strong></TableCell>
              <TableCell><strong>Nombres</strong></TableCell>
              <TableCell><strong>Apellido P</strong></TableCell>
              <TableCell><strong>Apellido M</strong></TableCell>
              <TableCell><strong>F. Nacimiento</strong></TableCell>
              <TableCell><strong>N° Teléfono</strong></TableCell>
              <TableCell><strong>Sexo</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados.map(row => (
              <TableRow key={row._id} hover>
                <TableCell>{row.codigo}</TableCell>
                <TableCell>{row.nombres}</TableCell>
                <TableCell>{row.apPaterno}</TableCell>
                <TableCell>{row.apMaterno}</TableCell>
                <TableCell>
                  {row.fechaNacimiento?.dia}/{row.fechaNacimiento?.mes}/{row.fechaNacimiento?.anio}
                </TableCell>
                <TableCell>{row.telefono}</TableCell>
                <TableCell>{row.sexo === 'M' ? 'Masculino' : 'Femenino'}</TableCell>
                <TableCell>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    <Tooltip title="Ver detalles">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => { setDetalle(row); setOpen(true); }}
                      >
                        Ver
                      </Button>
                    </Tooltip>

                    {(rol === 'superadmin' || rol === 'asistente') && (
                      <Tooltip title="Editar datos">
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => onEditar(row)}
                        >
                          Editar
                        </Button>
                      </Tooltip>
                    )}

                    {rol === 'superadmin' && (
                      <>
                        <Tooltip title={row.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}>
                          <Button
                            variant="outlined"
                            size="small"
                            color={row.status === 'ACTIVO' ? 'warning' : 'success'}
                            onClick={() =>
                              actualizarCampo(
                                row._id,
                                'status',
                                row.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
                              )
                            }
                          >
                            {row.status === 'ACTIVO' ? 'Inactivar' : 'Activar'}
                          </Button>
                        </Tooltip>

                        <Tooltip title={row.deportista === 'SI' ? 'Quitar deportista' : 'Activar deportista'}>
                          <Button
                            variant="outlined"
                            size="small"
                            color={row.deportista === 'SI' ? 'error' : 'secondary'}
                            onClick={() =>
                              actualizarCampo(
                                row._id,
                                'deportista',
                                row.deportista === 'SI' ? 'NO' : 'SI'
                              )
                            }
                          >
                            {row.deportista === 'SI' ? 'Quitar Deportista' : 'Deportista'}
                          </Button>
                        </Tooltip>

                        <Tooltip title="Eliminar integrante">
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => {
                              setIntegranteAEliminar(row);
                              setConfirmEliminarOpen(true);
                            }}
                          >
                            Eliminar
                          </Button>
                        </Tooltip>
                      </>
                    )}

                    {(rol === 'superadmin' || rol === 'asistente' || rol === 'lectura') && (
                      <Tooltip title="Generar ficha PDF">
                        <span onClick={() => registrarHistorial(`Descargó ficha PDF de ${row.nombres}`)}>
                          <FichaIntegrantePDF integrante={row} />
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={confirmEliminarOpen} onClose={() => setConfirmEliminarOpen(false)}>
        <DialogTitle>¿Eliminar integrante?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar a <strong>{integranteAEliminar?.nombres}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEliminarOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            onClick={() => {
              setConfirmEliminarOpen(false);
              setDialogOpen(true);
            }}
          >
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Para eliminar a <strong>{integranteAEliminar?.nombres}</strong>, escribe su número de teléfono:
            <br />
            <strong>{integranteAEliminar?.telefono}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Confirma número de teléfono"
            value={docConfirmado}
            onChange={e => setDocConfirmado(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={eliminarIntegrante}>
            Eliminar definitivamente
          </Button>
        </DialogActions>
      </Dialog>

      {detalle && (
        <VerDetallesModal open={open} onClose={() => setOpen(false)} integrante={detalle} />
      )}

      <Snackbar
        open={!!mensaje}
        autoHideDuration={4000}
        onClose={() => setMensaje('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={tipoMensaje} variant="filled">
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}
