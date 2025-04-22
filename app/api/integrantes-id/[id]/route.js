import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';
import Historial from '@/models/Historial';
import { headers } from 'next/headers';

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = params;
  const body = await req.json();

  try {
    const actualizado = await Integrante.findByIdAndUpdate(id, {
      ...body,
      ...(body.cloudinaryUrl && { cloudinaryUrl: body.cloudinaryUrl }),
    }, { new: true });

    if (!actualizado) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    // ✅ Registrar historial si el usuario está autenticado
    const cookieHeader = headers().get('cookie') || '';
    const match = cookieHeader.match(/admin=([^;]+)/);
    if (match) {
      try {
        const user = JSON.parse(decodeURIComponent(match[1]));
        const ip = headers().get('x-forwarded-for') || 'IP no disponible';

        await Historial.create({
          usuario: user._id, // ✅ Solo si tienes `user._id` en tu cookie
          accion: `Editó integrante ${actualizado.nombres}`,
          ip
        });
      } catch (err) {
        console.warn('⚠️ No se pudo registrar historial:', err);
      }
    }

    return new Response(JSON.stringify(actualizado), { status: 200 });
  } catch (error) {
    console.error('❌ Error al actualizar integrante:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const eliminado = await Integrante.findByIdAndDelete(id);
    if (!eliminado) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    // ✅ Registrar historial si el usuario está autenticado
    const cookieHeader = headers().get('cookie') || '';
    const match = cookieHeader.match(/admin=([^;]+)/);
    if (match) {
      try {
        const user = JSON.parse(decodeURIComponent(match[1]));
        const ip = headers().get('x-forwarded-for') || 'IP no disponible';

        await Historial.create({
          usuario: user._id, // asegúrate que _id esté presente en la cookie
          accion: `Eliminó integrante ${eliminado.nombres}`,
          ip
        });
      } catch (err) {
        console.warn('⚠️ No se pudo registrar historial de eliminación:', err);
      }
    }

    return new Response(JSON.stringify({ message: 'Integrante eliminado correctamente ✅' }), { status: 200 });
  } catch (error) {
    console.error('❌ Error al eliminar integrante:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const integrante = await Integrante.findById(id);
    if (!integrante) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(integrante), { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener integrante:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
