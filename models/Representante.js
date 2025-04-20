import mongoose from 'mongoose';

const representanteSchema = new mongoose.Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  parentesco: { type: String, required: true },
  oficio: { type: String },
  empresa: { type: String },
  contacto: { type: String },
  integranteDoc: { type: String, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Representante || mongoose.model('Representante', representanteSchema);
