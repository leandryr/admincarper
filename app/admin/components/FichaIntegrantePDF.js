'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button, Tooltip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export default function FichaIntegrantePDF({ integrante }) {
  const generarPDF = async () => {
    const doc = new jsPDF();

    // Logo y título
    const logoUrl = '/logo_carper.png';
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 15, 20);
      doc.setFontSize(18);
      doc.setTextColor(46, 125, 50);
      doc.text('Ficha de Registro – Club CARPER', 50, 25);
      doc.setDrawColor(100);
      doc.setLineWidth(0.3);
      doc.line(10, 35, 200, 35);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      // Tabla de datos del integrante
      const datos = [
        ['Código', integrante.codigo],
        ['Nombres', integrante.nombres],
        ['Apellido Paterno', integrante.apPaterno],
        ['Apellido Materno', integrante.apMaterno],
        ['Sexo', integrante.sexo === 'M' ? 'Masculino' : 'Femenino'],
        ['Número de Socio', integrante.numeroSocio],
        ['Tipo Documento', integrante.tipoDoc],
        ['Número Documento', integrante.docNumero],
        ['Fecha Nacimiento', `${integrante.fechaNacimiento?.dia}/${integrante.fechaNacimiento?.mes}/${integrante.fechaNacimiento?.anio}`],
        ['Teléfono', integrante.telefono],
        ['Email', integrante.email],
        ['Status', integrante.status],
        ['Deportista', integrante.participacion],
      ];

      autoTable(doc, {
        startY: 40,
        head: [['Campo', 'Valor']],
        body: datos,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [46, 125, 50],
          textColor: 255,
        },
      });

      // Mostrar imagen desde Cloudinary si está disponible
      if (integrante.cloudinaryUrl) {
        const foto = new Image();
        foto.crossOrigin = 'anonymous';
        foto.src = integrante.cloudinaryUrl;
        foto.onload = () => {
          doc.addImage(foto, 'JPEG', 160, 10, 20, 20);
          doc.save(`Ficha_${integrante.codigo}.pdf`);
        };
      } else {
        doc.text('Foto: No disponible', 150, 50);
        doc.save(`Ficha_${integrante.codigo}.pdf`);
      }
    };
  };

  return (
    <Tooltip title="Generar PDF">
      <Button
        onClick={generarPDF}
        size="small"
        variant="outlined"
        color="secondary"
        startIcon={<PictureAsPdfIcon />}
      >
        PDF
      </Button>
    </Tooltip>
  );
}
