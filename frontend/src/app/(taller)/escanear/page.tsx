'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Search,
  PlusCircle,
  Car,
  User,
  Check,
  AlertCircle,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { vehiclesService } from '../../../services/vehicles.service';
import { clientsService } from '../../../services/clients.service';
import { ordersService } from '../../../services/orders.service';
import { Vehicle, Client } from '../../../types';

export default function EscanearPage() {
  const router = useRouter();

  const [plateQuery, setPlateQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario de Nueva Orden (si auto existe)
  const [km, setKm] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Formulario Alta Express (si auto no existe)
  const [showExpressModal, setShowExpressModal] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newColor, setNewColor] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [registering, setRegistering] = useState(false);

  // Búsqueda por patente
  const handleSearchPlate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!plateQuery.trim()) return;

    setSearching(true);
    setNotFound(false);
    setErrorMsg(null);
    setVehicle(null);

    try {
      const data = await vehiclesService.getByPlate(plateQuery);
      setVehicle(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setErrorMsg('Error al consultar vehículo. Verifica la conexión.');
      }
    } finally {
      setSearching(false);
    }
  };

  // Crear Orden de Trabajo
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    setCreatingOrder(true);
    try {
      const newOrder = await ordersService.create({
        vehicleId: vehicle.id,
        currentKm: km,
        description,
      });
      router.push(`/ordenes/${newOrder.id}`);
    } catch (err: any) {
      setErrorMsg('Error creando la orden de trabajo.');
    } finally {
      setCreatingOrder(false);
    }
  };

  // Alta Express
  const handleExpressRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setErrorMsg(null);

    try {
      // 1. Crear o buscar cliente
      const newClient = await clientsService.create({
        name: clientName,
        phone: clientPhone,
        email: clientEmail || undefined,
      });

      // 2. Crear vehículo
      const newVeh = await vehiclesService.create({
        plate: plateQuery,
        brand: newBrand,
        model: newModel,
        year: newYear || undefined,
        color: newColor || undefined,
        clientId: newClient.id,
      });

      setVehicle(newVeh);
      setShowExpressModal(false);
      setNotFound(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error en el alta express');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <QrCode className="w-8 h-8 text-indigo-500" /> Recepción de Vehículo & Escáner
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Escanea el código QR del parabrisas o escribe la patente para buscar o dar de alta al auto
        </p>
      </div>

      {/* Buscador / Escáner Input */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur">
        <form onSubmit={handleSearchPlate} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Patente / Matrícula o Código Token
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
                placeholder="Ej: AF123JK o AD789PO"
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-base font-bold text-white tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              {searching ? 'Buscando...' : 'Buscar Auto'}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
          </div>
        )}
      </div>

      {/* Caso: Auto No Encontrado -> Sugerir Alta Express */}
      {notFound && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-200 animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">
                Vehículo patente {plateQuery} no registrado
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Este auto ingresa por primera vez a nuestro taller. Realiza un alta express en 30 segundos.
              </p>
              <button
                onClick={() => setShowExpressModal(true)}
                className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Abrir Alta Express para {plateQuery}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Caso: Auto Encontrado -> Crear Orden de Trabajo */}
      {vehicle && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/30 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono font-bold text-sm">
                  {vehicle.plate}
                </span>
                <h2 className="text-xl font-bold text-white">
                  {vehicle.brand} {vehicle.model}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cliente:{' '}
                <span className="text-slate-200 font-medium">{vehicle.client?.name}</span>{' '}
                {vehicle.client?.phone && `(${vehicle.client.phone})`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/portal/${vehicle.qrToken}`)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                Ficha QR
              </button>
            </div>
          </div>

          {/* Formulario de Creación de Orden */}
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <h3 className="text-sm font-bold text-white">Generar Orden de Trabajo de Ingreso:</h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Kilometraje Actual al Ingresar:
              </label>
              <input
                type="number"
                required
                value={km || ''}
                onChange={(e) => setKm(parseInt(e.target.value) || 0)}
                placeholder="Ej: 45000"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Falla reportada por el cliente / Motivo de ingreso:
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Ruidos en pastillas de freno al doblar a la derecha. Solicita cambio de aceite y filtro."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={creatingOrder}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {creatingOrder ? 'Creando orden...' : 'Crear Orden e Ingresar al Taller'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Modal Alta Express */}
      {showExpressModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-400" /> Alta Express de Vehículo y Cliente
              </h3>
              <button
                onClick={() => setShowExpressModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpressRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Patente</label>
                  <input
                    type="text"
                    disabled
                    value={plateQuery}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-bold text-indigo-400 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Año</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="Toyota"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    placeholder="Corolla"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-2">Datos del Cliente:</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Nombre y Apellido del Cliente"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="tel"
                      required
                      placeholder="Teléfono / WhatsApp"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="email"
                      placeholder="Email (opcional)"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpressModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow"
                >
                  {registering ? 'Registrando...' : 'Completar Alta Express'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
