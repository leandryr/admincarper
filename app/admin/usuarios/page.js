'use client';

import { useState, useEffect } from 'react';
import SidebarAdmin from '../components/SidebarAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import AdminThemeProvider from '../AdminThemeProvider';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function UsuariosAdminPage() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    cargo: '',
    rol: 'lectura'
  });

  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usuarioClave, setUsuarioClave] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, mensaje: '', tipo: 'success' });

  const fetchUsuarios = async () => {
    const res = await fetch('/api/usuarios');
    const data = await res.json();
    setUsuarios(data);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const mostrarAlerta = (mensaje, tipo = 'success') => {
    setSnackbar({ open: true, mensaje, tipo });
  };

  const guardar = async () => {
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      mostrarAlerta('Usuario registrado con éxito');
      setForm({ nombre: '', apellido: '', email: '', password: '', cargo: '', rol: 'lectura' });
      fetchUsuarios();
    } else {
      mostrarAlerta(data.error || 'Error al registrar', 'error');
    }
  };

  const eliminar = async (id) => {
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      mostrarAlerta('Usuario eliminado');
      fetchUsuarios();
    } else {
      mostrarAlerta(data.error || 'Error al eliminar', 'error');
    }
  };

  const actualizar = async (usuario) => {
    const res = await fetch(`/api/usuarios/${usuario._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    });
    const data = await res.json();
    if (res.ok) {
      mostrarAlerta('Usuario actualizado');
      setEditando(null);
      fetchUsuarios();
    } else {
      mostrarAlerta(data.error || 'Error al actualizar', 'error');
    }
  };

  const cambiarPassword = async () => {
    if (!clave || !usuarioClave) return;
    const res = await fetch(`/api/usuarios/${usuarioClave._id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: clave }),
    });
    const data = await res.json();
    if (res.ok) {
      mostrarAlerta('Contraseña actualizada');
      setClave('');
      setUsuarioClave(null);
      setDialogOpen(false);
    } else {
      mostrarAlerta(data.error || 'Error al cambiar contraseña', 'error');
    }
  };

  return (
    <AdminThemeProvider>
      <Box display="flex" minHeight="100vh">
        <SidebarAdmin />
        <Box flexGrow={1}>
          <HeaderAdmin />
          <Box p={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Gestión de Usuarios y Roles
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap" marginBottom={3}>
              <TextField label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} />
              <TextField label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} />
              <TextField label="Correo" name="email" value={form.email} onChange={handleChange} />
              <TextField label="Cargo" name="cargo" value={form.cargo} onChange={handleChange} />
              <TextField
                label="Rol"
                name="rol"
                select
                value={form.rol}
                onChange={handleChange}
              >
                <MenuItem value="superadmin">Administrador</MenuItem>
                <MenuItem value="asistente">Asistente</MenuItem>
                <MenuItem value="lectura">Solo lectura</MenuItem>
              </TextField>
              <TextField label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange} />
              <Button variant="contained" onClick={guardar}>Registrar</Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell><strong>Apellido</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Cargo</strong></TableCell>
                    <TableCell><strong>Rol</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>
                        {editando === u._id ? (
                          <TextField
                            value={u.nombre}
                            size="small"
                            onChange={(e) =>
                              setUsuarios(usuarios.map(usr =>
                                usr._id === u._id ? { ...usr, nombre: e.target.value } : usr
                              ))
                            }
                          />
                        ) : (
                          u.nombre
                        )}
                      </TableCell>
                      <TableCell>
                        {editando === u._id ? (
                          <TextField
                            value={u.apellido}
                            size="small"
                            onChange={(e) =>
                              setUsuarios(usuarios.map(usr =>
                                usr._id === u._id ? { ...usr, apellido: e.target.value } : usr
                              ))
                            }
                          />
                        ) : (
                          u.apellido
                        )}
                      </TableCell>
                      <TableCell>
                        {editando === u._id ? (
                          <TextField
                            value={u.email}
                            size="small"
                            onChange={(e) =>
                              setUsuarios(usuarios.map(usr =>
                                usr._id === u._id ? { ...usr, email: e.target.value } : usr
                              ))
                            }
                          />
                        ) : (
                          u.email
                        )}
                      </TableCell>
                      <TableCell>
                        {editando === u._id ? (
                          <TextField
                            value={u.cargo}
                            size="small"
                            onChange={(e) =>
                              setUsuarios(usuarios.map(usr =>
                                usr._id === u._id ? { ...usr, cargo: e.target.value } : usr
                              ))
                            }
                          />
                        ) : (
                          u.cargo
                        )}
                      </TableCell>
                      <TableCell>
                        {editando === u._id ? (
                          <TextField
                            select
                            size="small"
                            value={u.rol}
                            onChange={(e) =>
                              setUsuarios(usuarios.map(usr =>
                                usr._id === u._id ? { ...usr, rol: e.target.value } : usr
                              ))
                            }
                          >
                            <MenuItem value="superadmin">Administrador</MenuItem>
                            <MenuItem value="asistente">Asistente</MenuItem>
                            <MenuItem value="lectura">Solo lectura</MenuItem>
                          </TextField>
                        ) : (
                          u.rol === 'superadmin' ? 'Administrador' :
                          u.rol === 'asistente' ? 'Asistente' : 'Solo lectura'
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {editando === u._id ? (
                            <IconButton onClick={() => actualizar(u)}><SaveIcon /></IconButton>
                          ) : (
                            <IconButton onClick={() => setEditando(u._id)}><EditIcon /></IconButton>
                          )}
                          <IconButton onClick={() => eliminar(u._id)}><DeleteIcon /></IconButton>
                          <IconButton onClick={() => { setUsuarioClave(u); setDialogOpen(true); }}>
                            <LockResetIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogContent>
                <TextField
                  label="Nueva contraseña"
                  type={verClave ? 'text' : 'password'}
                  fullWidth
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setVerClave(!verClave)} edge="end">
                          {verClave ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button variant="contained" onClick={cambiarPassword}>Guardar</Button>
              </DialogActions>
            </Dialog>

            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert severity={snackbar.tipo} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: '100%' }}>
                {snackbar.mensaje}
              </Alert>
            </Snackbar>
          </Box>
        </Box>
      </Box>
    </AdminThemeProvider>
  );
}