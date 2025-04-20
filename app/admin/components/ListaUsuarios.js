'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo] = useState({ nombre: '', email: '', password: '' });
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [verNuevaClave, setVerNuevaClave] = useState(false);

  const fetchUsuarios = async () => {
    const res = await fetch('/api/usuarios');
    const data = await res.json();
    setUsuarios(data);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setNuevo({ ...nuevo, [e.target.name]: e.target.value });
  };

  const guardarNuevo = async () => {
    await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo),
    });
    setNuevo({ nombre: '', email: '', password: '' });
    fetchUsuarios();
  };

  const eliminar = async (id) => {
    await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
    fetchUsuarios();
  };

  const actualizar = async (usuario) => {
    await fetch(`/api/usuarios/${usuario._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    });
    setEditando(null);
    fetchUsuarios();
  };

  const cambiarPassword = async (id) => {
    if (!clave) return;
    await fetch(`/api/usuarios/${id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: clave }),
    });
    setClave('');
  };

  return (
    <Box sx={{ p: 4, bgcolor: 'transparent' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Gestión de Administradores
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          mb: 3,
          borderRadius: 2,
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <TextField
          label="Nombre"
          name="nombre"
          value={nuevo.nombre}
          onChange={handleChange}
          size="small"
        />
        <TextField
          label="Correo"
          name="email"
          value={nuevo.email}
          onChange={handleChange}
          size="small"
        />
        <TextField
          label="Contraseña"
          name="password"
          type={verNuevaClave ? 'text' : 'password'}
          value={nuevo.password}
          onChange={handleChange}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setVerNuevaClave(!verNuevaClave)} edge="end">
                  {verNuevaClave ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={guardarNuevo}
          sx={{ minWidth: 140 }}
        >
          Registrar
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          backgroundColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Cambiar Clave</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u._id} hover>
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
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      placeholder="Nueva clave"
                      size="small"
                      type={verClave ? 'text' : 'password'}
                      value={clave}
                      onChange={(e) => setClave(e.target.value)}
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
                    <IconButton onClick={() => cambiarPassword(u._id)} color="primary">
                      <LockResetIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    {editando === u._id ? (
                      <IconButton onClick={() => actualizar(u)} color="success">
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => setEditando(u._id)} color="info">
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => eliminar(u._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
