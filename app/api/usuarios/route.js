import dbConnect from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';
import bcryptjs from 'bcryptjs';

export async function GET() {
  await dbConnect();
  const usuarios = await Usuario.find({}, 'nombre apellido email cargo rol');
  return new Response(JSON.stringify(usuarios), { status: 200 });
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  const email = body.email.toLowerCase().trim();

  if (!body.nombre || !body.apellido || !email || !body.password) {
    return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios' }), { status: 400 });
  }

  try {
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return new Response(JSON.stringify({ error: 'Correo ya registrado' }), { status: 400 });
    }

    const hashedPassword = await bcryptjs.hash(body.password, 10);
    const nuevo = new Usuario({
      nombre: body.nombre,
      apellido: body.apellido,
      email: email,
      password: hashedPassword,
      cargo: body.cargo,
      rol: body.rol || 'lectura'
    });

    const guardado = await nuevo.save();
    return new Response(JSON.stringify(guardado), { status: 201 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
