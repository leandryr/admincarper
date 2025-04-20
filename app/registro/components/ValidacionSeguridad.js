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
  const [numeroSocio, setNumeroSocio] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');
  const [intentos, setIntentos] = useState(0);

  const pregunta = '¿Cuánto es 3 + 2?';
  const respuestaCorrecta = '5';

  const validar = () => {
    if (intentos >= 5) {
      setError('🚫 Demasiados intentos fallidos. Recarga la página.');
      return;
    }

    if (
      numeroSocio === datos.numeroSocio &&
      respuesta.trim() === respuestaCorrecta
    ) {
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

      <TextField
        label="Número de Socio"
        fullWidth
        value={numeroSocio}
        onChange={(e) => setNumeroSocio(e.target.value)}
        sx={{ my: 1 }}
      />

      <TextField
        label={pregunta}
        fullWidth
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
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
