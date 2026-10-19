'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wrench, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { authService } from '../services/auth.service';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#08111f] text-slate-100">
      {/* Header */}
      <header className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between bg-[#08111f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/Logo.png" alt="TallerPro Control Operativo" className="h-auto w-48 object-contain" />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="primary-button px-4 py-2"
          >
            Acceso Personal
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4" /> Plataforma Operativa & Transparencia Total
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Control Total del Taller y{' '}
          <span className="text-amber-300">
            Seguimiento en Vivo por QR
          </span>
        </h1>

        <p className="mt-6 text-slate-400 text-lg max-w-2xl">
          Digitaliza la recepción con escaneo de patente o parabrisas, gestiona reparaciones en el tablero Kanban y ofrece a tus clientes una experiencia transparente sin llamadas repetitivas.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="primary-button px-6 py-3.5"
          >
            Ingresar al Panel de Taller <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/portal/demo-token-toyota-corolla"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/[0.1] font-semibold transition-all"
          >
            <QrCode className="w-4 h-4 text-indigo-400" /> Ver Demo Portal Cliente (QR)
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="surface p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Recepción Express</h3>
            <p className="text-sm text-slate-400">
              Escanea el QR del parabrisas o escribe la patente para cargar o dar de alta el vehículo en segundos.
            </p>
          </div>

          <div className="surface p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tablero Kanban</h3>
            <p className="text-sm text-slate-400">
              Visualiza en qué etapa está cada orden, asigna mecánicos y añade repuestos con fotos del progreso.
            </p>
          </div>

          <div className="surface p-6 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Portal Transparente</h3>
            <p className="text-sm text-slate-400">
              Tus clientes siguen su auto en tiempo real desde el móvil viendo piezas reemplazadas y evidencias fotográficas.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
        CRM Taller Mecánico © {new Date().getFullYear()} — Arquitectura para Trabajo en Equipo Coordinado.
      </footer>
    </div>
  );
}
