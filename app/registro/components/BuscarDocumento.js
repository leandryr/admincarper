'use client';

import {
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  FormHelperText
} from '@mui/material';
import { useState } from 'react';

export default function BuscarDocumento({
  tipoDoc,
  setTipoDoc,
  docNumero,
  setDocNumero,
  buscar,
  disabled = false 
}) {
  const [error, setError] = useState('');

  const validarDNI = (valor) => {
    if (tipoDoc === 'DNI' && !/^\d{8}$/.test(valor)) {
      return 'El DNI debe tener exactamente 8 dígitos numéricos';
    }
    return '';
  };

  const onBuscar = () => {
    const errorMsg = validarDNI(docNumero);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setError('');
    buscar();
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Box display="flex" gap={2} alignItems="center">
        <TextField
          select
          label="Tipo de Documento"
          value={tipoDoc}
          onChange={(e) => {
            setTipoDoc(e.target.value);
            setError('');
          }}
          fullWidth
          disabled={disabled} 
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="DNI">DNI</MenuItem>
          <MenuItem value="CEXT">CEXT</MenuItem>
          <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
        </TextField>

        <Box sx={{ width: '100%' }}>
          <TextField
            label="Número de Documento"
            value={docNumero}
            onChange={(e) => setDocNumero(e.target.value)}
            fullWidth
            placeholder={
              tipoDoc === 'DNI'
                ? 'Ej: 12345678'
                : tipoDoc === 'CEXT'
                ? 'Ej: CE1234567'
                : 'Ej: P001245AB'
            }
            error={!!error}
            disabled={disabled} 
            InputLabelProps={{ shrink: true }}
          />
          {error && (
            <FormHelperText error sx={{ ml: 1 }}>
              {error}
            </FormHelperText>
          )}
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={onBuscar}
          disabled={disabled} 
          sx={{ px: 4 }}
        >
          Buscar
        </Button>
      </Box>
    </Paper>
  );
}
