import { writeFile, unlink } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function POST(req, { params }) {
  await dbConnect();

  const formData = await req.formData();
  const file = formData.get('foto');

  if (!file) {
    return new Response(JSON.stringify({ error: 'No se subió ninguna imagen' }), {
      status: 400,
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
  const url = `/uploads/${fileName}`;

  // Buscar el integrante y eliminar la imagen anterior si existe
  const integrante = await Integrante.findById(params.id);
  if (integrante?.foto) {
    const oldImagePath = path.join(process.cwd(), 'public', integrante.foto);
    if (fs.existsSync(oldImagePath)) {
      await unlink(oldImagePath); // elimina la imagen anterior
    }
  }

  // Guardar nueva imagen
  await writeFile(filePath, buffer);

  // Actualizar ruta de imagen en MongoDB
  await Integrante.findByIdAndUpdate(params.id, {
    foto: url,
  });

  return new Response(JSON.stringify({ success: true, url }), {
    status: 200,
  });
}
