import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

// ✅ Buscar por tipoDoc + docNumero
export async function GET(req, { params }) {
  await dbConnect();
  const { dni } = params;

  // ✅ Corrección para Next.js 14 – usa req.nextUrl
  const tipoDoc = req.nextUrl?.searchParams?.get('tipoDoc') || 'DNI';

  try {
    const encontrado = await Integrante.findOne({ docNumero: dni, tipoDoc });

    if (!encontrado) {
      return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(encontrado), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ PATCH para agregar uno o varios representantes o editar uno por índice
export async function PATCH(req, { params }) {
  await dbConnect();
  const { dni } = params;
  const body = await req.json();
  const { nuevoRepresentante, representantes, index, representanteEditado } = body;

  try {
    const integrante = await Integrante.findOne({ docNumero: dni });

    if (!integrante) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    // ✅ Agregar un solo representante (modo individual)
    if (nuevoRepresentante) {
      const yaExiste = integrante.representantes?.some(
        (rep) => rep.parentesco === nuevoRepresentante.parentesco
      );

      if (yaExiste) {
        return new Response(JSON.stringify({ error: 'Ya existe un representante con ese parentesco' }), { status: 400 });
      }

      integrante.representantes = [...(integrante.representantes || []), nuevoRepresentante];
      await integrante.save();
      return new Response(JSON.stringify(integrante), { status: 200 });
    }

    // ✅ Agregar múltiples representantes
    if (Array.isArray(representantes)) {
      const repsValidos = representantes.filter(
        (rep) => rep && rep.nombres && rep.parentesco
      );

      integrante.representantes = [...(integrante.representantes || []), ...repsValidos];
      await integrante.save();
      return new Response(JSON.stringify(integrante), { status: 200 });
    }

    // ✅ Editar un representante por índice
    if (typeof index === 'number' && representanteEditado) {
      if (!integrante.representantes || index >= integrante.representantes.length) {
        return new Response(JSON.stringify({ error: 'Índice inválido' }), { status: 400 });
      }

      integrante.representantes[index] = representanteEditado;
      await integrante.save();
      return new Response(JSON.stringify(integrante), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Datos inválidos o incompletos' }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
