export const runtime = 'nodejs';

import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const tipoDoc = searchParams.get('tipoDoc');
    const docNumero = searchParams.get('docNumero');

    if (!tipoDoc || !docNumero) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { status: 400 });
    }

    const integrante = await Integrante.findOne({
      tipoDoc: tipoDoc.trim(),
      docNumero: docNumero.trim(),
    });

    if (!integrante) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        codigo: integrante.codigo || '',
        nombres: integrante.nombres || '',
        apPaterno: integrante.apPaterno || '',
        apMaterno: integrante.apMaterno || '',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al buscar integrante existente:', error);
    return new Response(JSON.stringify({ error: 'Error del servidor' }), { status: 500 });
  }
}
