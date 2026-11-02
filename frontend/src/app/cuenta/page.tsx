'use client';

import { useEffect, useState } from 'react';
import { Car, Check, LogOut, UserRound } from 'lucide-react';
import { api } from '../../services/api';
import { authService } from '../../services/auth.service';

type Profile = {
  name: string;
  email: string;
  client?: {
    phone: string;
    documentId?: string;
    address?: string;
    vehicles: Array<{ id: string; plate: string; brand: string; model: string; year?: number; workOrders: Array<{ id: string; orderNumber: number; status: string; description: string; budgetStatus: string; budgetRejectedReason?: string | null; updatedAt: string; items: Array<{ id: string; type: string; description: string; quantity: number; unitPrice: number; subtotal: number }> }> }>;
  };
};

export default function CuentaPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/profile')
      .then((response) => setProfile(response.data.data))
      .catch(() => setError('No se pudo cargar tu cuenta.'));
  }, []);

  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await api.patch('/auth/profile', Object.fromEntries(form.entries()));
      setProfile((current) => current ? { ...current, ...response.data.data } : current);
      const refreshed = await api.get('/auth/profile');
      setProfile(refreshed.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo actualizar el perfil.');
    } finally { setSaving(false); }
  };

  const approve = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/work-orders/${id}/budget`, { status });
      const refreshed = await api.get('/auth/profile');
      setProfile(refreshed.data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'No se pudo actualizar el presupuesto.'); }
  };

  return (
    <main className="min-h-screen bg-[#08111f] p-5 text-slate-100 md:p-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div><p className="eyebrow mb-2">Portal del cliente</p><h1 className="text-3xl font-black text-white">Mi cuenta</h1></div>
          <button onClick={() => authService.logout()} className="secondary-button"><LogOut className="h-4 w-4" /> Salir</button>
        </header>
        {error && <p className="rounded-xl bg-rose-500/10 p-4 text-rose-300">{error}</p>}
        {profile && <><section className="surface rounded-2xl p-6"><div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-amber-300" /><div><h2 className="font-bold text-white">{profile.name}</h2><p className="text-sm text-slate-400">{profile.email}</p></div></div><form onSubmit={updateProfile} className="mt-5 grid gap-3 sm:grid-cols-2"><Field name="name" label="Nombre" defaultValue={profile.name} /><Field name="phone" label="Teléfono" defaultValue={profile.client?.phone || ''} /><Field name="documentId" label="Documento" defaultValue={profile.client?.documentId || ''} /><Field name="address" label="Dirección" defaultValue={profile.client?.address || ''} /><button disabled={saving} className="primary-button sm:col-span-2">{saving ? 'Guardando...' : 'Guardar perfil'}</button></form></section><section className="surface rounded-2xl p-6"><h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Car className="h-5 w-5 text-amber-300" /> Mis vehículos y órdenes</h2>{profile.client?.vehicles.length ? <div className="space-y-4">{profile.client.vehicles.map((vehicle) => <div key={vehicle.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="font-bold text-white">{vehicle.brand} {vehicle.model} <span className="ml-2 font-mono text-sm text-amber-300">{vehicle.plate}</span></p>{vehicle.workOrders.length > 0 && <div className="mt-3 space-y-3">{vehicle.workOrders.map((order) => { const total = order.items.reduce((sum, item) => sum + item.subtotal, 0); return <div key={order.id} className="rounded-lg bg-black/20 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><span className="font-bold text-white">Orden #{order.orderNumber}</span><span className="flex-1 text-slate-300">{order.description}</span><span className="text-xs text-amber-300">{order.status}</span></div><div className="mt-3 border-t border-white/10 pt-3"><div className="flex items-center justify-between"><span className="font-semibold text-slate-300">Presupuesto</span><span className="font-bold text-white">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>{order.items.length > 0 && <div className="mt-2 space-y-1 text-xs text-slate-400">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-3"><span>{item.quantity} x {item.description}</span><span>${item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>)}</div>}<div className="mt-3 flex flex-wrap items-center gap-3"><span className={`text-xs font-semibold ${order.budgetStatus === 'APPROVED' ? 'text-emerald-300' : order.budgetStatus === 'REJECTED' ? 'text-rose-300' : 'text-amber-300'}`}>{order.budgetStatus === 'APPROVED' ? 'Aprobado' : order.budgetStatus === 'REJECTED' ? 'Rechazado' : 'Pendiente de aprobación'}</span>{order.budgetRejectedReason && <span className="text-xs text-rose-300">{order.budgetRejectedReason}</span>}{order.budgetStatus === 'PENDING' && <div className="ml-auto flex gap-2"><button onClick={() => approve(order.id, 'APPROVED')} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300" title="Aprobar presupuesto"><Check className="mr-1 inline h-4 w-4" /> Aprobar</button><button onClick={() => approve(order.id, 'REJECTED')} className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300">Rechazar</button></div>}</div></div></div>; })}</div>}</div>)}</div> : <p className="text-sm text-slate-400">Todavía no tienes vehículos asociados.</p>}</section></>}
      </div>
    </main>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return <label className="text-xs text-slate-400">{label}<input name={name} defaultValue={defaultValue} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" /></label>;
}
