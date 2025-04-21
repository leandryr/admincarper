import dbConnect from './mongodb';
import Historial from '@/models/Historial';

export async function registrarHistorial({ req, userId, accion }) {
  await dbConnect();

  const ip =
    req?.headers['x-forwarded-for']?.split(',')[0] ||
    req?.connection?.remoteAddress ||
    req?.socket?.remoteAddress ||
    'IP no disponible';

  try {
    await Historial.create({
      usuario: userId,
      accion,
      ip,
    });
  } catch (err) {
    console.error('Error registrando historial:', err);
  }
}