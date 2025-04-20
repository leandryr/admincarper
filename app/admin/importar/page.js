'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import SidebarAdmin from '../components/SidebarAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import AdminThemeProvider from '../AdminThemeProvider';
import {
  Box, Button, Typography, Snackbar, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid
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
    if (!archivo || !(archivo instanceof Blob)) {
      setTipoMensaje('warning');
      setMensaje('⚠️ Por favor, selecciona un archivo Excel válido antes de procesar.');
      return;
    }

    if (!archivo.name.endsWith('.xlsx')) {
      setTipoMensaje('error');
      setMensaje('❌ El archivo debe ser .xlsx. Usa una plantilla compatible.');
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
        <Typography variant="h6" fontWeight="bold" style={{ color, marginBottom: 10 }}>
          {titulo} ({data.length})
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columnas.map((head) => (
                  <TableCell key={head}><strong>{head}</strong></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((p, i) => (
                <TableRow key={i}>
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
    <AdminThemeProvider>
      <Box display="flex" minHeight="100vh">
        <SidebarAdmin />
        <Box flexGrow={1}>
          <HeaderAdmin />
          <Box padding={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Importar Integrantes desde Excel
            </Typography>

            <Typography variant="body2" gutterBottom>
              Selecciona un archivo <strong>.xlsx</strong> con la estructura adecuada para cargar los datos al sistema.
            </Typography>

            <Grid container spacing={2} alignItems="center" marginBottom={3}>
              <Grid item>
                <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                  Seleccionar archivo
                  <input type="file" accept=".xlsx" hidden onChange={handleFile} />
                </Button>
              </Grid>
              <Grid item>
                {archivo && (
                  <Typography variant="body2">{archivo.name}</Typography>
                )}
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={procesarArchivo}>
                  Procesar archivo
                </Button>
              </Grid>
            </Grid>

            {(nuevos.length > 0 || duplicados.length > 0) && (
              <Box>
                {nuevos.length > 0 && (
                  <>
                    <Tabla titulo="🟢 Registros nuevos" data={nuevos} color="green" tipo="nuevo" />
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SaveAltIcon />}
                      onClick={guardarNuevos}
                      style={{ marginTop: 16 }}
                    >
                      Guardar en base de datos
                    </Button>
                  </>
                )}
                {duplicados.length > 0 && (
                  <>
                    <Divider style={{ margin: '30px 0' }} />
                    <Tabla titulo="🔴 Duplicados encontrados" data={duplicados} color="red" tipo="duplicado" />
                  </>
                )}
              </Box>
            )}

            <Snackbar open={!!mensaje} autoHideDuration={5000} onClose={() => setMensaje('')}>
              <Alert severity={tipoMensaje} onClose={() => setMensaje('')}>
                {mensaje}
              </Alert>
            </Snackbar>
          </Box>
        </Box>
      </Box>
    </AdminThemeProvider>
  );
}
