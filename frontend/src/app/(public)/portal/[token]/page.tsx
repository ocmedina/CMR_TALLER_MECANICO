'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Car,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Phone,
  MessageSquare,
  QrCode,
  Calendar,
} from 'lucide-react';
import { vehiclesService } from '../../../../services/vehicles.service';
import { Vehicle, OrderStatus } from '../../../../types';
import { STATUS_LABELS, formatCurrency, formatDate } from '../../../../lib/utils';
import { QRCodeCanvas } from 'qrcode.react';

export default function PortalClientePage() {
  const params = useParams();
  const token = params?.token as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVehicleData() {
      if (!token) return;
      try {
        const data = await vehiclesService.getByQrToken(token);
        setVehicle(data);
      } catch (err: any) {
        setError('No pudimos encontrar la ficha de este vehículo con el código QR provisto.');
      } finally {
        setLoading(false);
      }
    }
    loadVehicleData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Cargando ficha de seguimiento...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Código QR No Válido</h2>
          <p className="text-sm text-slate-400">{error || 'El vehículo no fue encontrado.'}</p>
        </div>
      </div>
    );
  }

  // Última orden activa
  const latestOrder = vehicle.workOrders && vehicle.workOrders.length > 0 ? vehicle.workOrders[0] : null;

  const steps: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING', label: 'Ingresado' },
    { status: 'IN_PROGRESS', label: 'En Taller' },
    { status: 'WAITING_PARTS', label: 'Repuestos' },
    { status: 'READY', label: 'Listo' },
    { status: 'DELIVERED', label: 'Entregado' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    return steps.findIndex((s) => s.status === status);
  };

  const currentStepIdx = latestOrder ? getStepIndex(latestOrder.status) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 pb-16">
      {/* Header Público */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white">Portal de Seguimiento</span>
              <span className="block text-[11px] text-slate-400">Taller Mecánico Oficial</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Ficha Verificada
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Banner Auto */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {vehicle.brand} {vehicle.model}
              </h1>
              <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-bold text-sm border border-indigo-500/30">
                {vehicle.plate}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Propietario:{' '}
              <span className="text-slate-200 font-medium">{vehicle.client?.name}</span> • Año:{' '}
              {vehicle.year || 'S/A'} {vehicle.color && `• Color: ${vehicle.color}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-lg">
              <QRCodeCanvas
                value={typeof window !== 'undefined' ? window.location.href : `https://taller.com/portal/${token}`}
                size={64}
              />
            </div>
          </div>
        </div>

        {/* Estado Operativo Actual (Stepper) */}
        {latestOrder ? (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Estado de la Reparación</h3>
                <p className="text-xs text-slate-400">Orden de trabajo #{latestOrder.orderNumber}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  STATUS_LABELS[latestOrder.status]?.color
                }`}
              >
                {STATUS_LABELS[latestOrder.status]?.label}
              </span>
            </div>

            {/* Stepper visual */}
            <div className="relative flex items-center justify-between max-w-2xl mx-auto pt-4 pb-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 w-full z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 transition-all duration-500 z-0"
                style={{
                  width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30 shadow-lg'
                          : isPassed
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-2 ${
                        isCurrent ? 'text-indigo-400' : isPassed ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Diagnóstico */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-400 mb-1">Trabajo en curso:</p>
              <p className="text-sm text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                {latestOrder.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-slate-400 text-sm">
            Este vehículo no posee órdenes activas en este momento.
          </div>
        )}

        {/* Repuestos Instalados y Desglose */}
        {latestOrder && latestOrder.items && latestOrder.items.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-400" /> Repuestos y Servicios Cargados
            </h3>
            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              {latestOrder.items.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-white block">{item.description}</span>
                    <span className="text-slate-500 text-[10px]">
                      {item.type === 'PART' ? 'Repuesto nuevo' : 'Servicio / Mano de obra'} • Cant:{' '}
                      {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galería de Evidencias Fotográficas */}
        {latestOrder && latestOrder.media && latestOrder.media.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Evidencias Fotográficas de la Reparación
            </h3>
            <p className="text-xs text-slate-400">
              Fotografías tomadas por el mecánico durante el desarme e instalación de piezas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestOrder.media.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                >
                  <div className="h-52 w-full relative">
                    <img
                      src={m.url}
                      alt={m.caption || 'Evidencia fotográfica'}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white backdrop-blur">
                      {m.type === 'DISASSEMBLY'
                        ? 'Pieza Desgastada'
                        : m.type === 'NEW_PART'
                        ? 'Pieza Nueva Instalada'
                        : m.type}
                    </span>
                  </div>
                  {m.caption && (
                    <div className="p-3 text-xs text-slate-300 font-medium">{m.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soporte y WhatsApp con el Taller */}
        <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-base">¿Tienes alguna duda sobre tu vehículo?</h4>
            <p className="text-xs text-indigo-300 mt-0.5">
              Contacta directamente con la recepción del taller indicando la patente {vehicle.plate}
            </p>
          </div>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hola! Consulto por el estado de mi auto ${vehicle.brand} ${vehicle.model} (Patente: ${vehicle.plate})`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" /> Consultar por WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
