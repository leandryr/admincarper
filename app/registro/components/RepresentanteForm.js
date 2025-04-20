'use client';

import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function RepresentanteForm({ integranteDoc, datosIniciales, onClose }) {
  const [rep, setRep] = useState({
    nombres: '',
    apellidos: '',
    parentesco: '',
    oficio: '',
    empresa: '',
    contacto: '',
  });

  useEffect(() => {
    if (datosIniciales) {
      setRep({
        nombres: datosIniciales.nombres || '',
        apellidos: datosIniciales.apellidos || '',
        parentesco: datosIniciales.parentesco || '',
        oficio: datosIniciales.oficio || '',
        empresa: datosIniciales.empresa || '',
        contacto: datosIniciales.contacto || '',
        _id: datosIniciales._id,
      });
    }
  }, [datosIniciales]);

  const handleRepChange = (e) => {
    const { name, value } = e.target;
    setRep((prev) => ({ ...prev, [name]: value }));
  };

  const guardar = async () => {
    try {
      const payload = {
        ...rep,
        integranteDoc,
      };

      let res;

      // Si ya tiene ID (modo edición), usar PUT (si estás usando una colección separada)
      if (rep._id) {
        res = await fetch(`/api/representantes/${rep._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Nuevo representante → se envía por PATCH para guardar en el modelo del integrante
        res = await fetch(`/api/integrantes/${integranteDoc}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nuevoRepresentante: rep }),
        });
      }

      if (res.ok) {
        alert(rep._id ? 'Representante actualizado correctamente ✅' : 'Representante agregado correctamente ✅');
        onClose();
      } else {
        const err = await res.json();
        alert(err?.error || 'Error al guardar representante ❌');
      }
    } catch {
      alert('Error del servidor');
    }
  };

  return (
    <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
      <Typography variant="h6" fontWeight="bold" color="secondary" mb={2}>
        {rep._id ? 'Editar Representante o Familiar' : 'Agregar Representante o Familiar'}
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Nombres del Representante"
          name="nombres"
          value={rep.nombres}
          onChange={handleRepChange}
          fullWidth
          placeholder="Ej: Juan Carlos"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Apellidos"
          name="apellidos"
          value={rep.apellidos}
          onChange={handleRepChange}
          fullWidth
          placeholder="Ej: Ramírez Gómez"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Parentesco"
          name="parentesco"
          value={rep.parentesco}
          onChange={handleRepChange}
          fullWidth
          placeholder="Ej: Madre, Hermano, Representante legal"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Oficio o Especialidad"
          name="oficio"
          value={rep.oficio}
          onChange={handleRepChange}
          fullWidth
          placeholder="Ej: Carpintero, Abogado, Enfermera"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Empresa o Proyecto"
          name="empresa"
          value={rep.empresa}
          onChange={handleRepChange}
          fullWidth
          placeholder="Ej: UniformesCarper S.A."
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Contacto"
          name="contacto"
          value={rep.contacto}
          onChange={handleRepChange}
          fullWidth
          placeholder="Ej: 0999123456 o correo@example.com"
          InputLabelProps={{ shrink: true }}
        />

        <Button variant="contained" color="success" onClick={guardar}>
          {rep._id ? 'Actualizar Representante' : 'Guardar Representante'}
        </Button>
      </Box>
    </Paper>
  );
}
