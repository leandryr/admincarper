import mongoose from 'mongoose';

const ReporteSchema = new mongoose.Schema({
  asunto: String,
  descripcion: String,
  ip: String,
  fecha: String
});

export const Reporte = mongoose.models.Reporte || mongoose.model('Reporte', ReporteSchema);
