import dbConnect from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';
import bcryptjs from 'bcryptjs';

export async function PUT(req, { params }) {
  await dbConnect();
  const { password } = await req.json();

  try {
    const hashed = await bcryptjs.hash(password, 10);
    const actualizado = await Usuario.findByIdAndUpdate(
      params.id,
      { password: hashed },
      { new: true }
    );

    return new Response(JSON.stringify(actualizado), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
