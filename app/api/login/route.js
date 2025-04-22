import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { Usuario } from '@/models/Usuario';
import dbConnect from '@/lib/mongodb';
import Historial from '@/models/Historial';
import { headers } from 'next/headers';

const intentosFallidos = new Map();

export async function POST(req) {
  await dbConnect();

  const { email, password } = await req.json();
  const ahora = Date.now();
  const entrada = intentosFallidos.get(email) || { count: 0, last: 0 };
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'IP no disponible';

  const tiempoRestante = 60000 - (ahora - entrada.last);

  if (entrada.count >= 5 && tiempoRestante > 0) {
    return NextResponse.json(
      {
        error: `Demasiados intentos. Intenta nuevamente en ${Math.ceil(
          tiempoRestante / 1000
        )} segundos.`,
        bloqueado: true,
        restante: tiempoRestante,
      },
      { status: 429 }
    );
  }

  const user = await Usuario.findOne({ email });

  if (!user) {
    const nuevoIntento = entrada.count + 1;
    intentosFallidos.set(email, { count: nuevoIntento, last: ahora });

    return NextResponse.json(
      {
        error: `${nuevoIntento} de 5 intentos fallidos`,
        bloqueado: false,
      },
      { status: 401 }
    );
  }

  const valid = await bcryptjs.compare(password, user.password);

  if (!valid) {
    const nuevoIntento = entrada.count + 1;
    intentosFallidos.set(email, { count: nuevoIntento, last: ahora });

    return NextResponse.json(
      {
        error:
          nuevoIntento === 4
            ? `4 de 5 intentos fallidos – el próximo bloqueará el acceso`
            : `${nuevoIntento} de 5 intentos fallidos`,
        bloqueado: false,
      },
      { status: 401 }
    );
  }

  // ✅ Limpiar intentos al iniciar correctamente
  intentosFallidos.delete(email);

  // ✅ Registrar historial de inicio de sesión
  await Historial.create({
    usuario: user._id,
    accion: 'Inició sesión en el sistema',
    ip,
  });

  // ✅ Guardar cookie
  const res = NextResponse.json({ msg: 'Login exitoso' });
  res.cookies.set('admin', JSON.stringify({
    _id: user._id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    rol: user.rol,
  }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  return res;
}
