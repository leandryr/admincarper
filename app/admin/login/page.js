'use client';

import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import logo from '@/../public/logo-carper.png';

export default function LoginAdminPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [bloqueado, setBloqueado] = useState(false);
  const [restante, setRestante] = useState(60);
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState('success');
  const [open, setOpen] = useState(false);
  const [intentoInfo, setIntentoInfo] = useState('');
  const [openIntento, setOpenIntento] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer;
    if (bloqueado && restante > 0) {
      timer = setTimeout(() => {
        setRestante((prev) => prev - 1);
      }, 1000);
    } else if (restante <= 0) {
      setBloqueado(false);
      setRestante(60);
    }
    return () => clearTimeout(timer);
  }, [bloqueado, restante]);

  const ingresar = async () => {
    if (bloqueado) return;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje('Ingreso exitoso');
        setTipo('success');
        setOpen(true);

        // Registrar historial de login
        await fetch('/api/historial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'Inicio de sesión exitoso' }),
        });

        router.push('/admin');
      } else {
        setError(data?.error || 'Error al iniciar sesión');

        if (!data.bloqueado && data?.error?.includes('intent')) {
          const match = data.error.match(/(\d) de 5/);
          if (match) {
            const intento = parseInt(match[1]);
            if (intento === 4) {
              setIntentoInfo(`4 de 5 intentos fallidos – el próximo bloqueará el acceso`);
            } else {
              setIntentoInfo(`${intento} de 5 intentos fallidos`);
            }
            setOpenIntento(true);
          }
        }

        if (data?.bloqueado) {
          setBloqueado(true);
          setRestante(Math.ceil(data.restante / 1000));
          setIntentoInfo('Has sido bloqueado por 1 minuto.');
          setOpenIntento(true);
        }

        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Error del servidor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#e8f5e9',
        padding: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          borderRadius: 2,
          borderTop: '5px solid #2e7d32',
        }}
      >
        <Image
          src={logo}
          alt="Logo Carper"
          width={70}
          height={92}
          style={{ marginBottom: 12 }}
        />
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: '#2e7d32', mb: 2 }}
        >
          Iniciar Sesión – Panel Administrativo
        </Typography>

        <TextField
          fullWidth
          label="Correo"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          label="Contraseña"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          sx={{ mt: 2 }}
          disabled={bloqueado}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: '#2e7d32',
            '&:hover': { backgroundColor: '#27632a' },
          }}
          onClick={ingresar}
          disabled={bloqueado}
        >
          {bloqueado ? `Bloqueado ${restante}s` : 'Ingresar'}
        </Button>
      </Paper>

      {/* Alerta de éxito */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={tipo} sx={{ width: '100%' }} onClose={() => setOpen(false)}>
          {mensaje}
        </Alert>
      </Snackbar>

      {/* Alerta de intentos fallidos */}
      <Snackbar
        open={openIntento}
        autoHideDuration={3000}
        onClose={() => setOpenIntento(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          onClose={() => setOpenIntento(false)}
          sx={{ width: '100%' }}
        >
          {intentoInfo}
        </Alert>
      </Snackbar>
    </Box>
  );
}
