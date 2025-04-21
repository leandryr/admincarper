import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function POST() {
  try {
    await dbConnect();

    // Buscar y limpiar campo `foto` si ya existe `cloudinaryUrl`
    const resultado = await Integrante.updateMany(
      {
        cloudinaryUrl: { $exists: true, $ne: '' },
        foto: { $ne: '' }
      },
      {
        $set: { foto: '' }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Documentos actualizados: ${resultado.modifiedCount}`
    });
  } catch (error) {
    console.error('❌ Error en limpieza de fotos:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
