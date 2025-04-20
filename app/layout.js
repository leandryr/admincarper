
export const metadata = {
  title: 'Registro CARPER',
  description: 'Empadronamiento de Integrantes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
