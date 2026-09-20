export interface Service {
  id: string;
  name: string;
  duration: number; // em minutos
  price: number;
  description: string;
  icon: string;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export type Page = 'home' | 'booking' | 'admin' | 'admin-login';
