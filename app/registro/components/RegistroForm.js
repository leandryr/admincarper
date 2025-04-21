'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';

export default function RegistroForm({ form, setForm, handleChange, guardar }) {
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  // errores por campo
  const [errorPN, setErrorPN] = useState('');
  const [errorSN, setErrorSN] = useState('');
  const [errorAP, setErrorAP] = useState('');
  const [errorAM, setErrorAM] = useState('');
  const [errorNumSocio, setErrorNumSocio] = useState('');
  const [errorSexo, setErrorSexo] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('');
  const [errorEmail, setErrorEmail] = useState('');

  const mostrarMensajeFn = texto => {
    setMensaje(texto);
    setMostrarMensaje(true);
  };

  const cerrarDialogo = () => setMostrarDialogo(false);

  const handleGuardar = async () => {
    let valido = true;

    // validar primer nombre
    if (!form.primerNombre?.trim()) {
      setErrorPN('Requerido');
      valido = false;
    } else {
      setErrorPN('');
    }
    // validar segundo nombre
    if (!form.segundoNombre?.trim()) {
      setErrorSN('Requerido');
      valido = false;
    } else {
      setErrorSN('');
    }
    // validar apellido paterno
    if (!form.apPaterno?.trim()) {
      setErrorAP('Requerido');
      valido = false;
    } else {
      setErrorAP('');
    }
    // validar apellido materno
    if (!form.apMaterno?.trim()) {
      setErrorAM('Requerido');
      valido = false;
    } else {
      setErrorAM('');
    }
    // validar sexo
    if (!form.sexo) {
      setErrorSexo('Requerido');
      valido = false;
    } else {
      setErrorSexo('');
    }
    // validar teléfono peruano de 9 dígitos
    if (!/^\d{9}$/.test(form.telefono || '')) {
      setErrorTelefono('Debe tener 9 dígitos');
      valido = false;
    } else {
      setErrorTelefono('');
    }
    // validar email con @ y .com
    if (!/.+@.+\.com$/.test(form.email || '')) {
      setErrorEmail('Debe contener "@" y terminar en ".com"');
      valido = false;
    } else {
      setErrorEmail('');
    }

    if (!valido) return;

    // si año queda vacío, asignar '1900' por defecto
    if (!form.fechaNacimiento?.anio) {
      setForm(prev => ({
        ...prev,
        fechaNacimiento: { 
          ...prev.fechaNacimiento,
          anio: '1900'
        }
      }));
      // además sincronizar localmente para la llamada guardar
      form.fechaNacimiento = {
        ...form.fechaNacimiento,
        anio: '1900'
      };
    }

    await guardar();
    mostrarMensajeFn(form.guardado ? 'Actualización exitosa ✅' : 'Registro exitoso ✅');
    setMostrarDialogo(true);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          Datos del Integrante
        </Typography>
        <TextField
          label="Primer Nombre"
          name="primerNombre"
          value={form.primerNombre}
          onChange={handleChange}
          error={!!errorPN}
          helperText={errorPN}
          fullWidth
        />
        <TextField
          label="Segundo Nombre"
          name="segundoNombre"
          value={form.segundoNombre}
          onChange={handleChange}
          error={!!errorSN}
          helperText={errorSN}
          fullWidth
        />
        <TextField
          label="Apellido Paterno"
          name="apPaterno"
          value={form.apPaterno}
          onChange={handleChange}
          error={!!errorAP}
          helperText={errorAP}
          fullWidth
        />
        <TextField
          label="Apellido Materno"
          name="apMaterno"
          value={form.apMaterno}
          onChange={handleChange}
          error={!!errorAM}
          helperText={errorAM}
          fullWidth
        />
        <TextField
          label="Número de Socio"
          name="numeroSocio"
          value={form.numeroSocio}
          onChange={handleChange}
          error={!!errorNumSocio}
          helperText={errorNumSocio}
          fullWidth
        />
        <TextField
          select
          label="Sexo"
          name="sexo"
          value={form.sexo}
          onChange={handleChange}
          error={!!errorSexo}
          helperText={errorSexo}
          fullWidth
        >
          <MenuItem value="M">Masculino</MenuItem>
          <MenuItem value="F">Femenino</MenuItem>
        </TextField>
        <TextField
          label="Teléfono"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
          error={!!errorTelefono}
          helperText={errorTelefono}
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={!!errorEmail}
          helperText={errorEmail}
          fullWidth
        />
        <Box display="flex" gap={2}>
          <TextField
            select
            label="Día"
            name="dia"
            value={form.fechaNacimiento?.dia || ''}
            onChange={handleChange}
            fullWidth
          >
            {[...Array(31)].map((_, i) => {
              const val = String(i + 1).padStart(2, '0');
              return <MenuItem key={val} value={val}>{val}</MenuItem>;
            })}
          </TextField>
          <TextField
            select
            label="Mes"
            name="mes"
            value={form.fechaNacimiento?.mes || ''}
            onChange={handleChange}
            fullWidth
          >
            {[...Array(12)].map((_, i) => {
              const val = String(i + 1).padStart(2, '0');
              return <MenuItem key={val} value={val}>{val}</MenuItem>;
            })}
          </TextField>
        </Box>
        {/* Año opcional */}
        <TextField
          label="Año (Opcional)"
          name="anio"
          value={form.fechaNacimiento?.anio || ''}
          onChange={handleChange}
          fullWidth
        />
        <Button
          variant="contained"
          fullWidth
          color="success"
          onClick={handleGuardar}
        >
          {form.guardado ? 'Actualizar' : 'Registrar'}
        </Button>
      </Box>

      <Dialog open={mostrarDialogo} onClose={cerrarDialogo}>
        <DialogTitle>
          {form.guardado ? 'Registro actualizado' : 'Registro completado'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas agregar otro integrante?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => location.reload()} color="primary">
            Sí
          </Button>
          <Button onClick={() => location.reload()} color="error">
            No
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={mostrarMensaje}
        autoHideDuration={3000}
        onClose={() => setMostrarMensaje(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setMostrarMensaje(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
