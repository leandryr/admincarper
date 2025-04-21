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

  if (integrante?.foto) {
    const oldImagePath = path.join(process.cwd(), 'public', integrante.foto);
    if (fs.existsSync(oldImagePath)) {
      await unlink(oldImagePath);
    }
  }

  await writeFile(filePath, buffer);

  // ✅ Subir a Cloudinary
  let cloudinaryUrl = null;
  try {
    const upload = await cloudinary.uploader.upload(filePath, {
      folder: 'carper/integrantes',
      public_id: path.parse(fileName).name,
    });
    cloudinaryUrl = upload.secure_url;
  } catch (err) {
    console.error('Error al subir a Cloudinary:', err);
  }

  // ✅ Guardar ambas rutas en MongoDB
  await Integrante.findByIdAndUpdate(params.id, {
    foto: url,
    ...(cloudinaryUrl && { cloudinaryUrl }), // solo si existe
  });

  return new Response(JSON.stringify({ success: true, url, cloudinaryUrl }), {
    status: 200,
  });
}
