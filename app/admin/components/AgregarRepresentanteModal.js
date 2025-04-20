'use client';

import { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box, Snackbar, Alert
} from '@mui/material';

export default function AgregarRepresentanteModal({ docNumero, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    parentesco: '',
    oficio: '',
    empresa: '',
    contacto: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [representantesActuales, setRepresentantesActuales] = useState([]);

  useEffect(() => {
    if (open && docNumero) {
      fetch(`/api/integrantes`)
        .then((res) => res.json())
        .then((data) => {
          const persona = data.find((i) => i.docNumero === docNumero);
          if (persona) {
            setRepresentantesActuales(persona.representantes || []);
          }
        });
    }
  }, [open, docNumero]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    const duplicado = representantesActuales.some((r) =>
      r.nombres?.trim().toLowerCase() === form.nombres.trim().toLowerCase() &&
      r.apellidos?.trim().toLowerCase() === form.apellidos.trim().toLowerCase() &&
      r.oficio?.trim().toLowerCase() === form.oficio.trim().toLowerCase()
    );

    if (duplicado) {
      setMensaje('❌ Este representante ya existe para este integrante');
      return;
    }

    const res = await fetch('/api/integrantes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docNumero, nuevoRepresentante: form }),
    });

    if (res.ok) {
      setMensaje('Representante agregado correctamente');
      onSuccess?.();
      setForm({
        nombres: '',
        apellidos: '',
        parentesco: '',
        oficio: '',
        empresa: '',
        contacto: ''
      });
      setOpen(false);
    } else {
      const error = await res.json();
      setMensaje(error?.error || 'Error al agregar');
    }
  };

  return (
    <>
      <Button variant="contained" size="small" onClick={() => setOpen(true)}>
        Agregar Representante
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Nuevo Representante</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {['nombres', 'apellidos', 'parentesco', 'oficio', 'empresa', 'contacto'].map((campo) => (
            <TextField
              key={campo}
              name={campo}
              label={campo[0].toUpperCase() + campo.slice(1)}
              value={form[campo]}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!mensaje} autoHideDuration={4000} onClose={() => setMensaje('')}>
        <Alert severity={mensaje.includes('❌') ? 'error' : 'info'}>
          {mensaje}
        </Alert>
      </Snackbar>
    </>
  );
}
