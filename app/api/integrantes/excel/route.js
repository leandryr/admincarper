import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';
import axios from 'axios';

export async function GET() {
  await dbConnect();
  const data = await Integrante.find();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Integrantes');

  // 🎯 Título
  sheet.mergeCells('A1:O1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'Listado de Integrantes del Club CARPER';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF2E7D32' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 30;

  // 🎯 Encabezados
  const encabezado = [
    'Código', 'AP PATERNO', 'AP MATERNO', 'NOMBRES', 'SEXO',
    'NUMERO DE SOCIO', 'TIPO_DOC', 'DOC_NUMERO', 'FECHA_NAC',
    'TELEFONO', 'EMAIL', 'STATUS', 'CARGO', 'DEPORTISTA', 'FOTO'
  ];
  sheet.addRow(encabezado);

  encabezado.forEach((col, i) => {
    const cell = sheet.getRow(2).getCell(i + 1);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E7D32' }
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getColumn(i + 1).width = 20;
  });

  const imageCol = 15;
  let rowIndex = 3;

  for (const integrante of data) {
    const row = sheet.addRow([
      integrante.codigo,
      integrante.apPaterno,
      integrante.apMaterno,
      integrante.nombres,
      integrante.sexo,
      integrante.numeroSocio,
      integrante.tipoDoc,
      integrante.docNumero,
      `${integrante.fechaNacimiento?.dia}/${integrante.fechaNacimiento?.mes}/${integrante.fechaNacimiento?.anio}`,
      integrante.telefono,
      integrante.email,
      integrante.status,
      integrante.cargo,
      integrante.deportista,
      ''
    ]);
    row.height = 60;

    try {
      let imageBuffer = null;
      let extension = 'jpg';

      if (integrante.cloudinaryUrl) {
        const response = await axios.get(integrante.cloudinaryUrl, {
          responseType: 'arraybuffer'
        });
        imageBuffer = response.data;
        extension = path.extname(integrante.cloudinaryUrl).replace('.', '') || 'jpg';
      }

      if (imageBuffer) {
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: extension,
        });

        sheet.addImage(imageId, {
          tl: { col: imageCol - 1, row: rowIndex - 1 },
          ext: { width: 60, height: 60 },
        });
      }
    } catch (err) {
      console.error(`❌ Error al descargar imagen Cloudinary: ${err.message}`);
    }

    rowIndex++;
  }

  // ✅ Logo institucional
  const logoPath = path.join('public', 'logo_carper.png');
  if (fs.existsSync(logoPath)) {
    const logoId = workbook.addImage({
      filename: logoPath,
      extension: 'png',
    });
    sheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 30, height: 30 },
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=Integrantes_CARPER.xlsx',
    },
  });
}
