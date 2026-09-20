import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Service, Barber, Appointment } from '../types';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  barber_id?: string;
}

interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'barber' | 'manager';
  barber_id?: string;
  active: boolean;
  last_login?: string;
  created_at: string;
  barber_name?: string;
  barber_specialty?: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  total_appointments: number;
  total_spent: number;
  notes?: string;
  created_at: string;
  last_appointment?: string;
}

interface AppContextType {
  services: Service[];
  barbers: Barber[];
  appointments: Appointment[];
  systemUsers: SystemUser[];
  clients: Client[];
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
  // Gestão de Usuários
  addSystemUser: (user: { email: string; password: string; name: string; role: string; barber_id?: string }) => Promise<boolean>;
  updateSystemUser: (id: string, data: Partial<SystemUser>) => Promise<void>;
  deleteSystemUser: (id: string) => Promise<void>;
  updateUserPassword: (id: string, newPassword: string) => Promise<boolean>;
  // Gestão de Clientes
  addClient: (client: { name: string; phone: string; email?: string }) => Promise<boolean>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
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

  const fetchSystemUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('v_system_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSystemUsers(data.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        barber_id: u.barber_id,
        active: u.active,
        last_login: u.last_login,
        created_at: u.created_at,
        barber_name: u.barber_name,
        barber_specialty: u.barber_specialty,
      })));
    }
  }, []);

  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase
      .from('v_clients_stats')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setClients(data.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        total_appointments: c.total_appointments || 0,
        total_spent: parseFloat(c.total_spent) || 0,
        notes: c.notes,
        created_at: c.created_at,
        last_appointment: c.last_appointment,
      })));
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchServices(), 
      fetchBarbers(), 
      fetchAppointments(),
      fetchSystemUsers(),
      fetchClients()
    ]);
  }, [fetchServices, fetchBarbers, fetchAppointments, fetchSystemUsers, fetchClients]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      
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
    
    // Criar/atualizar cliente automaticamente
    await supabase.rpc('upsert_client', {
      p_name: appointment.clientName,
      p_phone: appointment.clientPhone,
      p_email: appointment.clientEmail || null
    });
    
    await fetchAppointments();
    await fetchClients();
    return true;
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);
    
    await fetchAppointments();
    if (status === 'completed') {
      await fetchClients();
    }
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
      .rpc('login_system_user', { p_email: email, p_password: password });
    
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
        barber_id: data[0].barber_id,
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

  // Gestão de Usuários do Sistema
  const addSystemUser = async (user: { email: string; password: string; name: string; role: string; barber_id?: string }): Promise<boolean> => {
    const { data, error } = await supabase.rpc('create_system_user', {
      p_email: user.email,
      p_password: user.password,
      p_name: user.name,
      p_role: user.role,
      p_barber_id: user.barber_id || null
    });
    
    if (error) {
      console.error('Error creating user:', error);
      return false;
    }
    
    await fetchSystemUsers();
    return true;
  };

  const updateSystemUser = async (id: string, userData: Partial<SystemUser>) => {
    await supabase
      .from('system_users')
      .update({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        barber_id: userData.barber_id,
        active: userData.active,
      })
      .eq('id', id);
    
    await fetchSystemUsers();
  };

  const deleteSystemUser = async (id: string) => {
    await supabase
      .from('system_users')
      .delete()
      .eq('id', id);
    
    await fetchSystemUsers();
  };

  const updateUserPassword = async (id: string, newPassword: string): Promise<boolean> => {
    const { error } = await supabase.rpc('update_user_password', {
      p_user_id: id,
      p_new_password: newPassword
    });
    
    if (error) {
      console.error('Error updating password:', error);
      return false;
    }
    
    return true;
  };

  // Gestão de Clientes
  const addClient = async (client: { name: string; phone: string; email?: string }): Promise<boolean> => {
    const { error } = await supabase.rpc('upsert_client', {
      p_name: client.name,
      p_phone: client.phone,
      p_email: client.email || null
    });
    
    if (error) {
      console.error('Error creating client:', error);
      return false;
    }
    
    await fetchClients();
    return true;
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    await supabase
      .from('clients')
      .update({
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        notes: clientData.notes,
      })
      .eq('id', id);
    
    await fetchClients();
  };

  const deleteClient = async (id: string) => {
    await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    await fetchClients();
  };

  return (
    <AppContext.Provider value={{
      services, barbers, appointments, systemUsers, clients,
      isAdminLoggedIn, adminUser, loading,
      addAppointment, updateAppointmentStatus, deleteAppointment,
      addService, updateService, deleteService,
      addBarber, updateBarber, deleteBarber,
      loginAdmin, logoutAdmin, getAvailableSlots, refreshData,
      addSystemUser, updateSystemUser, deleteSystemUser, updateUserPassword,
      addClient, updateClient, deleteClient,
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
