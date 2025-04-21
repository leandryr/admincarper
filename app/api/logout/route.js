import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Historial from '@/models/Historial';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

export async function POST() {
  // 1) Conecta a BD
  await dbConnect();

  // 2) Lee y decodifica la cookie "admin"
  const cookieStore = cookies();
  const cookie = cookieStore.get('admin');
  let usuario = null;
  if (cookie) {
    try {
      usuario = JSON.parse(decodeURIComponent(cookie.value));
    } catch (e) {
      console.error('Error decodificando cookie admin:', e);
    }
  }

  // 3) Si tenemos usuario, guarda el registro en Historial
  if (usuario?._id) {
    // Obtén IP real si está detrás de proxy
    const xff = cookieStore.get('x-forwarded-for')?.value;
    const ip = xff?.split(',')[0] || 'IP no detectada';
    try {
      await Historial.create({
        usuario: new mongoose.Types.ObjectId(usuario._id),
        accion: 'Cerró sesión del sistema',
        ip,
        fecha: new Date(),
      });
    } catch (err) {
      console.error('Error guardando historial de logout:', err);
    }
  }

  // 4) Prepara la respuesta y limpia la cookie
  const res = NextResponse.json({ msg: 'Sesión cerrada' });
  res.cookies.set('admin', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  });
  return res;
}
