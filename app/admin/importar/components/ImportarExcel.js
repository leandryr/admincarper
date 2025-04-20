'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Box, Button, Typography, Paper, Snackbar, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid, Input
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

export default function ImportarExcel() {
  const [archivo, setArchivo] = useState(null);
  const [nuevos, setNuevos] = useState([]);
  const [duplicados, setDuplicados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('info');

  const handleFile = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
  };

  const convertirFecha = (excelDate) => {
    if (!excelDate) return { dia: '', mes: '', anio: '' };
    const fecha = new Date((excelDate - 25569) * 86400 * 1000);
    return {
      dia: String(fecha.getUTCDate()).padStart(2, '0'),
      mes: String(fecha.getUTCMonth() + 1).padStart(2, '0'),
      anio: String(fecha.getUTCFullYear())
    };
  };

  const generarCodigo = (index) => `CC${String(index + 1).padStart(5, '0')}`;

  const procesarArchivo = async () => {
    if (!archivo || typeof archivo !== 'object' || typeof archivo.name !== 'string') {
      setTipoMensaje('warning');
      setMensaje('⚠️ Por favor, selecciona un archivo Excel válido antes de procesar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (!json.length || !json[0]['DOC_NUMERO'] || !json[0]['NOMBRES']) {
          setTipoMensaje('error');
          setMensaje('❌ El archivo no tiene cabeceras válidas. Usa la plantilla correcta.');
          return;
        }

        const nuevosTemp = [];
        const duplicadosTemp = [];

        for (let i = 0; i < json.length; i++) {
          const row = json[i];
          const docNumero = String(row['DOC_NUMERO'] || '').trim();
          const tipoDoc = String(row['TIPO_DOC'] || '').trim();

          if (!docNumero || !tipoDoc) continue;

          const existe = await fetch(`/api/integrantes/validar?tipoDoc=${tipoDoc}&docNumero=${docNumero}`);
          const yaExiste = await existe.json();

          const fecha = convertirFecha(row['FECHA_NAC']);
          const nombresRaw = row['NOMBRES']?.trim() || '';
          const partesNombre = nombresRaw.split(' ');
          const primerNombre = partesNombre[0] || '';
          const segundoNombre = partesNombre.slice(1).join(' ') || '';

          const integrante = {
            codigo: '',
            apPaterno: row['AP PATERNO'] || '',
            apMaterno: row['AP MATERNO'] || '',
            primerNombre,
            segundoNombre,
            nombres: [primerNombre, segundoNombre].filter(Boolean).join(' '),
            sexo: row['SEXO'] || '',
            numeroSocio: String(row['NUMERO DE SOCIO'] || ''),
            tipoDoc,
            docNumero,
            fechaNacimiento: fecha,
            telefono: String(row['TELEFONO'] || ''),
            email: row['EMAIL'] || '',
            status: row['STATUS'] || 'ACTIVO',
            cargo: '',
            participacion: row['PARTICIPACION'] || 'NO',
            foto: '',
            representantes: []
          };

          if (yaExiste.existe) {
            const res = await fetch(`/api/integrantes/existente?tipoDoc=${tipoDoc}&docNumero=${docNumero}`);
            const existente = await res.json();
            integrante.codigo = existente.codigo || '-';
            duplicadosTemp.push(integrante);
          } else {
            nuevosTemp.push(integrante);
          }
        }

        nuevosTemp.forEach((item, i) => {
          item.codigo = generarCodigo(i);
        });

        setNuevos(nuevosTemp);
        setDuplicados(duplicadosTemp);
        setTipoMensaje('success');
        setMensaje('Archivo procesado correctamente ✅');
      } catch (err) {
        console.error('Error procesando archivo:', err);
        setTipoMensaje('error');
        setMensaje('❌ Hubo un error al procesar el archivo. Verifica que sea un Excel válido.');
      }
    };

    reader.readAsBinaryString(archivo);
  };

  const guardarNuevos = async () => {
    try {
      const res = await fetch('/api/integrantes/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrantes: nuevos }),
      });

      if (res.ok) {
        setMensaje('Integrantes importados correctamente ✅');
        setTipoMensaje('success');
        setNuevos([]);
      } else {
        const error = await res.json();
        setMensaje(error?.error || 'Error al importar');
        setTipoMensaje('error');
      }
    } catch {
      setMensaje('Error del servidor');
      setTipoMensaje('error');
    }
  };

  const Tabla = ({ titulo, data, color, tipo }) => {
    const columnas = [
      ...(tipo === 'duplicado' ? ['Código'] : []),
      'Ap. Paterno', 'Ap. Materno', 'Primer Nombre',
      'Nombres', 'Sexo', 'N° Socio', 'Tipo Doc', 'Doc. N°',
      'Fecha Nac.', 'Teléfono', 'Email', 'Estado', 'Participación'
    ];

    return (
      <>
        <Typography variant="h6" fontWeight="bold" sx={{ color, mb: 1 }}>
          {titulo} ({data.length})
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                {columnas.map((head) => (
                  <TableCell key={head} sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((p, i) => (
                <TableRow key={i} hover>
                  {tipo === 'duplicado' && <TableCell>{p.codigo || '-'}</TableCell>}
                  <TableCell>{p.apPaterno}</TableCell>
                  <TableCell>{p.apMaterno}</TableCell>
                  <TableCell>{p.primerNombre}</TableCell>
                  <TableCell>{p.nombres}</TableCell>
                  <TableCell>{p.sexo}</TableCell>
                  <TableCell>{p.numeroSocio}</TableCell>
                  <TableCell>{p.tipoDoc}</TableCell>
                  <TableCell>{p.docNumero}</TableCell>
                  <TableCell>{`${p.fechaNacimiento.dia}/${p.fechaNacimiento.mes}/${p.fechaNacimiento.anio}`}</TableCell>
                  <TableCell>{p.telefono}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{p.participacion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: '#fafafa' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          Importar Integrantes desde Excel
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Selecciona un archivo <strong>.xlsx</strong> con la estructura correcta para cargar los datos.
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Seleccionar archivo
              <input type="file" accept=".xlsx" hidden onChange={handleFile} />
            </Button>
          </Grid>
          <Grid item>
            {archivo && <Typography variant="body2" color="text.secondary">{archivo.name}</Typography>}
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={procesarArchivo}>
              Procesar archivo
            </Button>
          </Grid>
        </Grid>

        {(nuevos.length > 0 || duplicados.length > 0) && (
          <Paper sx={{ mt: 4, p: 3, borderRadius: 2, backgroundColor: '#ffffff' }}>
            {nuevos.length > 0 && (
              <>
                <Tabla titulo="🟢 Registros nuevos" data={nuevos} color="success.main" tipo="nuevo" />
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveAltIcon />}
                  onClick={guardarNuevos}
                  sx={{ mt: 2 }}
                >
                  Guardar en base de datos
                </Button>
              </>
            )}

            {duplicados.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Tabla titulo="🔴 Duplicados encontrados" data={duplicados} color="error.main" tipo="duplicado" />
              </>
            )}
          </Paper>
        )}

        <Snackbar open={!!mensaje} autoHideDuration={5000} onClose={() => setMensaje('')}>
          <Alert severity={tipoMensaje} onClose={() => setMensaje('')}>
            {mensaje}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
