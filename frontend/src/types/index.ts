export type Role = 'ADMIN' | 'MECHANIC';

export type OrderStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'READY'
  | 'DELIVERED';

export type ItemType = 'PART' | 'LABOR';

export type MediaType = 'INITIAL_STATE' | 'DISASSEMBLY' | 'NEW_PART' | 'FINAL_RESULT';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  documentId?: string;
  address?: string;
  createdAt: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  qrToken: string;
  clientId: string;
  client?: Client;
  workOrders?: WorkOrder[];
}

export interface WorkOrderItem {
  id: string;
  type: ItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface WorkOrderMedia {
  id: string;
  url: string;
  caption?: string;
  type: MediaType;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  currentKm: number;
  description: string;
  notes?: string;
  vehicleId: string;
  vehicle: Vehicle;
  mechanicId?: string;
  mechanic?: User;
  items: WorkOrderItem[];
  media: WorkOrderMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  clientId: string;
  client: Client;
  vehicleId: string;
  vehicle: Vehicle;
  createdAt: string;
  updatedAt: string;
}
