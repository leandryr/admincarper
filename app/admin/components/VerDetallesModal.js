'use client';

import { Box, Typography, Modal, Table, TableBody, TableCell, TableRow, Avatar } from '@mui/material';

export default function VerDetallesModal({ open, onClose, integrante }) {
  const imagen = integrante.cloudinaryUrl || ''; // ✅ Mostrar solo cloudinaryUrl

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 700 },
          maxHeight: { xs: '90vh', sm: 'auto' },
          overflowY: { xs: 'auto', sm: 'visible' },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        {/* Foto centrada */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {imagen ? (
            <Avatar
              src={imagen}
              alt="Foto"
              sx={{ width: 120, height: 120, border: '2px solid #ccc' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Foto no registrada
            </Typography>
          )}
        </Box>

        <Typography variant="h6" gutterBottom textAlign="center">
          Detalles del Integrante
        </Typography>

        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Código</strong></TableCell>
              <TableCell>{integrante.codigo}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ap. Paterno</strong></TableCell>
              <TableCell>{integrante.apPaterno}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Ap. Materno</strong></TableCell>
              <TableCell>{integrante.apMaterno}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Nombres</strong></TableCell>
              <TableCell>{integrante.nombres}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Sexo</strong></TableCell>
              <TableCell>{integrante.sexo}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>N° Socio</strong></TableCell>
              <TableCell>{integrante.numeroSocio}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Tipo Documento</strong></TableCell>
              <TableCell>{integrante.tipoDoc}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Número Documento</strong></TableCell>
              <TableCell>{integrante.docNumero}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Fecha Nac.</strong></TableCell>
              <TableCell>
                {integrante.fechaNacimiento?.dia}/
                {integrante.fechaNacimiento?.mes}/
                {integrante.fechaNacimiento?.anio}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Teléfono</strong></TableCell>
              <TableCell>{integrante.telefono}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell>{integrante.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell>{integrante.status}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Cargo</strong></TableCell>
              <TableCell>{integrante.cargo || 'Por asignar'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Participación</strong></TableCell>
              <TableCell>{integrante.participacion}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Modal>
  );
}
