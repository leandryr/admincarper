'use client';

import { Box, Typography, Link } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        textAlign: 'center',
        py: 3,
        mt: 'auto',
        borderTop: '1px solid #e0e0e0',
        bgcolor: 'transparent',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#222',
          fontSize: '0.95rem',
          letterSpacing: 0.3,
        }}
      >
        Propiedad de <strong>Carper</strong> | Desarrollado por{' '}
        <Link
          href="https://rivasdev.com"
          target="_blank"
          sx={{
            color: '#2e7d32', 
            fontWeight: 'bold',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          RivaDev
        </Link>
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: '#555',
          fontSize: '0.75rem',
          mt: 0.5,
          display: 'block',
        }}
      >
        2025. Todos los derechos reservados
      </Typography>
    </Box>
  );
}
