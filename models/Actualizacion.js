import mongoose from 'mongoose';

const actualizacionSchema = new mongoose.Schema({
  version: { type: String, required: true },
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  cambios: { type: [String], default: [] }
}, {
  timestamps: true
});

export default mongoose.models.Actualizacion || mongoose.model('Actualizacion', actualizacionSchema);
