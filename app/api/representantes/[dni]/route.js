import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function GET(req, { params }) {
  await dbConnect();

  const { dni } = params;

  try {
    const integrante = await Integrante.findOne({ docNumero: dni });

    if (!integrante) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(integrante.representantes || []), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
