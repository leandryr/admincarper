import dbConnect from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';
import { registrarHistorial } from '@/lib/registrarHistorial';
import { cookies } from 'next/headers';

export async function PUT(req, { params }) {
  await dbConnect();
  const body = await req.json();

  try {
    const actualizado = await Usuario.findByIdAndUpdate(params.id, body, { new: true });

    // Obtener usuario actual desde cookie (admin)
    const cookie = cookies().get('admin')?.value;
    if (cookie) {
      try {
        const user = JSON.parse(decodeURIComponent(cookie));
        if (user?._id) {
          await registrarHistorial({
            req,
            userId: user._id,
            accion: `Editó al usuario: ${actualizado?.nombre} ${actualizado?.apellido}`,
          });
        }
      } catch (err) {
        console.error('Error leyendo cookie de usuario para historial:', err);
      }
    }

    return new Response(JSON.stringify(actualizado), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  await dbConnect();
  try {
    const eliminado = await Usuario.findByIdAndDelete(params.id);

    // Obtener usuario actual desde cookie (admin)
    const cookie = cookies().get('admin')?.value;
    if (cookie) {
      try {
        const user = JSON.parse(decodeURIComponent(cookie));
        if (user?._id) {
          await registrarHistorial({
            req: _,
            userId: user._id,
            accion: `Eliminó al usuario: ${eliminado?.nombre} ${eliminado?.apellido}`,
          });
        }
      } catch (err) {
        console.error('Error leyendo cookie de usuario para historial:', err);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
