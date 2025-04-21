'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  TextField,
  Paper,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import BuscarDocumento from './components/BuscarDocumento';
import MensajeAlerta from './components/MensajeAlerta';
import RegistroForm from './components/RegistroForm';
import Footer from './components/Footer';

export default function RegistroPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [tipoDoc, setTipoDoc] = useState('DNI');
  const [docNumero, setDocNumero] = useState('');
  const [datos, setDatos] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [mensajeTipo, setMensajeTipo] = useState('');
  const [mostrarRepresentante, setMostrarRepresentante] = useState(false);
  const [bloquearBusqueda, setBloquearBusqueda] = useState(false);
  const [requiereValidacion, setRequiereValidacion] = useState(false);
  const [validado, setValidado] = useState(false);
  const [intentosRestantes, setIntentosRestantes] = useState(5);
  const [respuesta, setRespuesta] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  const toggleDrawer = () => setMobileOpen(!mobileOpen);
  const navItems = [{ label: 'Inicio', href: '/' }];
  const loginItems = [{ label: 'Admin', href: '/admin/login' }];

  const drawer = (
    <Box onClick={toggleDrawer} sx={{ width: 240 }}>
      <List>
        {navItems.map(item => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} href={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {loginItems.map(item => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} href={item.href}>
              <ListItemText primary={`Ingresar ${item.label}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const mostrarMensajeFn = (texto, tipo = 'ok') => {
    setMensaje(texto);
    setMensajeTipo(tipo);
    setTimeout(() => setMensaje(''), 4000);
  };

  // Paso 1: buscar
  const buscar = async () => {
    if (!docNumero.trim()) {
      mostrarMensajeFn('Debe ingresar un número de identificación', 'error');
      return;
    }
    if (tipoDoc === 'DNI' && !/^\d{8}$/.test(docNumero)) {
      mostrarMensajeFn('El DNI debe tener exactamente 8 dígitos', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/integrantes/${docNumero}?tipoDoc=${tipoDoc}`);
      if (res.ok) {
        const data = await res.json();
        const [primerNombre, ...resto] = data.nombres?.split(' ') || [''];
        setDatos(data);
        setForm({ ...data, primerNombre, segundoNombre: resto.join(' '), guardado: true });
        setBloquearBusqueda(true);
        setRequiereValidacion(true);
        mostrarMensajeFn('Registro encontrado. Verifica tus datos para continuar.');
      } else {
        setDatos(null);
        setForm({
          tipoDoc,
          docNumero,
          primerNombre: '',
          segundoNombre: '',
          apPaterno: '',
          apMaterno: '',
          sexo: '',
          telefono: '',
          email: '',
          numeroSocio: '',
          fechaNacimiento: { dia: '', mes: '', anio: '' },
          guardado: false,
        });
        setBloquearBusqueda(true);
        setMostrarRepresentante(true);
        mostrarMensajeFn('Documento no encontrado. Completa el formulario para registrarte.');
      }
    } catch {
      mostrarMensajeFn('Error al conectar con el servidor', 'error');
    }
  };

  // Paso 2: validar últimos 4 dígitos
  const validarSeguridad = () => {
    if (intentosRestantes <= 0) return;
    const ultimos4 = datos?.telefono?.slice(-4);
    if (respuesta.trim() === ultimos4) {
      setValidado(true);
      mostrarMensajeFn('Validación correcta ✅');
    } else {
      const restantes = intentosRestantes - 1;
      setIntentosRestantes(restantes);
      setErrorValidacion(`❌ Validación incorrecta. Intentos restantes: ${restantes}`);
    }
  };

  // Reiniciar todo el flujo
  const reiniciarBusqueda = () => {
    setDocNumero('');
    setDatos(null);
    setForm(null);
    setRespuesta('');
    setErrorValidacion('');
    setIntentosRestantes(5);
    setBloquearBusqueda(false);
    setRequiereValidacion(false);
    setValidado(false);
    setMostrarRepresentante(false);
    setMensaje('');
    setMensajeTipo('');
  };

  // Paso 3: guardar
  const guardar = async () => {
    // asumimos validado ya
    try {
      const metodo = datos ? 'PUT' : 'POST';
      const payload = {
        ...form,
        nombres: [form.primerNombre, form.segundoNombre].filter(Boolean).join(' ').trim(),
      };
      const res = await fetch('/api/integrantes', {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        mostrarMensajeFn('Datos guardados correctamente ✅');
        setForm(prev => ({ ...prev, guardado: true }));
      } else {
        const err = await res.json();
        mostrarMensajeFn(err.error || 'Error al guardar datos', 'error');
      }
    } catch {
      mostrarMensajeFn('Error del servidor', 'error');
    }
  };

  // Manejador cambios
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'dia' || name === 'mes' || name === 'anio') {
      setForm(prev => ({
        ...prev,
        fechaNacimiento: { ...prev.fechaNacimiento, [name]: value },
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ bgcolor: '#fff' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: 'blur(10px)', bgcolor: 'rgba(255,255,255,0.8)' }}
      >
        <Toolbar>
          {isMobile ? (
            <IconButton edge="start" onClick={toggleDrawer}>
              <MenuIcon sx={{ color: '#2e7d32' }} />
            </IconButton>
          ) : (
            <Box sx={{ width: 36, height: 36, mr: 2, position: 'relative' }}>
              <Image src="/logo-carper.png" alt="Logo CARPER" fill style={{ objectFit: 'contain' }} />
            </Box>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#2e7d32', fontWeight: 'bold' }}>
            Registro CARPER
          </Typography>
          {!isMobile && (
            <Button component={Link} href="/admin/login" sx={{ color: '#2e7d32' }}>
              Ingresar Admin
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer open={mobileOpen} onClose={toggleDrawer} ModalProps={{ keepMounted: true }}>
          {drawer}
        </Drawer>
      )}

      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', pt: { xs: 10, md: 12 }, flex: 1 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          align="center"
          sx={{ mb: 3, px: { xs: 2, md: 0 }, lineHeight: 1.4 }}
        >
          Ingresa tu tipo de documento y número,
          <br />
          si no estás registrado, actualízalo.
        </Typography>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          {bloquearBusqueda && (
            <Tooltip title="Limpiar y registrar otro">
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={reiniciarBusqueda}
              >
                Reiniciar
              </Button>
            </Tooltip>
          )}
        </Box>

        <BuscarDocumento
          tipoDoc={tipoDoc}
          setTipoDoc={setTipoDoc}
          docNumero={docNumero}
          setDocNumero={setDocNumero}
          buscar={buscar}
          disabled={bloquearBusqueda}
        />

        <MensajeAlerta mensaje={mensaje} tipo={mensajeTipo} />

        {datos && requiereValidacion && !validado && intentosRestantes > 0 && (
          <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Validación de Seguridad
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ingresa los últimos 4 dígitos de tu teléfono registrado.
            </Typography>
            <TextField
              label="Últimos 4 dígitos"
              fullWidth
              value={respuesta}
              onChange={e => {
                setRespuesta(e.target.value);
                setErrorValidacion('');
              }}
              sx={{ mb: 2 }}
            />
            {errorValidacion && <Alert severity="error" sx={{ mb: 2 }}>{errorValidacion}</Alert>}
            <Button
              variant="contained"
              onClick={validarSeguridad}
              disabled={intentosRestantes <= 0}
            >
              Validar Identidad
            </Button>
          </Paper>
        )}

        {datos && !validado && intentosRestantes === 0 && (
          <Alert severity="error" sx={{ mt: 3 }}>
            🚫 Has superado los intentos permitidos. Usa "Reiniciar".
          </Alert>
        )}

        {form && (validado || mostrarRepresentante) && (
          <RegistroForm
            form={form}
            setForm={setForm}
            handleChange={handleChange}
            guardar={guardar}
          />
        )}
      </Box>

      <Footer />
    </Box>
  );
}
