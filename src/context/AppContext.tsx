import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Service, Barber, Appointment } from '../types';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AppContextType {
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  isAdminLoggedIn: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'created_at' | 'status'>) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addBarber: (barber: Omit<Barber, 'id'>) => Promise<void>;
  updateBarber: (barber: Barber) => Promise<void>;
  deleteBarber: (id: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  getAvailableSlots: (date: string, barberId: string) => Promise<string[]>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (!error && data) {
      setServices(data.map((s: any) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        price: parseFloat(s.price),
        description: s.description || '',
        icon: s.icon || 'scissors',
      })));
    }
  }, []);

  const fetchBarbers = useCallback(async () => {
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setBarbers(data.map((b: any) => ({
        id: b.id,
        name: b.name,
        specialty: b.specialty || '',
        avatar: b.avatar || '💈',
        available: b.available,
      })));
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });
    
    if (!error && data) {
      setAppointments(data.map((a: any) => ({
        id: a.id,
        clientName: a.client_name,
        clientPhone: a.client_phone,
        clientEmail: a.client_email || '',
        serviceId: a.service_id,
        barberId: a.barber_id,
        date: a.appointment_date,
        time: a.appointment_time?.substring(0, 5) || '',
        status: a.status,
        createdAt: a.created_at,
        notes: a.notes || '',
      })));
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchServices(), fetchBarbers(), fetchAppointments()]);
  }, [fetchServices, fetchBarbers, fetchAppointments]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      
      // Check if admin is logged in (session)
      const session = sessionStorage.getItem('barber_admin_session');
      if (session) {
        try {
          const user = JSON.parse(session);
          setAdminUser(user);
          setIsAdminLoggedIn(true);
        } catch {
          sessionStorage.removeItem('barber_admin_session');
        }
      }
      
      setLoading(false);
    };
    init();
  }, [refreshData]);

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'status'>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_name: appointment.clientName,
        client_phone: appointment.clientPhone,
        client_email: appointment.clientEmail || null,
        service_id: appointment.serviceId,
        barber_id: appointment.barberId,
        appointment_date: appointment.date,
        appointment_time: appointment.time + ':00',
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating appointment:', error);
      return false;
    }
    
    await fetchAppointments();
    return true;
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);
    
    await fetchAppointments();
  };

  const deleteAppointment = async (id: string) => {
    await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    await fetchAppointments();
  };

  const addService = async (service: Omit<Service, 'id'>) => {
    await supabase
      .from('services')
      .insert({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        icon: service.icon,
        active: true,
      });
    
    await fetchServices();
  };

  const updateService = async (service: Service) => {
    await supabase
      .from('services')
      .update({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        icon: service.icon,
      })
      .eq('id', service.id);
    
    await fetchServices();
  };

  const deleteService = async (id: string) => {
    await supabase
      .from('services')
      .update({ active: false })
      .eq('id', id);
    
    await fetchServices();
  };

  const addBarber = async (barber: Omit<Barber, 'id'>) => {
    await supabase
      .from('barbers')
      .insert({
        name: barber.name,
        specialty: barber.specialty,
        avatar: barber.avatar,
        available: barber.available,
      });
    
    await fetchBarbers();
  };

  const updateBarber = async (barber: Barber) => {
    await supabase
      .from('barbers')
      .update({
        name: barber.name,
        specialty: barber.specialty,
        avatar: barber.avatar,
        available: barber.available,
      })
      .eq('id', barber.id);
    
    await fetchBarbers();
  };

  const deleteBarber = async (id: string) => {
    await supabase
      .from('barbers')
      .delete()
      .eq('id', id);
    
    await fetchBarbers();
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase
      .rpc('verify_admin_login', { p_email: email, p_password: password });
    
    if (error) {
      console.error('Login error:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      const user: AdminUser = {
        id: data[0].id,
        email: data[0].email,
        name: data[0].name,
        role: data[0].role,
      };
      setAdminUser(user);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('barber_admin_session', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    sessionStorage.removeItem('barber_admin_session');
  };

  const getAvailableSlots = async (date: string, barberId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .rpc('get_available_slots', { p_date: date, p_barber_id: barberId });
    
    if (error) {
      console.error('Error getting slots:', error);
      // Fallback: calcular no frontend
      return calculateAvailableSlotsFallback(date, barberId);
    }
    
    if (data) {
      return data.map((slot: any) => {
        const timeStr = slot.time_slot || slot;
        return timeStr.substring(0, 5);
      });
    }
    
    return calculateAvailableSlotsFallback(date, barberId);
  };

  const calculateAvailableSlotsFallback = (date: string, barberId: string): string[] => {
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
      services, barbers, appointments, isAdminLoggedIn, adminUser, loading,
      addAppointment, updateAppointmentStatus, deleteAppointment,
      addService, updateService, deleteService,
      addBarber, updateBarber, deleteBarber,
      loginAdmin, logoutAdmin, getAvailableSlots, refreshData,
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
