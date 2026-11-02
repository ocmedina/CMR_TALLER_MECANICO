'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2, UserRound, X } from 'lucide-react';
import { usersService, ManagedUser, UserPayload } from '../../../services/users.service';
import { Role } from '../../../types';

const emptyForm: UserPayload = { name: '', email: '', password: '', role: 'MECHANIC', active: true };

export default function UsuariosPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<UserPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');

  const load = async (term?: string) => {
    setLoading(true);
    try { setUsers(await usersService.getAll(term)); }
    catch (err: any) { setError(err.response?.data?.message || 'No se pudieron cargar los usuarios'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };

  const openEdit = (user: ManagedUser) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      password: '',
      phone: user.client?.phone,
      documentId: user.client?.documentId,
      address: user.client?.address,
    });
    setError('');
    setOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editingId) await usersService.update(editingId, payload);
      else {
        const created = await usersService.create(payload as UserPayload);
        setInviteUrl(created.inviteUrl || '');
      }
      setOpen(false);
      await load(search);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo guardar el usuario');
    } finally { setSaving(false); }
  };

  const remove = async (user: ManagedUser) => {
    if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;
    try { await usersService.remove(user.id); await load(search); }
    catch (err: any) { setError(err.response?.data?.message || 'No se pudo eliminar el usuario'); }
  };

  const set = (key: keyof UserPayload, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Administración</p>
          <h1 className="text-3xl font-black text-white">Gestión de usuarios</h1>
          <p className="mt-1 text-sm text-slate-400">Administra mecánicos y cuentas de clientes.</p>
        </div>
        <button onClick={openCreate} className="primary-button"><Plus className="h-4 w-4" /> Nuevo usuario</button>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</div>}
      {inviteUrl && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"><p className="font-bold">Cliente creado. Compartí este enlace por WhatsApp:</p><div className="mt-2 break-all rounded-lg bg-black/20 p-2 text-xs">{inviteUrl}</div><button onClick={() => navigator.clipboard.writeText(inviteUrl)} className="mt-3 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold">Copiar enlace</button></div>}

      <form onSubmit={(event) => { event.preventDefault(); load(search); }} className="flex max-w-md gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo" className="w-full rounded-xl border border-white/10 bg-slate-900 px-10 py-2 text-sm text-white" />
        </div>
        <button className="secondary-button" type="submit">Buscar</button>
      </form>

      <div className="surface overflow-hidden rounded-2xl">
        {loading ? <div className="empty-state">Cargando usuarios...</div> : (
          <div className="divide-y divide-white/[0.07]">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10 text-amber-300"><UserRound className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{user.name}</p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <span className="status-pill bg-slate-800 text-slate-300">{({ MECHANIC: 'Mecánico', RECEPTIONIST: 'Recepcionista', WORKSHOP_MANAGER: 'Jefe de taller', CLIENT: 'Cliente', ADMIN: 'Administrador' } as Record<Role, string>)[user.role]}</span>
                <span className={`text-xs ${user.active ? 'text-emerald-300' : 'text-rose-300'}`}>{user.active ? 'Activo' : 'Inactivo'}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(user)} className="icon-link" title="Editar"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(user)} className="icon-link text-rose-300" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="empty-state">No hay usuarios registrados.</div>}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={save} className="surface w-full max-w-lg space-y-4 rounded-2xl p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-white">{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2><button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-slate-400" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre completo" value={form.name} onChange={(value) => set('name', value)} required />
              <Field label="Correo" type="email" value={form.email} onChange={(value) => set('email', value)} required />
              {form.role !== 'CLIENT' && <Field label={editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'} type="password" value={form.password || ''} onChange={(value) => set('password', value)} required={!editingId} />}
              <label className="text-xs text-slate-400">Rol<select value={form.role} onChange={(event) => set('role', event.target.value as Role)} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"><option value="MECHANIC">Mecánico</option><option value="RECEPTIONIST">Recepcionista</option><option value="WORKSHOP_MANAGER">Jefe de taller</option><option value="CLIENT">Cliente</option><option value="ADMIN">Administrador</option></select></label>
              {form.role === 'CLIENT' && <><Field label="Teléfono" value={form.phone || ''} onChange={(value) => set('phone', value)} required /><Field label="Documento" value={form.documentId || ''} onChange={(value) => set('documentId', value)} /><Field label="Dirección" value={form.address || ''} onChange={(value) => set('address', value)} /></>}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.active !== false} onChange={(event) => set('active', event.target.checked)} /> Cuenta activa</label>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="secondary-button">Cancelar</button><button disabled={saving} className="primary-button">{saving ? 'Guardando...' : 'Guardar'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="text-xs text-slate-400">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white" /></label>;
}
