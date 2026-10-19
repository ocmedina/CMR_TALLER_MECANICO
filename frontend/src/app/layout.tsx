import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRM Taller Mecánico | Gestión & Seguimiento QR',
  description: 'Sistema integral de gestión para taller mecánico y portal público de seguimiento para clientes por código QR.',
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#08111f] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
