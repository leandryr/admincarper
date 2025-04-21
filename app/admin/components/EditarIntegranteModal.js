'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  Avatar,
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material';

export default function EditarIntegranteModal({ open, onClose, integrante, onGuardar }) {
  const [form, setForm] = useState(integrante);
  const [nuevaFoto, setNuevaFoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setForm(integrante);
    setNuevaFoto(null);
    setPreview('');
  }, [integrante]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = file => {
    setNuevaFoto(file);
    setPreview(URL.createObjectURL(file));
    setSnack({ open: true, message: 'Foto lista para subir ✅', severity: 'info' });
  };

  const handleSelect = e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleCapture = e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const subirFoto = async () => {
    if (!nuevaFoto) return;
    const formData = new FormData();
    formData.append('foto', nuevaFoto);
    const res = await fetch(`/api/integrantes-id/${form._id}/foto`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setSnack({ open: true, message: 'Foto subida correctamente ✅', severity: 'success' });

      // ✅ Agregado: Actualizar cloudinaryUrl en el form al subir la foto
      setForm(prev => ({
        ...prev,
        cloudinaryUrl: data.cloudinaryUrl || '',
      }));

      setPreview('');
    }
  };

  const guardarCambios = async () => {
    await fetch(`/api/integrantes-id/${form._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSnack({ open: true, message: 'Cambios guardados correctamente ✅', severity: 'success' });

    if (nuevaFoto) {
      await subirFoto();
    }

    onGuardar?.();
    setTimeout(() => window.location.reload(), 800);
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: '80%', md: '600px', lg: '700px' },
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>
            Editar Integrante
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Tipo Documento"
              name="tipoDoc"
              value={form.tipoDoc || ''}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="DNI">DNI</MenuItem>
              <MenuItem value="CEXT">CEXT</MenuItem>
            </TextField>
            <TextField
              label="Número Documento"
              name="docNumero"
              value={form.docNumero || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="N° Socio"
              name="numeroSocio"
              value={form.numeroSocio || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Ap. Paterno"
              name="apPaterno"
              value={form.apPaterno || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Ap. Materno"
              name="apMaterno"
              value={form.apMaterno || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Nombres"
              name="nombres"
              value={form.nombres || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              select
              label="Sexo"
              name="sexo"
              value={form.sexo || ''}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="M">Masculino</MenuItem>
              <MenuItem value="F">Femenino</MenuItem>
            </TextField>
            <TextField
              label="Fecha Nac. (dd/mm/aaaa)"
              name="fechaNacimiento"
              value={form.fechaNacimiento || ''}
              onChange={handleChange}
              placeholder="19/04/1994"
              fullWidth
            />
            <TextField
              label="Teléfono"
              name="telefono"
              value={form.telefono || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              fullWidth
            />

            <Box display="flex" alignItems="center" gap={2} pt={2}>
              <Avatar
                src={preview || form.cloudinaryUrl}
                alt="Previsualización"
                sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2 }}
              />
              <Box display="flex" flexDirection="column" gap={1}>
                <Button variant="outlined" component="label">
                  Galería
                  <input type="file" accept="image/*" hidden onChange={handleSelect} />
                </Button>
                <Button variant="contained" component="label">
                  Cámara
                  <input type="file" accept="image/*" capture="environment" hidden onChange={handleCapture} />
                </Button>
              </Box>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
              <Button variant="outlined" onClick={onClose}>Cancelar</Button>
              <Button variant="contained" onClick={guardarCambios}>Guardar cambios</Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
