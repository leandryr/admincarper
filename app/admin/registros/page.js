'use client';

import { useState, useEffect } from 'react';
import SidebarAdmin from '../components/SidebarAdmin';
import HeaderAdmin from '../components/HeaderAdmin';
import TablaIntegrantes from '../components/TablaIntegrantes';
import AdminThemeProvider from '../AdminThemeProvider';
import EditarIntegranteModal from '../components/EditarIntegranteModal';
import ExportarExcelIntegrantes from '../components/ExportarExcelIntegrantes';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [activeView, setActiveView] = useState('registros');
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [integranteAEditar, setIntegranteAEditar] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar sesión y obtener rol
  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) return router.push('/admin/login');
        const data = await res.json();
        setUser(data.user);
        setLoading(false);
      } catch {
        router.push('/admin/login');
      }
    };
    verificar();
  }, [router]);

  const abrirModalEditar = (integrante) => {
    if (user?.rol === 'superadmin') {
      setIntegranteAEditar(integrante);
      setModalEditarAbierto(true);
    }
  };

  const cerrarModalEditar = () => {
    setModalEditarAbierto(false);
    setIntegranteAEditar(null);
  };

  if (loading || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AdminThemeProvider>
      <div style={{ display: 'flex', height: '100vh' }}>
        <SidebarAdmin setActiveView={setActiveView} />
        <div style={{ flexGrow: 1, width: '100%' }}>
          <HeaderAdmin />
          <div style={{ padding: '20px' }}>
            {activeView === 'registros' && (
              <>
                {/* ✅ Exportar solo si es superadmin o asistente */}
                {(user.rol === 'superadmin' || user.rol === 'asistente') && (
                  <ExportarExcelIntegrantes />
                )}

                {/* 📋 Tabla de integrantes */}
                <TablaIntegrantes onEditar={abrirModalEditar} rol={user.rol} />

                {/* 🛠 Modal solo si el rol lo permite */}
                {integranteAEditar && user.rol === 'superadmin' && (
                  <EditarIntegranteModal
                    open={modalEditarAbierto}
                    onClose={cerrarModalEditar}
                    integrante={integranteAEditar}
                    onGuardar={cerrarModalEditar}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
