import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function PUT(req) {
  await dbConnect();
  const body = await req.json();
  const { docNumero, index, ...nuevo } = body;

  try {
    const integrante = await Integrante.findOne({ docNumero });

    if (!integrante) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    if (!integrante.representantes || !integrante.representantes[index]) {
      return new Response(JSON.stringify({ error: 'Representante no encontrado' }), { status: 404 });
    }

    // Actualizar campos del representante específico
    integrante.representantes[index] = { ...integrante.representantes[index], ...nuevo };
    await integrante.save();

    return new Response(JSON.stringify({ mensaje: 'Representante actualizado' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  const body = await req.json();
  const { docNumero, index } = body;

  try {
    const integrante = await Integrante.findOne({ docNumero });

    if (!integrante) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    if (!integrante.representantes || !integrante.representantes[index]) {
      return new Response(JSON.stringify({ error: 'Representante no encontrado' }), { status: 404 });
    }

    // Eliminar representante por índice
    integrante.representantes.splice(index, 1);
    await integrante.save();

    return new Response(JSON.stringify({ mensaje: 'Representante eliminado' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
