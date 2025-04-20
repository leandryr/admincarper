import mongoose from 'mongoose';

const integranteSchema = new mongoose.Schema({
  codigo: String,
  apPaterno: String,
  apMaterno: String,
  nombres: String,
  sexo: String,
  numeroSocio: String,
  tipoDoc: { type: String, default: 'DNI' },
  docNumero: { type: String, required: true }, 
  fechaNacimiento: {
    dia: String,
    mes: String,
    anio: { type: String, default: '1900' }
  },
  telefono: String,
  email: String,
  status: { type: String, default: 'ACTIVO' },
  cargo: { type: String, default: '' },
  participacion: { type: String, default: 'NO' },
  foto: { type: String, default: '' },
  representantes: [
    {
      nombres: { type: String },
      apellidos: { type: String },
      parentesco: { type: String },
      oficio: { type: String },
      empresa: { type: String },
      contacto: { type: String }
    }
  ]
}, { timestamps: true });

// compuesto tipoDoc + docNumero
integranteSchema.index({ tipoDoc: 1, docNumero: 1 }, { unique: true });

export default mongoose.models.Integrante || mongoose.model('Integrante', integranteSchema);
