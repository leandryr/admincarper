import { writeFile, unlink } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

  const integrante = await Integrante.findById(params.id);

  // ✅ Detecta si estamos en Vercel (producción) o local
  const esProduccion = process.env.VERCEL === '1';

  // 🔁 Solo elimina archivo local si NO estamos en producción
  if (!esProduccion && integrante?.foto) {
    const oldImagePath = path.join(process.cwd(), 'public', integrante.foto);
    if (fs.existsSync(oldImagePath)) {
      await unlink(oldImagePath);
    }
  }

  // 🔁 Solo guarda en disco si NO estamos en producción
  if (!esProduccion) {
    await writeFile(filePath, buffer);
  }

  // ✅ Subir a Cloudinary directamente (siempre)
  let cloudinaryUrl = null;
  try {
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const upload = await cloudinary.uploader.upload(dataUrl, {
      folder: 'carper/integrantes',
      public_id: fileName.split('.')[0],
    });

    cloudinaryUrl = upload.secure_url;
  } catch (err) {
    console.error('Error al subir a Cloudinary:', err);
  }

  // ✅ Guardar en MongoDB
  await Integrante.findByIdAndUpdate(params.id, {
    cloudinaryUrl: cloudinaryUrl || '',
    foto: esProduccion ? '' : url, // ⛔ solo guarda 'foto' si es local
  });

  return new Response(
    JSON.stringify({ success: true, cloudinaryUrl, ...(esProduccion ? {} : { url }) }),
    { status: 200 }
  );
}
