import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const tipoDoc = searchParams.get('tipoDoc');
  const docNumero = searchParams.get('docNumero');

  if (!tipoDoc || !docNumero) {
    return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { status: 400 });
  }

  const existe = await Integrante.findOne({
    tipoDoc: tipoDoc.trim(),
    docNumero: docNumero.trim()
  });

  return new Response(JSON.stringify({ existe: !!existe }), { status: 200 });
}