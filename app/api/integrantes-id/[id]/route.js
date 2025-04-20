import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = params;
  const body = await req.json();

  try {
    const actualizado = await Integrante.findByIdAndUpdate(id, body, { new: true });
    if (!actualizado) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
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
