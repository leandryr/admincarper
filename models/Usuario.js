import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  email: { type: String, unique: true },
  password: String,
  cargo: String,
  rol: {
    type: String,
    enum: ['superadmin', 'asistente', 'lectura'],
    default: 'lectura'
  }
}, { timestamps: true });

export const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);