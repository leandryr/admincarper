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
  const navItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Noticias', href: '/' },
    { label: 'Empadronamiento', href: '/registro' },
    { label: 'Contacto', href: '/' },
  ];
  const loginItems = [
    { label: 'Administrador', href: '/admin/login' },
    { label: 'Socio', href: '#' },
    { label: 'Integrante', href: '#' },
    { label: 'Organizador', href: '#' },
  ];
  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  // Drawer para móvil
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

  // Estado formulario
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
  const [seguridad, setSeguridad] = useState({ numeroSocio: '', captcha: '' });
  const [num1, setNum1] = useState(Math.floor(Math.random() * 10));
  const [num2, setNum2] = useState(Math.floor(Math.random() * 10));
  const captchaRespuesta = (num1 + num2).toString();

  const mostrarMensajeFn = (texto, tipo = 'ok') => {
    setMensaje(texto);
    setMensajeTipo(tipo);
    setTimeout(() => setMensaje(''), 4000);
  };

  // Buscamos un integrante
  const buscar = async () => {
    if (!docNumero.trim())
      return mostrarMensajeFn('Debe ingresar un número de identificación', 'error');
    if (tipoDoc === 'DNI' && !/^\d{8}$/.test(docNumero))
      return mostrarMensajeFn('El DNI debe tener exactamente 8 dígitos', 'error');

    try {
      const res = await fetch(`/api/integrantes/${docNumero}?tipoDoc=${tipoDoc}`);
      if (res.ok) {
        const data = await res.json();
        const [primerNombre, ...resto] = data.nombres?.split(' ') || [''];
        const segundoNombre = resto.join(' ');
        setDatos(data);
        setForm({ ...data, primerNombre, segundoNombre, guardado: true });
        setMostrarRepresentante(false);
        setBloquearBusqueda(true);
        setRequiereValidacion(true);
        mostrarMensajeFn('Registro encontrado. Verifica tus datos para continuar.');
      } else {
        // un nuevo registro
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
          fechaNacimiento: { dia: '', mes: '', anio: '1900' },
          guardado: false,
        });
        setMostrarRepresentante(true);
        setBloquearBusqueda(true);
        mostrarMensajeFn('Documento no encontrado. Completa el formulario para registrarte.');
      }
    } catch {
      mostrarMensajeFn('Error al conectar con el servidor', 'error');
    }
  };

  // Validamos la seguridad
  const validarSeguridad = () => {
    if (
      seguridad.numeroSocio !== datos.numeroSocio ||
      seguridad.captcha !== captchaRespuesta
    ) {
      const nuevoIntento = intentosRestantes - 1;
      setIntentosRestantes(nuevoIntento);
      mostrarMensajeFn(`Datos inválidos. Intentos restantes: ${nuevoIntento}`, 'error');
      return;
    }
    setValidado(true);
    mostrarMensajeFn('Validación correcta ✅');
  };

  const reiniciarPregunta = () => {
    setNum1(Math.floor(Math.random() * 10));
    setNum2(Math.floor(Math.random() * 10));
    setSeguridad({ ...seguridad, captcha: '' });
  };

  // Cambios en el formato
  const handleChange = e => {
    const { name, value } = e.target;
    if (['dia', 'mes', 'anio'].includes(name)) {
      setForm(prev => ({
        ...prev,
        fechaNacimiento: { ...prev.fechaNacimiento, [name]: value },
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Guardar integrante
  const guardar = async () => {
    if (
      !form?.primerNombre ||
      !form?.apPaterno ||
      !form?.fechaNacimiento?.dia ||
      !form?.fechaNacimiento?.mes
    ) {
      return mostrarMensajeFn('Completa todos los campos requeridos', 'error');
    }
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
        if (!datos) setTimeout(() => setMostrarRepresentante(true), 1200);
      } else {
        const err = await res.json();
        mostrarMensajeFn(err.error || 'Error al guardar datos', 'error');
      }
    } catch {
      mostrarMensajeFn('Error del servidor', 'error');
    }
  };

  // Guardar representante
  const guardarRepresentanteEnIntegrante = async nuevoRep => {
    try {
      const res = await fetch(`/api/integrantes/${form.docNumero}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoRepresentante: nuevoRep }),
      });
      if (res.ok) {
        const actual = await res.json();
        // actual.representantes recordar esto
        mostrarMensajeFn('Representante agregado correctamente ✅');
      } else {
        const err = await res.json();
        mostrarMensajeFn(err.error || 'Error al agregar representante', 'error');
      }
    } catch {
      mostrarMensajeFn('Error del servidor', 'error');
    }
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" sx={{ bgcolor: '#fff' }}>
      <CssBaseline />

      {/* Navbar / Drawer */}
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
              <Image src="/logo-carper.png" alt="Logo" fill style={{ objectFit: 'contain' }} />
            </Box>
          )}
          <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', flexGrow: 1 }}>
            Registro CARPER
          </Typography>
          {!isMobile &&
            navItems.map(item => (
              <Button
                key={item.label}
                component={Link}
                href={item.href}
                sx={{ color: '#2e7d32', textTransform: 'none', mx: 0.5 }}
              >
                {item.label}
              </Button>
            ))}
          {!isMobile && (
            <Button component={Link} href="/admin/login" sx={{ color: '#2e7d32', ml: 2 }}>
              Ingresar
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer open={mobileOpen} onClose={toggleDrawer} ModalProps={{ keepMounted: true }}>
          {drawer}
        </Drawer>
      )}

      {/* Contenido */}
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', pt: { xs: 8, md: 10 }, flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>

          {bloquearBusqueda && (
            <Tooltip title="Limpiar y registrar otro">
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={() => location.reload()}
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
              Verificación de Seguridad
            </Typography>
            <TextField
              label="Número de Socio"
              value={seguridad.numeroSocio}
              onChange={e => setSeguridad({ ...seguridad, numeroSocio: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label={`¿Cuánto es ${num1} + ${num2}?`}
                value={seguridad.captcha}
                onChange={e => setSeguridad({ ...seguridad, captcha: e.target.value })}
                fullWidth
              />
              <Button onClick={reiniciarPregunta} variant="outlined">
                Cambiar
              </Button>
            </Box>
            <Button variant="contained" onClick={validarSeguridad}>
              Validar
            </Button>
          </Paper>
        )}

        {datos && !validado && intentosRestantes === 0 && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Has superado los intentos permitidos.
          </Alert>
        )}

        {form && (!datos || validado) && (
          <RegistroForm
            form={form}
            setForm={setForm} 
            handleChange={handleChange}
            guardar={guardar}
            datos={datos}
            mostrarFormRep={mostrarRepresentante}
            setMostrarFormRep={setMostrarRepresentante}
            guardarRepresentante={guardarRepresentanteEnIntegrante}
          />
        )}
      </Box>

      <Footer />
    </Box>
  );
}
