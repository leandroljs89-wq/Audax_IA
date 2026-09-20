import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service, Barber, Appointment } from '../types';

interface AppContextType {
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  isAdminLoggedIn: boolean;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  deleteAppointment: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addBarber: (barber: Omit<Barber, 'id'>) => void;
  updateBarber: (barber: Barber) => void;
  deleteBarber: (id: string) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  getAvailableSlots: (date: string, barberId: string) => string[];
}

const defaultServices: Service[] = [
  { id: '1', name: 'Corte Masculino', duration: 30, price: 45, description: 'Corte moderno com acabamento na máquina', icon: 'scissors' },
  { id: '2', name: 'Barba Completa', duration: 30, price: 35, description: 'Aparar, modelar e hidratar a barba', icon: 'scissors' },
  { id: '3', name: 'Corte + Barba', duration: 60, price: 70, description: 'Combo completo com corte e barba', icon: 'scissors' },
  { id: '4', name: 'Pigmentação', duration: 45, price: 60, description: 'Pigmentação capilar para disfarçar falhas', icon: 'scissors' },
  { id: '5', name: 'Hidratação Capilar', duration: 30, price: 40, description: 'Tratamento profundo para cabelos', icon: 'scissors' },
  { id: '6', name: 'Sobrancelha', duration: 15, price: 20, description: 'Design e alinhamento de sobrancelha', icon: 'scissors' },
];

const defaultBarbers: Barber[] = [
  { id: '1', name: 'Carlos Silva', specialty: 'Cortes Clássicos & Degradê', avatar: '👨‍🦱', available: true },
  { id: '2', name: 'Rafael Santos', specialty: 'Barba & Design', avatar: '🧔', available: true },
  { id: '3', name: 'Lucas Oliveira', specialty: 'Cortes Modernos & Pigmentação', avatar: '💈', available: true },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(() => {
    const stored = localStorage.getItem('barber_services');
    return stored ? JSON.parse(stored) : defaultServices;
  });

  const [barbers, setBarbers] = useState<Barber[]>(() => {
    const stored = localStorage.getItem('barber_barbers');
    return stored ? JSON.parse(stored) : defaultBarbers;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = localStorage.getItem('barber_appointments');
    return stored ? JSON.parse(stored) : [];
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('barber_admin_logged') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('barber_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('barber_barbers', JSON.stringify(barbers));
  }, [barbers]);

  useEffect(() => {
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('barber_admin_logged', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const addService = (service: Omit<Service, 'id'>) => {
    const newService: Service = { ...service, id: Date.now().toString() };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (service: Service) => {
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addBarber = (barber: Omit<Barber, 'id'>) => {
    const newBarber: Barber = { ...barber, id: Date.now().toString() };
    setBarbers(prev => [...prev, newBarber]);
  };

  const updateBarber = (barber: Barber) => {
    setBarbers(prev => prev.map(b => b.id === barber.id ? barber : b));
  };

  const deleteBarber = (id: string) => {
    setBarbers(prev => prev.filter(b => b.id !== id));
  };

  const loginAdmin = (password: string): boolean => {
    if (password === 'admin123') {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
  };

  const getAvailableSlots = (date: string, barberId: string): string[] => {
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
    ];

    const bookedSlots = appointments
      .filter(apt => apt.date === date && apt.barberId === barberId && apt.status !== 'cancelled')
      .map(apt => apt.time);

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  return (
    <AppContext.Provider value={{
      services, barbers, appointments, isAdminLoggedIn,
      addAppointment, updateAppointmentStatus, deleteAppointment,
      addService, updateService, deleteService,
      addBarber, updateBarber, deleteBarber,
      loginAdmin, logoutAdmin, getAvailableSlots
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
