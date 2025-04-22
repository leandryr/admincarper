import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Actualizacion from '@/models/Actualizacion';

export async function GET() {
  try {
    await dbConnect();
    const lista = await Actualizacion.find().sort({ createdAt: -1 });
    return NextResponse.json(lista);
  } catch (error) {
    console.error('❌ Error al obtener actualizaciones:', error);
    return NextResponse.json({ error: 'Error al obtener actualizaciones' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { fecha, hora, cambios } = await req.json();

    if (!fecha || !hora || !Array.isArray(cambios) || cambios.length === 0) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Buscar última versión
    const ultima = await Actualizacion.findOne().sort({ createdAt: -1 });
    let version = '1.0.0';

    if (ultima?.version) {
      const partes = ultima.version.split('.').map(Number);
      partes[2]++;
      version = partes.join('.');
    }

    const nueva = await Actualizacion.create({ version, fecha, hora, cambios });
    return NextResponse.json(nueva);
  } catch (error) {
    console.error('❌ Error al guardar actualización:', error);
    return NextResponse.json({ error: 'Error al guardar actualización' }, { status: 500 });
  }
}
