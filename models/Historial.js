import mongoose from 'mongoose';

const historialSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  accion: String,
  ip: String,
  fecha: { type: Date, default: Date.now },
});

export default mongoose.models.Historial || mongoose.model('Historial', historialSchema);
