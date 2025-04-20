import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Historial from '@/models/Historial';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/authOptions';
import { headers } from 'next/headers';

export async function POST() {
  const res = NextResponse.json({ msg: 'Sesión cerrada' });

  res.cookies.set('admin', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  // Guardar en historial
  await dbConnect();
  const session = await getServerSession(authOptions);
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'IP no disponible';

  if (session?.user?._id) {
    await Historial.create({
      usuario: session.user._id,
      accion: 'Cerró sesión del sistema',
      ip,
    });
  }

  return res;
}
