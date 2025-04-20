import dbConnect from '@/lib/mongodb';
import Integrante from '@/models/Integrante';

export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  try {
    const count = await Integrante.countDocuments();
    const codigo = `CC${String(count + 1).padStart(5, '0')}`;

    const nuevo = new Integrante({ ...body, codigo });
    const guardado = await nuevo.save();

    return new Response(JSON.stringify(guardado), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(req) {
  await dbConnect();
  const body = await req.json();

  try {
    const actualizado = await Integrante.findOneAndUpdate(
      { docNumero: body.docNumero },
      body,
      { new: true }
    );

    if (!actualizado) {
      return new Response(JSON.stringify({ error: 'No encontrado' }), { status: 404 });
    }

    return new Response(JSON.stringify(actualizado), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// GET para listar todos los integrantes
export async function GET() {
  await dbConnect();
  try {
    const registros = await Integrante.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(registros), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// ✅ NUEVA RUTA: Agregar representante directamente a un integrante
export async function PATCH(req) {
  await dbConnect();
  const body = await req.json();
  const { docNumero, nuevoRepresentante } = body;

  try {
    const integrante = await Integrante.findOne({ docNumero });

    if (!integrante) {
      return new Response(JSON.stringify({ error: 'Integrante no encontrado' }), { status: 404 });
    }

    // Evitar duplicados por parentesco (opcional)
    const yaExiste = integrante.representantes?.some(
      (rep) => rep.parentesco === nuevoRepresentante.parentesco
    );

    if (yaExiste) {
      return new Response(JSON.stringify({ error: 'Representante con ese parentesco ya registrado' }), { status: 400 });
    }

    // Agregar al array de representantes
    integrante.representantes = [...(integrante.representantes || []), nuevoRepresentante];
    await integrante.save();

    return new Response(JSON.stringify(integrante), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
