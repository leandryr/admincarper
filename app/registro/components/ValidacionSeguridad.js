'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert
} from '@mui/material';

export default function ValidacionSeguridad({ datos, onValidado }) {
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);

  // Extraemos los últimos 4 dígitos del teléfono en BD
  const telefono = datos?.telefono || '';
  const ultimos4 = telefono.slice(-4);

  const validar = () => {
    if (intentos >= 5) {
      setError('🚫 Demasiados intentos fallidos. Recarga la página.');
      return;
    }

    if (respuesta.trim() === ultimos4) {
      onValidado();
    } else {
      const restantes = 4 - intentos;
      setIntentos(prev => prev + 1);
      setError(`❌ Validación incorrecta. Intentos restantes: ${restantes}`);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Validación de Seguridad
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Ingresa los últimos 4 dígitos de tu número de teléfono registrado.
      </Typography>

      <TextField
        label="Últimos 4 dígitos"
        fullWidth
        value={respuesta}
        onChange={(e) => {
          setRespuesta(e.target.value);
          setError('');
        }}
        sx={{ my: 1 }}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={validar}
        disabled={intentos >= 5}
        sx={{ mt: 2 }}
      >
        Validar Identidad
      </Button>
    </Box>
  );
}
