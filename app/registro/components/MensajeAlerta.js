'use client';

import { Alert } from '@mui/material';

export default function MensajeAlerta({ mensaje, tipo }) {
  if (!mensaje) return null;

  return (
    <Alert severity={tipo === 'error' ? 'error' : 'success'} sx={{ mb: 3 }}>
      {mensaje}
    </Alert>
  );
}
