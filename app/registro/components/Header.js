'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import LogoCarper from '/public/logo-carper.png'; 

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        textAlign: 'center',
        py: 4,
        bgcolor: 'transparent', 
        borderBottom: '2px solid #ccc', 
      }}
    >
      <Image
        src={LogoCarper}
        alt="Logo Carper"
        width={60}
        height={80}
        priority
      />

      <Typography
        variant="h4"
        fontWeight="bold"
        mt={2}
        sx={{ color: '#222', letterSpacing: 1 }} 
      >
        CARPER - EMPADRONAMIENTO
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{ color: '#555', fontWeight: 500 }} 
      >
        2025
      </Typography>
    </Box>
  );
}
