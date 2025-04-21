'use client';

import { useState } from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';

export default function ExportarExcelIntegrantes() {
  const [mensaje, setMensaje] = useState('');

  const exportarExcel = async () => {
    try {
      const res = await fetch('/api/integrantes/excel');
      if (!res.ok) throw new Error('No se pudo generar el archivo Excel');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'Integrantes_CARPER.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
      setMensaje('Exportación Excel completada ✅');
    } catch (err) {
      setMensaje('Error al exportar el Excel ❌');
    }
  };

  const exportarCSV = async () => {
    try {
      const res = await fetch('/api/integrantes');
      const data = await res.json();

      const encabezado = [
        'Código', 'AP PATERNO', 'AP MATERNO', 'NOMBRES', 'SEXO',
        'NUMERO DE SOCIO', 'TIPO_DOC', 'DOC_NUMERO', 'FECHA_NAC',
        'TELEFONO', 'EMAIL', 'STATUS', 'CARGO', 'PARTICIPACION', 'FOTO (Cloudinary)'
      ];

      const filas = data.map(i => [
        i.codigo,
        i.apPaterno,
        i.apMaterno,
        i.nombres,
        i.sexo,
        i.numeroSocio,
        i.tipoDoc,
        i.docNumero,
        `${i.fechaNacimiento?.dia}/${i.fechaNacimiento?.mes}/${i.fechaNacimiento?.anio}`,
        i.telefono,
        i.email,
        i.status,
        i.cargo,
        i.participacion,
        i.cloudinaryUrl || 'NO DISPONIBLE' // ✅ Usar Cloudinary
      ]);

      const contenidoCSV = [encabezado, ...filas]
        .map(row => row.map(cell => `"${cell || ''}"`).join(','))
        .join('\n');

      const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'Integrantes_CARPER.csv';
      a.click();

      URL.revokeObjectURL(url);
      setMensaje('Exportación CSV completada ✅');
    } catch (error) {
      setMensaje('Error al exportar CSV ❌');
    }
  };

  return (
    <Box p={2} display="flex" gap={2}>
      <Button variant="contained" color="primary" onClick={exportarExcel}>
        Exportar Excel
      </Button>
      <Button variant="contained" color="success" onClick={exportarCSV}>
        Exportar CSV
      </Button>

      <Snackbar
        open={!!mensaje}
        autoHideDuration={3000}
        onClose={() => setMensaje('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">{mensaje}</Alert>
      </Snackbar>
    </Box>
  );
}
