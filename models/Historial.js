import mongoose from 'mongoose';

const historialSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  accion: { type: String, required: true },
  ip: { type: String, default: 'IP desconocida' },
  fecha: { type: Date, default: Date.now },
}, {
  timestamps: true // opcional, guarda createdAt y updatedAt
});

export default mongoose.models.Historial || mongoose.model('Historial', historialSchema);