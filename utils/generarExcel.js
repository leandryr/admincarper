'use server';

import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

export async function generarExcelIntegrantes(data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Integrantes');

  // Cabeceras
  sheet.columns = [
    { header: 'Código', key: 'codigo', width: 12 },
    { header: 'Apellido Paterno', key: 'apPaterno', width: 18 },
    { header: 'Apellido Materno', key: 'apMaterno', width: 18 },
    { header: 'Nombres', key: 'nombres', width: 25 },
    { header: 'Sexo', key: 'sexo', width: 8 },
    { header: 'Doc.', key: 'doc', width: 18 },
    { header: 'Fecha Nac.', key: 'fechaNacimiento', width: 15 },
    { header: 'Teléfono', key: 'telefono', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Cargo', key: 'cargo', width: 15 },
    { header: 'Participación', key: 'participacion', width: 15 },
    { header: 'Foto', key: 'foto', width: 15 }
  ];

  const imageColumn = 13;

  for (let i = 0; i < data.length; i++) {
    const integrante = data[i];

    sheet.addRow({
      codigo: integrante.codigo,
      apPaterno: integrante.apPaterno,
      apMaterno: integrante.apMaterno,
      nombres: integrante.nombres,
      sexo: integrante.sexo,
      doc: `${integrante.tipoDoc} ${integrante.docNumero}`,
      fechaNacimiento: `${integrante.fechaNacimiento?.dia}/${integrante.fechaNacimiento?.mes}/${integrante.fechaNacimiento?.anio}`,
      telefono: integrante.telefono,
      email: integrante.email,
      status: integrante.status,
      cargo: integrante.cargo,
      participacion: integrante.participacion,
      foto: '', // Dejar la celda vacía donde va imagen
    });

    if (integrante.foto && fs.existsSync(`public${integrante.foto}`)) {
      const imageId = workbook.addImage({
        filename: path.join('public', integrante.foto),
        extension: path.extname(integrante.foto).replace('.', '')
      });

      sheet.addImage(imageId, {
        tl: { col: imageColumn - 1, row: i + 1 }, // Columna empieza en 0
        ext: { width: 50, height: 50 }
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
