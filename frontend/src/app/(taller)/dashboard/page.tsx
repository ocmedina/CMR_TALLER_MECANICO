'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  Car,
  CheckCircle2,
  Timer,
  Plus,
  QrCode,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { ordersService } from '../../../services/orders.service';
import { WorkOrder } from '../../../types';
import { STATUS_LABELS, formatDate } from '../../../lib/utils';

export default function DashboardPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService
      .getAll()
      .then(setOrders)
      .catch((err) => console.error('Error cargando órdenes para dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'DELIVERED'),
    [orders],
  );
  const inProgress = orders.filter((order) => order.status === 'IN_PROGRESS');
  const waitingParts = orders.filter((order) => order.status === 'WAITING_PARTS');
  const ready = orders.filter((order) => order.status === 'READY');

  return (
    <div className="space-y-7">
      <section className="command-hero">
        <div className="relative z-10 max-w-2xl">
          <p className="eyebrow mb-3">Centro de operaciones / Hoy</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-[-0.04em] text-white">
            El taller, bajo control.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Una vista en tiempo real de cada vehículo, cada diagnóstico y cada entrega pendiente.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/escanear" className="primary-button">
              <Plus className="h-4 w-4" /> Registrar ingreso
            </Link>
            <Link href="/ordenes" className="secondary-button">
              <Activity className="h-4 w-4" /> Abrir tablero
            </Link>
          </div>
        </div>
        <div className="command-orbit" aria-hidden="true">
          <div className="orbit-ring orbit-ring-one" />
          <div className="orbit-ring orbit-ring-two" />
          <div className="orbit-core"><WrenchMark /></div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="En reparación" value={inProgress.length} icon={<Activity />} tone="blue" note="Trabajo activo" />
        <Metric label="Esperando piezas" value={waitingParts.length} icon={<TriangleAlert />} tone="violet" note="Requiere seguimiento" />
        <Metric label="Listos para entregar" value={ready.length} icon={<CheckCircle2 />} tone="green" note="Próximo paso: retiro" />
        <Metric label="Vehículos activos" value={activeOrders.length} icon={<Car />} tone="amber" note="En el circuito" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-5">
        <section className="surface rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-5 border-b border-white/[0.07]">
            <div>
              <p className="eyebrow mb-1">Actividad prioritaria</p>
              <h2 className="text-lg font-black text-white">Órdenes que necesitan atención</h2>
            </div>
            <Link href="/ordenes" className="icon-link"><ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          {loading ? (
            <div className="empty-state">Sincronizando operaciones...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">Todavía no hay órdenes registradas.</div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {orders.slice(0, 6).map((order) => {
                const status = STATUS_LABELS[order.status];
                return (
                  <Link key={order.id} href={`/ordenes/${order.id}`} className="activity-row">
                    <div className="order-index">#{String(order.orderNumber).padStart(4, '0')}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{order.vehicle.brand} {order.vehicle.model}</p>
                      <p className="mt-1 text-xs text-slate-500 truncate">{order.description || 'Sin descripción'} · {order.vehicle.client?.name || 'Consumidor final'}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <span className={`status-pill ${status?.color}`}>{status?.label}</span>
                      <p className="mt-1 text-[10px] text-slate-600">{formatDate(order.updatedAt)}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-600" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center gap-2 text-amber-300"><Sparkles className="h-4 w-4" /><span className="eyebrow text-amber-300">Acceso rápido</span></div>
            <h3 className="mt-3 text-xl font-black text-white">Recepción express</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">Busca una patente, identifica al cliente y abre una orden en menos de un minuto.</p>
            <Link href="/escanear" className="mt-5 flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-3 text-xs font-bold text-amber-200 hover:bg-amber-400/15">
              <span><QrCode className="mr-2 inline h-4 w-4" /> Escanear vehículo</span><ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="surface rounded-2xl p-5">
            <p className="eyebrow mb-4">Ritmo del taller</p>
            <div className="flex items-end gap-2"><span className="text-4xl font-black text-white">{activeOrders.length}</span><span className="mb-1 text-xs text-slate-500">órdenes abiertas</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400" style={{ width: `${Math.min(100, activeOrders.length * 16 + 12)}%` }} /></div>
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><Timer className="h-3.5 w-3.5 text-amber-300" /> Actualizado con la última sincronización</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, icon, tone, note }: { label: string; value: number; icon: React.ReactNode; tone: string; note: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><p className="mt-5 text-xs font-semibold text-slate-400">{label}</p><p className="mt-1 text-3xl font-black tracking-tight text-white">{value}</p><p className="mt-1 text-[10px] text-slate-600">{note}</p></div>;
}

function WrenchMark() {
  return <div className="text-amber-300"><Car className="h-10 w-10" /></div>;
}
