'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Plus, Phone, Mail, Car, QrCode, X } from 'lucide-react';
import { clientsService } from '../../../services/clients.service';
import { Client } from '../../../types';

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Formulario nuevo cliente
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [createAccount, setCreateAccount] = useState(true);
  const [formError, setFormError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');

  const fetchClients = async (query?: string) => {
    try {
      const data = await clientsService.getAll(query);
      setClients(data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(search);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const created = await clientsService.create({
        name,
        phone,
        email: email || undefined,
        documentId: documentId || undefined,
        address: address || undefined,
        createAccount,
      });
      setInviteUrl(created.inviteUrl || '');
      setShowModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setDocumentId('');
      setAddress('');
      fetchClients();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-500" /> Directorio de Clientes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestión de propietarios de vehículos y datos de contacto
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="primary-button cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o DNI..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/[0.1] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
        >
          Buscar
        </button>
      </form>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Cargando clientes...</div>
      ) : clients.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          No se encontraron clientes registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
            >
              <div>
                <h3 className="font-bold text-white text-base">{c.name}</h3>
                {c.documentId && (
                  <span className="text-[11px] font-mono text-slate-400">DNI: {c.documentId}</span>
                )}
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{c.phone}</span>
                </div>
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{c.email}</span>
                  </div>
                )}
              </div>

              {/* Vehículos del Cliente */}
              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-indigo-400" />
                  Vehículos Asociados ({c.vehicles?.length || 0}):
                </p>
                {c.vehicles && c.vehicles.length > 0 ? (
                  <div className="space-y-1.5">
                    {c.vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <div>
                          <span className="font-medium text-white">
                            {v.brand} {v.model}
                          </span>
                          <span className="ml-2 font-mono text-amber-300 font-semibold text-[11px]">
                            {v.plate}
                          </span>
                        </div>
                        <Link
                          href={`/portal/${v.qrToken}`}
                          target="_blank"
                          title="Ver Ficha y QR"
                          className="p-1 text-slate-400 hover:text-indigo-400"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">Sin vehículos registrados</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Registrar Nuevo Cliente</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3">
              {formError && <p className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-300">{formError}</p>}
              {inviteUrl && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"><p className="font-bold">Cliente guardado. Compartí este enlace de activación:</p><div className="mt-2 break-all rounded-lg bg-black/20 p-2 text-xs">{inviteUrl}</div><button onClick={() => navigator.clipboard.writeText(inviteUrl)} className="mt-3 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-bold">Copiar enlace para WhatsApp</button></div>}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                Crear acceso al portal y enviar invitación
              </label>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">DNI / Documento (Opcional)</label>
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Dirección (Opcional)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-lg"
                >
                  {saving ? 'Guardando...' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
