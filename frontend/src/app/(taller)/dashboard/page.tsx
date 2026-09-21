'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ArrowUpRight,
  Car,
} from 'lucide-react';
import { ordersService } from '../../../services/orders.service';
import { WorkOrder } from '../../../types';
import { STATUS_LABELS, formatDate } from '../../../lib/utils';

export default function DashboardPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await ordersService.getAll();
        setOrders(data);
      } catch (err) {
        console.error('Error cargando órdenes para dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const inProgressCount = orders.filter((o) => o.status === 'IN_PROGRESS').length;
  const waitingPartsCount = orders.filter((o) => o.status === 'WAITING_PARTS').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Panel de Control del Taller
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Resumen operativo en tiempo real de vehículos y órdenes de trabajo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/escanear"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <QrCode className="w-4 h-4" /> Escanear QR / Patente
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              En Reparación
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {loading ? '-' : inProgressCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Vehículos en elevador o banco</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Esperando Repuestos
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {loading ? '-' : waitingPartsCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Esperando entrega de proveedores</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Listos para Entrega
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {loading ? '-' : readyCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Notificados para retiro</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ingresados Nuevos
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {loading ? '-' : pendingCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pendientes de diagnóstico inicial</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Órdenes de Trabajo Activas</h2>
            <p className="text-xs text-slate-400">Últimos vehículos ingresados al taller</p>
          </div>
          <Link
            href="/ordenes"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Ver Tablero Kanban <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Cargando datos...</div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No hay órdenes registradas. Dirígete a Recepción & Escáner para dar de alta la primera.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Orden #</th>
                  <th className="px-4 py-3 font-semibold">Vehículo / Patente</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Fecha Ingreso</th>
                  <th className="px-4 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.slice(0, 6).map((order) => {
                  const statusInfo = STATUS_LABELS[order.status] || {
                    label: order.status,
                    color: 'bg-slate-800 text-slate-300',
                  };
                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">#{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-white">
                          {order.vehicle.brand} {order.vehicle.model}
                        </span>
                        <span className="block text-xs font-mono text-indigo-400">
                          {order.vehicle.plate}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {order.vehicle.client?.name || 'Consumidor Final'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/ordenes/${order.id}`}
                          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20"
                        >
                          Ver Detalle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
