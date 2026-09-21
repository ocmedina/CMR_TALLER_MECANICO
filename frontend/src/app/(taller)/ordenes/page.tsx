'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Plus,
  Car,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { ordersService } from '../../../services/orders.service';
import { WorkOrder, OrderStatus } from '../../../types';
import { STATUS_LABELS } from '../../../lib/utils';

const COLUMNS: { status: OrderStatus; label: string; accentColor: string }[] = [
  { status: 'PENDING', label: 'Ingresado', accentColor: 'border-amber-500' },
  { status: 'IN_PROGRESS', label: 'En Reparación', accentColor: 'border-blue-500' },
  { status: 'WAITING_PARTS', label: 'Esperando Repuestos', accentColor: 'border-purple-500' },
  { status: 'READY', label: 'Listo para Entrega', accentColor: 'border-emerald-500' },
  { status: 'DELIVERED', label: 'Entregado', accentColor: 'border-slate-600' },
];

export default function OrdenesPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const fetchOrders = async () => {
    try {
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      // Actualizar estado local
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Error al cambiar de estado:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-indigo-500" /> Tablero de Órdenes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Control de flujo operativo estilo Kanban y seguimiento de reparaciones
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tabla
            </button>
          </div>

          <Link
            href="/escanear"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Nueva Orden
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Cargando tablero...</div>
      ) : viewMode === 'kanban' ? (
        /* Tablero Kanban */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnOrders = orders.filter((o) => o.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl flex flex-col max-h-[80vh] backdrop-blur-md"
              >
                {/* Header Columna */}
                <div
                  className={`p-3.5 border-b border-slate-800 flex items-center justify-between border-t-4 ${col.accentColor} rounded-t-2xl`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{col.label}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                    {columnOrders.length}
                  </span>
                </div>

                {/* Lista de Tarjetas */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[220px]">
                  {columnOrders.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-xl">
                      Sin órdenes
                    </div>
                  ) : (
                    columnOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-indigo-500/50 transition-all shadow-md group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-indigo-400">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded">
                            {order.vehicle.plate}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-white leading-tight">
                          {order.vehicle.brand} {order.vehicle.model}
                        </h4>

                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {order.description}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">
                            {order.vehicle.client?.name || 'Cliente'}
                          </span>

                          <Link
                            href={`/ordenes/${order.id}`}
                            className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1"
                          >
                            Detalle <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* Controles de cambio de etapa */}
                        <div className="mt-3 pt-2 border-t border-slate-800/40 flex items-center gap-1">
                          <label className="text-[10px] text-slate-500">Mover a:</label>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className="text-[11px] bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                          >
                            <option value="PENDING">Ingresado</option>
                            <option value="IN_PROGRESS">En Reparación</option>
                            <option value="WAITING_PARTS">Esperando Repuestos</option>
                            <option value="READY">Listo</option>
                            <option value="DELIVERED">Entregado</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista Tabla */
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3"># Orden</th>
                <th className="px-4 py-3">Vehículo</th>
                <th className="px-4 py-3">Patente</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Km</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-bold text-white">#{order.orderNumber}</td>
                  <td className="px-4 py-3 font-medium">
                    {order.vehicle.brand} {order.vehicle.model}
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-400">{order.vehicle.plate}</td>
                  <td className="px-4 py-3">{order.vehicle.client?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs border ${
                        STATUS_LABELS[order.status]?.color
                      }`}
                    >
                      {STATUS_LABELS[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">{order.currentKm.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/ordenes/${order.id}`}
                      className="text-xs font-semibold text-indigo-400 hover:underline"
                    >
                      Ver Ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
