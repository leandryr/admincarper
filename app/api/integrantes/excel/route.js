import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function GET() {
  await dbConnect();
  const data = await Integrante.find();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Integrantes');

  // 🎯 Fila título profesional
  sheet.mergeCells('A1:O1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'Listado de Integrantes del Club CARPER';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF2E7D32' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 30;

  // 🎯 Encabezado
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
      fgColor: { argb: 'FF2E7D32' } // Verde institucional
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Blanco
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
      integrante.participacion,
      ''
    ]);
    row.height = 60;

    // 📸 Agrega imagen si existe
    if (integrante.foto && fs.existsSync(`public${integrante.foto}`)) {
      const imageId = workbook.addImage({
        filename: path.join('public', integrante.foto),
        extension: path.extname(integrante.foto).replace('.', '')
      });

      sheet.addImage(imageId, {
        tl: { col: imageCol - 1, row: rowIndex - 1 },
        ext: { width: 60, height: 60 }
      });
    }

    rowIndex++;
  }

  // 🖼️ Logo ajustado (más alargado en ancho)
  const logoPath = path.join('public', 'logo_carper.png');
  if (fs.existsSync(logoPath)) {
    const logoId = workbook.addImage({
      filename: logoPath,
      extension: 'png'
    });

    sheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 30, height: 30 } // ✅ Ancho ajustado aquí
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=Integrantes_CARPER.xlsx'
    }
  });
}
