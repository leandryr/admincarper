'use client';

import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import { useState, useEffect } from 'react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevaFoto(file);
      setPreview(URL.createObjectURL(file));
      setSnack({ open: true, message: 'Foto lista para subir ✅', severity: 'info' });
    }
  };

  const subirFoto = async () => {
    const formData = new FormData();
    formData.append('foto', nuevaFoto);

    const res = await fetch(`/api/integrantes-id/${form._id}/foto`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setSnack({ open: true, message: 'Foto subida correctamente ✅', severity: 'success' });
    }
  };

  const guardarCambios = async () => {
    const res = await fetch(`/api/integrantes-id/${form._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSnack({ open: true, message: 'Cambios guardados correctamente ✅', severity: 'success' });
    }

    if (nuevaFoto) {
      await subirFoto();
    }

    onGuardar?.();
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    // En móvil: 90% ancho y alto máximo con scroll; en desktop fijo 700px
    width: { xs: '90%', sm: 700 },
    maxHeight: { xs: '90vh', sm: 'auto' },
    overflowY: { xs: 'auto', sm: 'visible' },
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>Editar Integrante</Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="Nombres" name="nombres" value={form.nombres} onChange={handleChange} fullWidth />
            <TextField label="Apellido Paterno" name="apPaterno" value={form.apPaterno} onChange={handleChange} fullWidth />
            <TextField label="Apellido Materno" name="apMaterno" value={form.apMaterno} onChange={handleChange} fullWidth />
            <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <TextField label="Cargo" name="cargo" value={form.cargo || ''} onChange={handleChange} fullWidth />

            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={preview || form.foto}
                alt="Previsualización"
                sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2 }}
              />
              <Button variant="contained" component="label">
                {(form.foto || preview) ? 'Actualizar Foto' : 'Subir Foto'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
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
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
