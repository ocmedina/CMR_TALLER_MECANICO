'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Wrench,
  Car,
  User,
  Plus,
  Image as ImageIcon,
  DollarSign,
  QrCode,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { ordersService } from '../../../../services/orders.service';
import { mediaService } from '../../../../services/media.service';
import { WorkOrder, OrderStatus, ItemType, MediaType } from '../../../../types';
import { STATUS_LABELS, formatCurrency, formatDate } from '../../../../lib/utils';

export default function OrdenDetallePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulario nuevo item
  const [itemType, setItemType] = useState<ItemType>('PART');
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(0);
  const [addingItem, setAddingItem] = useState(false);

  // Formulario nueva foto
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoType, setPhotoType] = useState<MediaType>('DISASSEMBLY');
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchOrder = async () => {
    try {
      const data = await ordersService.getById(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Error al cargar la orden:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
      await ordersService.updateStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !itemDesc) return;
    setAddingItem(true);
    try {
      await ordersService.addItem(order.id, {
        type: itemType,
        description: itemDesc,
        quantity: itemQty,
        unitPrice: itemPrice,
      });
      setItemDesc('');
      setItemQty(1);
      setItemPrice(0);
      fetchOrder();
    } catch (err) {
      console.error('Error al añadir item:', err);
    } finally {
      setAddingItem(false);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !photoUrl) return;
    setUploadingPhoto(true);
    try {
      await mediaService.uploadDirectUrl({
        workOrderId: order.id,
        directUrl: photoUrl,
        type: photoType,
        caption: photoCaption || undefined,
      });
      setPhotoUrl('');
      setPhotoCaption('');
      fetchOrder();
    } catch (err) {
      console.error('Error al subir evidencia:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Cargando ficha de orden...</div>;
  }

  if (!order) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p>Orden no encontrada.</p>
        <Link href="/ordenes" className="text-indigo-400 mt-2 inline-block">
          Volver a órdenes
        </Link>
      </div>
    );
  }

  const totalCost = order.items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/ordenes"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Orden #{order.orderNumber}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  STATUS_LABELS[order.status]?.color
                }`}
              >
                {STATUS_LABELS[order.status]?.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingresado: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Change status & Portal link */}
        <div className="flex items-center gap-3">
          <Link
            href={`/portal/${order.vehicle.qrToken}`}
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
          >
            <QrCode className="w-4 h-4 text-indigo-400" /> Ver Portal Público Cliente
          </Link>

          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl cursor-pointer shadow-md focus:outline-none"
          >
            <option value="PENDING">Estado: Ingresado</option>
            <option value="IN_PROGRESS">Estado: En Reparación</option>
            <option value="WAITING_PARTS">Estado: Esperando Repuestos</option>
            <option value="READY">Estado: Listo para Entrega</option>
            <option value="DELIVERED">Estado: Entregado</option>
          </select>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vehículo */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Car className="w-4 h-4" /> Vehículo
          </div>
          <p className="text-lg font-bold text-white">
            {order.vehicle.brand} {order.vehicle.model} ({order.vehicle.year || 'S/A'})
          </p>
          <p className="font-mono text-indigo-400 font-semibold text-sm mt-1">
            Patente: {order.vehicle.plate}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Kilometraje de ingreso:{' '}
            <span className="text-slate-200 font-mono">{order.currentKm.toLocaleString()} km</span>
          </p>
        </div>

        {/* Cliente */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <User className="w-4 h-4" /> Propietario / Cliente
          </div>
          <p className="text-lg font-bold text-white">{order.vehicle.client?.name || 'Consumidor Final'}</p>
          <p className="text-sm text-slate-300 mt-1">{order.vehicle.client?.phone || 'Sin teléfono'}</p>
          <p className="text-xs text-slate-500 mt-1">{order.vehicle.client?.email || 'Sin correo'}</p>
        </div>

        {/* Total & Presupuesto */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
            <DollarSign className="w-4 h-4" /> Subtotal Repuestos & Mano de Obra
          </div>
          <p className="text-2xl font-extrabold text-white">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-slate-400 mt-2">
            {order.items.length} items agregados a esta orden
          </p>
          <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
            order.budgetStatus === 'APPROVED'
              ? 'bg-emerald-500/15 text-emerald-300'
              : order.budgetStatus === 'REJECTED'
                ? 'bg-rose-500/15 text-rose-300'
                : 'bg-amber-500/15 text-amber-300'
          }`}>
            Presupuesto: {order.budgetStatus === 'APPROVED' ? 'Aprobado' : order.budgetStatus === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
          </span>
        </div>
      </div>

      {/* Descripción / Motivo de ingreso */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <h3 className="text-sm font-bold text-slate-300 mb-2">Diagnóstico / Fallas Reportadas:</h3>
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
          {order.description}
        </p>
      </div>

      {/* Repuestos y Mano de Obra */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" /> Repuestos y Servicios Cargados
          </h3>
          <span className="text-sm font-bold text-indigo-400 font-mono">
            Total: {formatCurrency(totalCost)}
          </span>
        </div>

        {/* Tabla de items */}
        {order.items.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            No se han cargado repuestos ni mano de obra todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Tipo</th>
                  <th className="px-4 py-2.5">Descripción</th>
                  <th className="px-4 py-2.5 text-center">Cantidad</th>
                  <th className="px-4 py-2.5 text-right">Precio Unitario</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.type === 'PART'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}
                      >
                        {item.type === 'PART' ? 'Repuesto' : 'Mano de Obra'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-sans font-medium text-white">
                      {item.description}
                    </td>
                    <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-white">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Formulario para agregar repuesto */}
        <form
          onSubmit={handleAddItem}
          className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
        >
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Tipo</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value as ItemType)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            >
              <option value="PART">Repuesto</option>
              <option value="LABOR">Mano de Obra</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Descripción del repuesto o tarea
            </label>
            <input
              type="text"
              required
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="Ej: Filtro de aceite Bosch"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Cant.</label>
            <input
              type="number"
              min="1"
              value={itemQty}
              onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Precio Unit.</label>
            <input
              type="number"
              min="0"
              value={itemPrice}
              onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white mb-2 sm:mb-0"
            />
          </div>

          <div className="sm:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={addingItem}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {addingItem ? 'Agregando...' : 'Agregar a la Orden'}
            </button>
          </div>
        </form>
      </div>

      {/* Evidencias Fotográficas */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-400" /> Evidencias Fotográficas (Desarme y Repuestos)
        </h3>

        {order.media.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            Aún no hay fotografías adjuntadas para esta orden.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.media.map((m) => (
              <div
                key={m.id}
                className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group"
              >
                <div className="h-44 w-full relative bg-slate-900 overflow-hidden">
                  <img
                    src={m.url}
                    alt={m.caption || 'Evidencia'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur">
                    {m.type}
                  </span>
                </div>
                {m.caption && (
                  <p className="p-3 text-xs text-slate-300 font-medium">{m.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulario agregar foto */}
        <form
          onSubmit={handleAddMedia}
          className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
        >
          <h4 className="text-xs font-semibold text-slate-300">
            Adjuntar enlace o fotografía de evidencia:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="url"
              required
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://ejemplo.com/foto-pieza.jpg"
              className="sm:col-span-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
            <select
              value={photoType}
              onChange={(e) => setPhotoType(e.target.value as MediaType)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            >
              <option value="DISASSEMBLY">Pieza Dañada / Desarme</option>
              <option value="NEW_PART">Pieza Nueva Instalada</option>
              <option value="INITIAL_STATE">Estado Inicial</option>
              <option value="FINAL_RESULT">Resultado Final</option>
            </select>
          </div>
          <input
            type="text"
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            placeholder="Comentario o descripción (ej: Pastilla desgastada antes de desmontar)"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
          <button
            type="submit"
            disabled={uploadingPhoto}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-lg transition-all"
          >
            {uploadingPhoto ? 'Subiendo...' : 'Adjuntar Evidencia'}
          </button>
        </form>
      </div>
    </div>
  );
}
