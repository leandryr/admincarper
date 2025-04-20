'use client';

import { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Autocomplete, Box, Snackbar, Alert, Typography, Divider
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function AsignarRepresentante({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [integrantes, setIntegrantes] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    parentesco: '',
    oficio: '',
    empresa: '',
    contacto: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');

  const fetchIntegrantes = async () => {
    const res = await fetch('/api/integrantes');
    const data = await res.json();
    setIntegrantes(data);
  };

  useEffect(() => {
    if (open) fetchIntegrantes();
  }, [open]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async () => {
    if (!seleccionado?.docNumero) {
      setMensaje('Selecciona un integrante válido');
      setTipoMensaje('error');
      return;
    }

    // Validación para evitar duplicados
    const yaExiste = seleccionado.representantes?.some((r) =>
      r.nombres?.trim().toLowerCase() === form.nombres.trim().toLowerCase() &&
      r.apellidos?.trim().toLowerCase() === form.apellidos.trim().toLowerCase() &&
      r.oficio?.trim().toLowerCase() === form.oficio.trim().toLowerCase()
    );

    if (yaExiste) {
      setMensaje('❌ Este representante ya está asignado a este integrante');
      setTipoMensaje('error');
      return;
    }

    const res = await fetch('/api/integrantes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docNumero: seleccionado.docNumero,
        nuevoRepresentante: form
      })
    });

    if (res.ok) {
      setMensaje('Representante asignado con éxito');
      setTipoMensaje('success');
      setOpen(false);
      setForm({
        nombres: '',
        apellidos: '',
        parentesco: '',
        oficio: '',
        empresa: '',
        contacto: ''
      });
      setSeleccionado(null);
      if (onSuccess) onSuccess();
    } else {
      const error = await res.json();
      setMensaje(error.error || 'Error al asignar');
      setTipoMensaje('error');
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          p: 2,
          border: '1px dashed #ccc',
          borderRadius: 2,
          bgcolor: '#f4f6f8',
          flexWrap: 'wrap'
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>
            Asignar Representante a un Integrante
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Busca por nombre o documento y asigna un nuevo representante con sus datos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpen(true)}
          sx={{ mt: { xs: 2, md: 0 } }}
        >
          Asignar Representante
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Asignar Representante</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Autocomplete
            options={integrantes}
            getOptionLabel={(op) => `${op.nombres} ${op.apPaterno} (${op.docNumero})`}
            renderInput={(params) => <TextField {...params} label="Buscar Integrante" />}
            onChange={(e, value) => setSeleccionado(value)}
            isOptionEqualToValue={(o, v) => o.docNumero === v.docNumero}
          />

          <Divider />

          {['nombres', 'apellidos', 'parentesco', 'oficio', 'empresa', 'contacto'].map((campo) => (
            <TextField
              key={campo}
              name={campo}
              label={campo[0].toUpperCase() + campo.slice(1)}
              value={form[campo]}
              onChange={handleChange}
              fullWidth
            />
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!mensaje} autoHideDuration={4000} onClose={() => setMensaje('')}>
        <Alert severity={tipoMensaje}>{mensaje}</Alert>
      </Snackbar>
    </>
  );
}
