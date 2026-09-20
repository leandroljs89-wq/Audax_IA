import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Calendar, Clock, User, Scissors, Check, ChevronLeft, ChevronRight, Phone as PhoneIcon, Loader2 } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingPageProps {
  onNavigate: (page: 'home' | 'booking' | 'admin' | 'admin-login') => void;
}

export default function BookingPage({ onNavigate }: BookingPageProps) {
  const { services, barbers, addAppointment, getAvailableSlots } = useApp();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getWeekDays = () => {
    const today = startOfDay(new Date());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(today, i + (weekOffset * 7));
      if (day.getDay() !== 0) { // Exclui domingo
        days.push(day);
      }
    }
    return days;
  };

  // Fetch available slots when date or barber changes
  useEffect(() => {
    if (selectedDate && selectedBarber) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const slots = await getAvailableSlots(selectedDate, selectedBarber);
          setAvailableSlots(slots);
        } catch (err) {
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedBarber, getAvailableSlots]);

  const handleSubmit = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addAppointment({
        clientName,
        clientPhone,
        clientEmail,
        serviceId: selectedService,
        barberId: selectedBarber,
        date: selectedDate,
        time: selectedTime,
      });

      if (success) {
        setShowSuccess(true);
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService('');
    setSelectedBarber('');
    setSelectedDate('');
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setShowSuccess(false);
  };

  if (showSuccess) {
    const service = services.find(s => s.id === selectedService);
    const barber = barbers.find(b => b.id === selectedBarber);
    
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center animate-fadeIn">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
            <Check className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Agendamento <span className="text-amber-500">Confirmado!</span>
          </h2>
          <p className="text-zinc-400 mb-8">Seu horário foi reservado com sucesso</p>
          
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Serviço:</span>
              <span className="text-white font-medium">{service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Barbeiro:</span>
              <span className="text-white font-medium">{barber?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Data:</span>
              <span className="text-white font-medium">{format(new Date(selectedDate + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Horário:</span>
              <span className="text-white font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-700 pt-3 mt-3">
              <span className="text-zinc-400">Valor:</span>
              <span className="text-amber-400 font-bold text-lg">R$ {service?.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetBooking}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-bold py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              Novo Agendamento
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 border border-zinc-700 text-zinc-300 font-medium py-3 rounded-xl hover:bg-zinc-800 transition-all"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onNavigate('home')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            {step > 1 ? <ChevronLeft className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            <span>{step > 1 ? 'Voltar' : 'Início'}</span>
          </button>
          <h1 className="text-lg font-bold">Agendamento</h1>
          <span className="text-zinc-500 text-sm">Passo {step}/4</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-zinc-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Escolha o <span className="text-amber-500">Serviço</span>
              </h2>
              <p className="text-zinc-400">Selecione o serviço desejado</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service.id); setStep(2); }}
                  className={`text-left p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                    selectedService === service.id
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-800/50 border-zinc-700/50 hover:border-amber-500/50 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-amber-400 font-bold text-lg">R$ {service.price.toFixed(2)}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{service.name}</h3>
                  <p className="text-zinc-400 text-sm mb-3">{service.description}</p>
                  <span className="text-zinc-500 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {service.duration} minutos
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Barber */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Escolha o <span className="text-amber-500">Barbeiro</span>
              </h2>
              <p className="text-zinc-400">Selecione seu profissional preferido</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {barbers.filter(b => b.available).map((barber) => (
                <button
                  key={barber.id}
                  onClick={() => { setSelectedBarber(barber.id); setStep(3); }}
                  className={`text-center p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                    selectedBarber === barber.id
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-800/50 border-zinc-700/50 hover:border-amber-500/50 hover:bg-zinc-800'
                  }`}
                >
                  <div className="text-5xl mb-4">{barber.avatar}</div>
                  <h3 className="text-white font-bold text-lg mb-1">{barber.name}</h3>
                  <p className="text-amber-400 text-sm">{barber.specialty}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Escolha <span className="text-amber-500">Data & Horário</span>
              </h2>
              <p className="text-zinc-400">Selecione a data e horário disponíveis</p>
            </div>
            
            {/* Date Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" /> Data
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                    disabled={weekOffset === 0}
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 disabled:opacity-30 hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setWeekOffset(weekOffset + 1)}
                    className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {getWeekDays().map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isSelected = selectedDate === dateStr;
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <button
                      key={dateStr}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                      className={`p-3 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-zinc-900 font-bold shadow-lg shadow-amber-500/25'
                          : 'bg-zinc-800/50 border border-zinc-700/50 hover:border-amber-500/50 text-zinc-300'
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className="text-lg font-bold">{format(day, 'dd')}</div>
                      {isToday && !isSelected && (
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mx-auto mt-1"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-amber-500" /> Horário Disponível
                </h3>
                
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    <span className="ml-2 text-zinc-400">Carregando horários...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {availableSlots.map((slot: string) => (
                      <button
                        key={slot}
                        onClick={() => { setSelectedTime(slot); setStep(4); }}
                        className={`py-3 px-4 rounded-xl text-center font-medium transition-all ${
                          selectedTime === slot
                            ? 'bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/25'
                            : 'bg-zinc-800/50 border border-zinc-700/50 hover:border-amber-500/50 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <p>Nenhum horário disponível para esta data.</p>
                    <p className="text-sm mt-2">Selecione outra data.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Client Info */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Seus <span className="text-amber-500">Dados</span>
              </h2>
              <p className="text-zinc-400">Preencha seus dados para confirmar o agendamento</p>
            </div>

            {/* Summary */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5 mb-8">
              <h4 className="text-amber-400 font-semibold mb-3 text-sm uppercase tracking-wider">Resumo</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500 block">Serviço</span>
                  <span className="text-white font-medium">{services.find(s => s.id === selectedService)?.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Barbeiro</span>
                  <span className="text-white font-medium">{barbers.find(b => b.id === selectedBarber)?.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Data</span>
                  <span className="text-white font-medium">{format(new Date(selectedDate + 'T12:00:00'), "dd/MM/yyyy")}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Horário</span>
                  <span className="text-white font-medium">{selectedTime}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  <User className="w-4 h-4 inline mr-2 text-amber-500" />
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-2 text-amber-500" />
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!clientName || !clientPhone || isSubmitting}
              className="w-full mt-8 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-bold py-4 rounded-xl text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Agendando...
                </>
              ) : (
                'Confirmar Agendamento'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
