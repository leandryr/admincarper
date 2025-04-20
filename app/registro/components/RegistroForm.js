'use client';

import {
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

export default function RegistroForm({
  form,
  setForm,
  handleChange,
  guardar,
  datos,
  mostrarFormRep,
  setMostrarFormRep
}) {
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [representantes, setRepresentantes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  useEffect(() => {
    if (mostrarFormRep && datos?.representantes?.length && representantes.length === 0) {
      setRepresentantes([]);
    }
  }, [mostrarFormRep, datos]);

  const agregarFormulario = () => {
    if (representantes.length + (datos?.representantes?.length || 0) >= 5) return;
    setRepresentantes(prev => [
      ...prev,
      { nombres: '', apellidos: '', parentesco: '', oficio: '', empresa: '', contacto: '' }
    ]);
    setMostrarFormRep(true);
  };

  const eliminarFormulario = index => {
    setRepresentantes(prev => prev.filter((_, i) => i !== index));
  };

  const handleRepChange = (index, e) => {
    const { name, value } = e.target;
    setRepresentantes(prev =>
      prev.map((rep, i) => (i === index ? { ...rep, [name]: value } : rep))
    );
  };

  const guardarTodosRepresentantes = async () => {
    try {
      const res = await fetch(`/api/integrantes/${form.docNumero}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ representantes })
      });

      if (res.ok) {
        setMensaje('Todos los representantes han sido guardados correctamente ✅');
        setMostrarMensaje(true);
        setRepresentantes([]);
        setFinalizado(true);
        setMostrarFormRep(false);
        setTimeout(() => location.reload(), 2500);
      } else {
        const err = await res.json();
        setMensaje(err.error || 'Error al guardar representantes ❌');
        setMostrarMensaje(true);
      }
    } catch {
      setMensaje('Error del servidor');
      setMostrarMensaje(true);
    }
  };

  const handleEditRep = (index, field, value) => {
    setForm(prev => {
      const actuales = [...(prev.representantes || [])];
      actuales[index] = { ...actuales[index], [field]: value };
      return { ...prev, representantes: actuales };
    });
  };

  const guardarEdicion = async (index, repEdit) => {
    try {
      const res = await fetch(`/api/integrantes/${form.docNumero}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, representanteEditado: repEdit })
      });

      if (res.ok) {
        setMensaje(`Representante #${index + 1} actualizado correctamente ✅`);
        setMostrarMensaje(true);
      } else {
        const err = await res.json();
        setMensaje(err.error || 'Error al guardar representante ❌');
        setMostrarMensaje(true);
      }
    } catch {
      setMensaje('Error del servidor');
      setMostrarMensaje(true);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          Datos del Integrante
        </Typography>
        <TextField label="Primer Nombre" name="primerNombre" value={form.primerNombre} onChange={handleChange} fullWidth />
        <TextField label="Segundo Nombre" name="segundoNombre" value={form.segundoNombre} onChange={handleChange} fullWidth />
        <TextField label="Apellido Paterno" name="apPaterno" value={form.apPaterno} onChange={handleChange} fullWidth />
        <TextField label="Apellido Materno" name="apMaterno" value={form.apMaterno} onChange={handleChange} fullWidth />
        <TextField label="Número de Socio" name="numeroSocio" value={form.numeroSocio} onChange={handleChange} fullWidth />
        <TextField select label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} fullWidth>
          <MenuItem value="M">Masculino</MenuItem>
          <MenuItem value="F">Femenino</MenuItem>
        </TextField>
        <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} fullWidth />
        <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
        <Box display="flex" gap={2}>
          <TextField label="Día" name="dia" value={form.fechaNacimiento?.dia || ''} onChange={handleChange} fullWidth />
          <TextField label="Mes" name="mes" value={form.fechaNacimiento?.mes || ''} onChange={handleChange} fullWidth />
          <TextField label="Año" name="anio" value={form.fechaNacimiento?.anio || ''} onChange={handleChange} fullWidth />
        </Box>
        <Button
          variant="contained"
          fullWidth
          color="success"
          onClick={() => {
            guardar();
            if (!datos) setTimeout(() => setMostrarDialogo(true), 1000);
          }}
        >
          {form.guardado ? 'Actualizado' : datos ? 'Actualizar' : 'Registrar'}
        </Button>
      </Box>

      {/* Agregar nuevos representantes */}
      {datos?.representantes?.length === 0 && !mostrarFormRep && (
        <Box mt={4}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Este integrante aún no tiene representantes registrados.
          </Alert>
          <Button variant="outlined" color="primary" onClick={agregarFormulario}>
            Agregar Representante
          </Button>
        </Box>
      )}

      {/* Botón para agregar más si ya hay algunos */}
      {datos?.representantes?.length > 0 && representantes.length === 0 && datos.representantes.length < 5 && (
        <Box mt={2}>
          <Button variant="outlined" color="primary" onClick={agregarFormulario}>
            Agregar Otro Representante #{datos.representantes.length + 1}
          </Button>
        </Box>
      )}

      {/* Lista de representantes existentes con edición */}
      {datos?.representantes?.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
            Representantes Registrados
          </Typography>
          {datos.representantes.map((rep, idx) => (
            <Box key={idx} sx={{ border: '1px solid #ccc', p: 2, borderRadius: 2, mb: 2 }}>
              <Typography fontWeight="bold" color="secondary">Representante #{idx + 1}</Typography>
              {['nombres','apellidos','parentesco','oficio','empresa','contacto'].map(field => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={rep[field]}
                  onChange={e => handleEditRep(idx, field, e.target.value)}
                  fullWidth
                  sx={{ mt: 1 }}
                />
              ))}
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button color="success" variant="contained" onClick={() => guardarEdicion(idx, (form.representantes || [])[idx])}>
                  Guardar Cambios
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Formularios nuevos de representantes */}
      {mostrarFormRep && representantes.map((rep, idx) => (
        <Box key={idx} mt={4} sx={{ border: '1px solid #ccc', p: 2, borderRadius: 2 }} display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold" color="secondary">
              Representante #{(datos?.representantes?.length || 0) + idx + 1}
            </Typography>
            <IconButton color="error" onClick={() => eliminarFormulario(idx)}>
              <DeleteIcon />
            </IconButton>
          </Box>
          {['nombres','apellidos','parentesco','oficio','empresa','contacto'].map(field => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={rep[field]}
              onChange={e => handleRepChange(idx, e)}
              fullWidth
            />
          ))}
        </Box>
      ))}

      {/* Botones para guardar todos los nuevos */}
      {mostrarFormRep && representantes.length > 0 && (
        <Box mt={3} display="flex" flexDirection="column" gap={2}>
          {representantes.length + (datos?.representantes?.length || 0) < 5 && (
            <Button variant="outlined" color="primary" onClick={agregarFormulario}>
              Agregar Otro Representante #{representantes.length + (datos?.representantes?.length || 0) + 1}
            </Button>
          )}
          <Button variant="contained" color="success" onClick={guardarTodosRepresentantes}>
            Registrar Todos los Representantes
          </Button>
        </Box>
      )}

      {/* Confirmación tras registrar nuevo */}
      <Dialog open={mostrarDialogo} onClose={() => setMostrarDialogo(false)}>
        <DialogTitle>¿Deseas agregar un representante o familiar?</DialogTitle>
        <DialogActions>
          <Button onClick={() => { setMostrarDialogo(false); setFinalizado(true); location.reload(); }} color="error">
            No, finalizar
          </Button>
          <Button onClick={() => { setMostrarDialogo(false); agregarFormulario(); }} color="primary">
            Sí, agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mensaje emergente */}
      <Snackbar
        open={mostrarMensaje}
        autoHideDuration={3000}
        onClose={() => setMostrarMensaje(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setMostrarMensaje(false)} severity="success" sx={{ width: '100%' }}>
          {mensaje}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
