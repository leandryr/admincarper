import dbConnect from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export async function PUT(req, { params }) {
  await dbConnect();
  const body = await req.json();

  try {
    const actualizado = await Usuario.findByIdAndUpdate(params.id, body, { new: true });
    return new Response(JSON.stringify(actualizado), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  await dbConnect();
  try {
    await Usuario.findByIdAndDelete(params.id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
