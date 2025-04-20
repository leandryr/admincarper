import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Historial from '@/models/Historial';
import { headers } from 'next/headers';
import mongoose from 'mongoose';
import '@/models/Usuario';

export async function GET() {
  await dbConnect();

  // 1) Leer la cookie que creaste al hacer login
  const cookieHeader = headers().get('cookie') || '';
  const match = cookieHeader.match(/admin=([^;]+)/);
  if (!match) {
    return NextResponse.json([], { status: 200 });
  }

  let user;
  try {
    user = JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return NextResponse.json([], { status: 200 });
  }

  // 2) Solo superadmin puede ver
  if (user.rol !== 'superadmin') {
    return NextResponse.json([], { status: 200 });
  }

  // 3) Ya estás autorizado, devuelves el historial real
  try {
    const historial = await Historial.find()
      .sort({ fecha: -1 })
      .populate({
        path: 'usuario',
        model: 'Usuario',
        select: 'nombre apellido email rol'
      });
    return NextResponse.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE() {
  await dbConnect();

  // Mismo check de cookie
  const cookieHeader = headers().get('cookie') || '';
  const match = cookieHeader.match(/admin=([^;]+)/);
  if (!match) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  let user;
  try {
    user = JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  if (user.rol !== 'superadmin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    await Historial.deleteMany({});
    return NextResponse.json({ ok: true, message: 'Historial limpiado' });
  } catch (error) {
    console.error('Error al eliminar historial:', error);
    return NextResponse.json({ error: 'Error al limpiar historial' }, { status: 500 });
  }
}