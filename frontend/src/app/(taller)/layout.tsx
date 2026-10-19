'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Users,
  QrCode,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
  User as UserIcon,
} from 'lucide-react';
import { authService } from '../../services/auth.service';
import { User } from '../../types';

export default function TallerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authService.getCurrentUser());
    setLightMode(localStorage.getItem('tallerpro-theme') === 'light');
  }, [router]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', lightMode);
    document.documentElement.classList.toggle('dark', !lightMode);
    localStorage.setItem('tallerpro-theme', lightMode ? 'light' : 'dark');
  }, [lightMode]);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Órdenes de Trabajo', href: '/ordenes', icon: ClipboardList },
    { label: 'Agenda de Turnos', href: '/turnos', icon: CalendarDays },
    { label: 'Recepción & Escáner', href: '/escanear', icon: QrCode },
    { label: 'Clientes & Autos', href: '/clientes', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-[#08111f] text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/[0.08] bg-[#0b1727]/90 backdrop-blur-xl p-6 sticky top-0 h-screen justify-between z-40">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-10">
            <img src="/Logo.png" alt="TallerPro Control Operativo" className="h-auto w-52 object-contain" />
          </div>

          {/* Navigation Links */}
          <p className="eyebrow px-3 mb-3">Espacio de trabajo</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/15 text-amber-400 flex items-center justify-center font-semibold text-xs border border-amber-400/20">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Usuario Taller'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role || 'MECÁNICO'}</p>
            </div>
          </div>

          <button
            onClick={() => authService.logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-slate-800/80 px-4 py-3 bg-slate-900/80 backdrop-blur flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <img src="/Logo.png" alt="TallerPro" className="h-auto w-32 object-contain" />
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-900 px-4 py-3 space-y-2 animate-in slide-in-from-top">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                <item.icon className="w-4 h-4 text-indigo-400" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => authService.logout()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg text-left"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3 lg:px-8">
          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            Sistema operativo
            <span className="text-slate-700">/</span>
            <span className="text-slate-300">{pathname === '/dashboard' ? 'Resumen general' : 'Gestión del taller'}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span className="hidden sm:inline">Turno activo</span>
            <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-amber-300">En línea</span>
            <button
              type="button"
              onClick={() => setLightMode((current) => !current)}
              title={lightMode ? 'Activar modo oscuro' : 'Activar modo claro'}
              aria-label={lightMode ? 'Activar modo oscuro' : 'Activar modo claro'}
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 transition-colors hover:text-amber-300"
            >
              {lightMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <main className="flex-1 p-5 md:p-8 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
