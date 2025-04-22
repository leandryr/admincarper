export const runtime = 'nodejs';
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
      foto: ''
    });

    try {
      let imageBuffer;
      let extension;

      // ✅ Usar Cloudinary si está disponible
      if (integrante.cloudinaryUrl) {
        const response = await axios.get(integrante.cloudinaryUrl, { responseType: 'arraybuffer' });
        imageBuffer = response.data;
        extension = path.extname(integrante.cloudinaryUrl).replace('.', '') || 'jpg';
      }

      // Si se obtuvo la imagen
      if (imageBuffer) {
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: extension,
        });

        sheet.addImage(imageId, {
          tl: { col: imageColumn - 1, row: i + 1 },
          ext: { width: 60, height: 60 }
        });
      }
    } catch (err) {
      console.error('❌ Error al obtener imagen:', err.message);
    }
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
