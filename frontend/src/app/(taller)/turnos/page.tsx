'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock3, Plus, UserRound, X } from 'lucide-react';
import { appointmentsService } from '../../../services/appointments.service';
import { clientsService } from '../../../services/clients.service';
import { Appointment, AppointmentStatus, Client } from '../../../types';

const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Pendiente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'No asistió',
};

const statusStyles: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  CONFIRMED: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  COMPLETED: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  CANCELLED: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  NO_SHOW: 'bg-slate-400/10 text-slate-400 border-slate-400/20',
};

export default function TurnosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState({ time: '09:00', clientId: '', vehicleId: '', reason: '', durationMinutes: 60 });

  const load = async () => {
    setLoading(true);
    try {
      const start = new Date(`${date}T00:00:00`).toISOString();
      const end = new Date(`${date}T23:59:59`).toISOString();
      const [appointmentsData, clientsData] = await Promise.all([
        appointmentsService.getAll(start, end),
        clientsService.getAll(),
      ]);
      setAppointments(appointmentsData);
      setClients(clientsData);
    } catch (err) {
      console.error('Error cargando agenda:', err);
      setError('No se pudo cargar la agenda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [date]);

  const selectedClient = clients.find((client) => client.id === form.clientId);
  const availableVehicles = selectedClient?.vehicles || [];
  const dayLabel = useMemo(() => new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }), [date]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await appointmentsService.create({
        scheduledAt: new Date(`${date}T${form.time}:00`).toISOString(),
        durationMinutes: form.durationMinutes,
        clientId: form.clientId,
        vehicleId: form.vehicleId,
        reason: form.reason,
      });
      setShowForm(false);
      setForm({ time: '09:00', clientId: '', vehicleId: '', reason: '', durationMinutes: 60 });
      await load();
    } catch (err) {
      console.error('Error creando turno:', err);
      setError('No se pudo crear el turno. Revisá los datos seleccionados.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const updated = await appointmentsService.updateStatus(id, status);
      setAppointments((current) => current.map((item) => item.id === id ? updated : item));
    } catch (err) {
      console.error('Error actualizando turno:', err);
      setError('No se pudo actualizar el turno.');
    }
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-2">Planificación / Agenda</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Turnos del taller</h1>
          <p className="mt-2 text-sm text-slate-400">Organizá las recepciones y anticipá la carga de trabajo del día.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="primary-button"><Plus className="h-4 w-4" /> Nuevo turno</button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="surface flex items-center gap-3 rounded-2xl p-2">
          <CalendarDays className="ml-2 h-5 w-5 text-amber-300" />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="bg-transparent px-2 py-2 text-sm font-bold text-slate-200 outline-none" />
        </div>
        <p className="text-sm capitalize text-slate-400">{dayLabel} · {appointments.length} turnos</p>
      </div>

      {error && <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <section className="surface overflow-hidden rounded-2xl">
        {loading ? <div className="empty-state">Cargando agenda...</div> : appointments.length === 0 ? (
          <div className="empty-state"><CalendarDays className="mx-auto mb-3 h-8 w-8 text-slate-600" /><p>No hay turnos para este día.</p><button onClick={() => setShowForm(true)} className="mt-4 text-xs font-bold text-amber-300">Agendar el primero</button></div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="flex flex-col gap-4 p-5 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center">
                <div className="flex w-28 shrink-0 items-center gap-2 text-lg font-black text-white"><Clock3 className="h-4 w-4 text-amber-300" />{new Date(appointment.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="min-w-0 flex-1"><h2 className="font-bold text-white">{appointment.client.name}</h2><p className="mt-1 text-xs text-slate-400">{appointment.vehicle.brand} {appointment.vehicle.model} · <span className="font-mono text-amber-300">{appointment.vehicle.plate}</span></p><p className="mt-2 text-sm text-slate-300">{appointment.reason}</p></div>
                <div className="flex items-center gap-3"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[appointment.status]}`}>{statusLabels[appointment.status]}</span><select value={appointment.status} onChange={(event) => updateStatus(appointment.id, event.target.value as AppointmentStatus)} className="rounded-lg border border-white/[0.1] bg-slate-900 px-2 py-2 text-xs text-slate-300 outline-none"><option value="SCHEDULED">Pendiente</option><option value="CONFIRMED">Confirmado</option><option value="COMPLETED">Completado</option><option value="CANCELLED">Cancelado</option><option value="NO_SHOW">No asistió</option></select></div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"><form onSubmit={handleSubmit} className="surface w-full max-w-lg space-y-5 rounded-3xl p-6"><div className="flex items-center justify-between"><div><p className="eyebrow">Nueva reserva</p><h2 className="mt-1 text-xl font-black text-white">Agendar recepción</h2></div><button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X /></button></div><div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate-400">Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required className="form-input mt-1" /></label><label className="text-xs text-slate-400">Hora<input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required className="form-input mt-1" /></label></div><label className="block text-xs text-slate-400">Cliente<select value={form.clientId} onChange={(event) => setForm({ ...form, clientId: event.target.value, vehicleId: '' })} required className="form-input mt-1"><option value="">Seleccionar cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label><label className="block text-xs text-slate-400">Vehículo<select value={form.vehicleId} onChange={(event) => setForm({ ...form, vehicleId: event.target.value })} required disabled={!form.clientId} className="form-input mt-1"><option value="">Seleccionar vehículo</option>{availableVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} · {vehicle.plate}</option>)}</select></label><label className="block text-xs text-slate-400">Motivo<input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required minLength={3} placeholder="Ej. Service de 40.000 km" className="form-input mt-1" /></label><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="secondary-button">Cancelar</button><button type="submit" disabled={saving} className="primary-button">{saving ? 'Guardando...' : <><Check className="h-4 w-4" /> Confirmar turno</>}</button></div></form></div>}
    </div>
  );
}
