import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LogOut, Calendar, Users, Scissors, UserCheck, Clock, 
  Plus, Trash2, Edit, Check, X, BarChart3,
  TrendingUp, DollarSign, Loader2, RefreshCw
} from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminPageProps {
  onNavigate: (page: 'home' | 'booking' | 'admin' | 'admin-login') => void;
}

type AdminTab = 'dashboard' | 'appointments' | 'services' | 'barbers';

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const { 
    appointments, services, barbers, adminUser,
    updateAppointmentStatus, deleteAppointment,
    addService, updateService, deleteService,
    addBarber, updateBarber, deleteBarber,
    logoutAdmin, refreshData
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showBarberModal, setShowBarberModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingBarber, setEditingBarber] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Service form state
  const [serviceForm, setServiceForm] = useState({ name: '', duration: 30, price: 0, description: '', icon: 'scissors' });
  // Barber form state
  const [barberForm, setBarberForm] = useState({ name: '', specialty: '', avatar: '💈', available: true });
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    onNavigate('home');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filterStatus);

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.date + 'T' + a.time);
    const dateB = new Date(b.date + 'T' + b.time);
    return dateA.getTime() - dateB.getTime();
  });

  // Dashboard stats
  const todayAppointments = appointments.filter(a => {
    try {
      return isToday(parseISO(a.date + 'T12:00:00'));
    } catch { return false; }
  });
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedToday = todayAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length;
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => {
      const service = services.find(s => s.id === a.serviceId);
      return sum + (service?.price || 0);
    }, 0);

  const handleSaveService = async () => {
    setIsSaving(true);
    try {
      if (editingService) {
        await updateService({ ...editingService, ...serviceForm });
      } else {
        await addService(serviceForm);
      }
      setShowServiceModal(false);
      setEditingService(null);
      setServiceForm({ name: '', duration: 30, price: 0, description: '', icon: 'scissors' });
    } catch (err) {
      console.error('Error saving service:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBarber = async () => {
    setIsSaving(true);
    try {
      if (editingBarber) {
        await updateBarber({ ...editingBarber, ...barberForm });
      } else {
        await addBarber(barberForm);
      }
      setShowBarberModal(false);
      setEditingBarber(null);
      setBarberForm({ name: '', specialty: '', avatar: '💈', available: true });
    } catch (err) {
      console.error('Error saving barber:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteAppointment(id);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja desativar este serviço?')) {
      await deleteService(id);
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este barbeiro?')) {
      await deleteBarber(id);
    }
  };

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments' as AdminTab, label: 'Agendamentos', icon: Calendar },
    { id: 'services' as AdminTab, label: 'Serviços', icon: Scissors },
    { id: 'barbers' as AdminTab, label: 'Barbeiros', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-zinc-900 font-bold text-sm">B</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold leading-tight">BarberPro <span className="text-amber-500">Admin</span></h1>
              {adminUser && <p className="text-zinc-500 text-xs">Olá, {adminUser.name}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/25'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Painel <span className="text-amber-500">Geral</span>
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{todayAppointments.length}</p>
                <p className="text-zinc-400 text-sm">Agendamentos Hoje</p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{pendingCount}</p>
                <p className="text-zinc-400 text-sm">Pendentes</p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{confirmedToday}</p>
                <p className="text-zinc-400 text-sm">Confirmados Hoje</p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(0)}</p>
                <p className="text-zinc-400 text-sm">Receita Total</p>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Agenda de Hoje
              </h3>
              
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum agendamento para hoje</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((apt) => {
                      const service = services.find(s => s.id === apt.serviceId);
                      const barber = barbers.find(b => b.id === apt.barberId);
                      return (
                        <div key={apt.id} className="flex items-center gap-4 bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/30">
                          <div className="text-center min-w-[60px]">
                            <p className="text-amber-400 font-bold text-lg">{apt.time}</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{apt.clientName}</p>
                            <p className="text-zinc-400 text-sm">{service?.name} • {barber?.name}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                            apt.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
                            apt.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {apt.status === 'pending' ? 'Pendente' :
                             apt.status === 'confirmed' ? 'Confirmado' :
                             apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Todos os <span className="text-amber-500">Agendamentos</span>
              </h2>
              
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendentes</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="completed">Concluídos</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>

            {sortedAppointments.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhum agendamento encontrado</p>
                <p className="text-sm mt-1">Os agendamentos aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedAppointments.map((apt) => {
                  const service = services.find(s => s.id === apt.serviceId);
                  const barber = barbers.find(b => b.id === apt.barberId);
                  return (
                    <div key={apt.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5 hover:border-zinc-600 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-bold text-lg">{apt.clientName}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              apt.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              apt.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              apt.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {apt.status === 'pending' ? 'Pendente' :
                               apt.status === 'confirmed' ? 'Confirmado' :
                               apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <p className="text-zinc-400">
                              <Scissors className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                              {service?.name}
                            </p>
                            <p className="text-zinc-400">
                              <Users className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                              {barber?.name}
                            </p>
                            <p className="text-zinc-400">
                              <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                              {format(parseISO(apt.date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-zinc-400">
                              <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                              {apt.time}
                            </p>
                          </div>
                          <p className="text-zinc-500 text-xs mt-2">📱 {apt.clientPhone}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Confirmar
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" /> Cancelar
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                              className="flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Concluir
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="flex items-center gap-1 bg-zinc-700/50 text-zinc-400 border border-zinc-600/50 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Gerenciar <span className="text-amber-500">Serviços</span>
              </h2>
              <button
                onClick={() => { setEditingService(null); setServiceForm({ name: '', duration: 30, price: 0, description: '', icon: 'scissors' }); setShowServiceModal(true); }}
                className="flex items-center gap-2 bg-amber-500 text-zinc-900 font-medium px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Novo Serviço
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingService(service); setServiceForm({ name: service.name, duration: service.duration, price: service.price, description: service.description, icon: service.icon }); setShowServiceModal(true); }}
                        className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-bold mb-1">{service.name}</h3>
                  <p className="text-zinc-400 text-sm mb-3">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">R$ {service.price.toFixed(2)}</span>
                    <span className="text-zinc-500 text-sm">{service.duration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barbers Tab */}
        {activeTab === 'barbers' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Gerenciar <span className="text-amber-500">Barbeiros</span>
              </h2>
              <button
                onClick={() => { setEditingBarber(null); setBarberForm({ name: '', specialty: '', avatar: '💈', available: true }); setShowBarberModal(true); }}
                className="flex items-center gap-2 bg-amber-500 text-zinc-900 font-medium px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" /> Novo Barbeiro
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div key={barber.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-6 text-center hover:border-amber-500/30 transition-colors">
                  <div className="text-5xl mb-4">{barber.avatar}</div>
                  <h3 className="text-white font-bold text-lg mb-1">{barber.name}</h3>
                  <p className="text-amber-400 text-sm mb-4">{barber.specialty}</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className={`w-2 h-2 rounded-full ${barber.available ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span className="text-zinc-400 text-sm">{barber.available ? 'Disponível' : 'Indisponível'}</span>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => { setEditingBarber(barber); setBarberForm({ name: barber.name, specialty: barber.specialty, avatar: barber.avatar, available: barber.available }); setShowBarberModal(true); }}
                      className="flex items-center gap-1 bg-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-lg text-sm hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleDeleteBarber(barber.id)}
                      className="flex items-center gap-1 bg-zinc-700/50 text-zinc-300 px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md animate-scaleIn">
            <h3 className="text-xl font-bold mb-6">{editingService ? 'Editar' : 'Novo'} Serviço</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 text-sm mb-1">Nome</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-300 text-sm mb-1">Descrição</label>
                <input
                  type="text"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 text-sm mb-1">Duração (min)</label>
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowServiceModal(false); setEditingService(null); }}
                className="flex-1 border border-zinc-700 text-zinc-300 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveService}
                disabled={!serviceForm.name || !serviceForm.price || isSaving}
                className="flex-1 bg-amber-500 text-zinc-900 font-medium py-2 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barber Modal */}
      {showBarberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md animate-scaleIn">
            <h3 className="text-xl font-bold mb-6">{editingBarber ? 'Editar' : 'Novo'} Barbeiro</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 text-sm mb-1">Nome</label>
                <input
                  type="text"
                  value={barberForm.name}
                  onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-300 text-sm mb-1">Especialidade</label>
                <input
                  type="text"
                  value={barberForm.specialty}
                  onChange={(e) => setBarberForm({ ...barberForm, specialty: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-300 text-sm mb-2">Avatar</label>
                <div className="flex gap-2">
                  {['💈', '👨‍🦱', '🧔', '👨', '🧑‍🦰', '👨‍🦳'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setBarberForm({ ...barberForm, avatar: emoji })}
                      className={`text-2xl p-2 rounded-lg transition-colors ${barberForm.avatar === emoji ? 'bg-amber-500/20 border border-amber-500' : 'bg-zinc-800 border border-zinc-700 hover:border-zinc-600'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-zinc-300 text-sm">Disponível:</label>
                <button
                  type="button"
                  onClick={() => setBarberForm({ ...barberForm, available: !barberForm.available })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${barberForm.available ? 'bg-green-500' : 'bg-zinc-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${barberForm.available ? 'left-6' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowBarberModal(false); setEditingBarber(null); }}
                className="flex-1 border border-zinc-700 text-zinc-300 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBarber}
                disabled={!barberForm.name || isSaving}
                className="flex-1 bg-amber-500 text-zinc-900 font-medium py-2 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
