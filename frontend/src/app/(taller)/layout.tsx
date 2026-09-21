'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Users,
  QrCode,
  LogOut,
  Menu,
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

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authService.getCurrentUser());
  }, [router]);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Órdenes de Trabajo', href: '/ordenes', icon: ClipboardList },
    { label: 'Recepción & Escáner', href: '/escanear', icon: QrCode },
    { label: 'Clientes & Autos', href: '/clientes', icon: Users },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 sticky top-0 h-screen justify-between z-40">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">TallerPro CRM</span>
              <span className="block text-[11px] text-slate-400 font-medium">Panel Operativo</span>
            </div>
          </div>

          {/* Navigation Links */}
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
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/50 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-semibold text-xs border border-indigo-500/30">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Usuario Taller'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role || 'MECÁNICO'}</p>
            </div>
          </div>

          <button
            onClick={() => authService.logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
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
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">TallerPro</span>
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

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
