import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  IN_PROGRESS: { label: 'En Reparación', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  WAITING_PARTS: { label: 'Esperando Repuestos', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  READY: { label: 'Listo para Entrega', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  DELIVERED: { label: 'Entregado', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};
