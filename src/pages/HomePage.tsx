import React from 'react';
import { useApp } from '../context/AppContext';
import { Scissors, Clock, Star, MapPin, Phone, ChevronRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'home' | 'booking' | 'admin' | 'admin-login') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { services, barbers } = useApp();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-amber-300 text-sm font-medium">A melhor experiência em barbearia</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-white">Estilo &</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Atitude</span>
          </h1>
          
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Transforme seu visual com profissionais de excelência. 
            Agende online e garanta seu horário na melhor barbearia da cidade.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('booking')}
              className="group bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-bold px-8 py-4 rounded-xl text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2"
            >
              Agendar Agora
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('admin-login')}
              className="border border-zinc-700 text-zinc-300 font-medium px-8 py-4 rounded-xl text-lg hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300"
            >
              Área do Barbeiro
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-zinc-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-amber-500 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Nossos <span className="text-amber-500">Serviços</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Serviços premium para quem busca qualidade e estilo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-zinc-800 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Scissors className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-zinc-400 text-sm mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold text-lg">R$ {service.price.toFixed(2)}</span>
                  <span className="text-zinc-500 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {service.duration} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Nossa <span className="text-amber-500">Equipe</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Profissionais experientes prontos para transformar seu visual
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="text-center group"
              >
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-full flex items-center justify-center text-5xl border-2 border-amber-500/30 group-hover:border-amber-500 group-hover:scale-105 transition-all duration-300">
                  {barber.avatar}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{barber.name}</h3>
                <p className="text-amber-400 text-sm">{barber.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-amber-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pronto para um novo <span className="text-amber-500">visual</span>?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Agende agora mesmo e garanta o melhor atendimento. Sem filas, sem espera.
          </p>
          <button
            onClick={() => onNavigate('booking')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-bold px-10 py-5 rounded-xl text-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/25"
          >
            Fazer Agendamento
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-amber-500 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>BarberPro</h3>
              <p className="text-zinc-400 text-sm">A melhor experiência em barbearia. Estilo, qualidade e atendimento premium.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contato</h4>
              <div className="space-y-2 text-zinc-400 text-sm">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-500" /> (11) 99999-9999</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-500" /> Rua da Barbearia, 123 - Centro</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Horário</h4>
              <div className="space-y-2 text-zinc-400 text-sm">
                <p>Seg - Sex: 09:00 - 19:00</p>
                <p>Sábado: 09:00 - 17:00</p>
                <p>Domingo: Fechado</p>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-500 text-sm">
            © 2024 BarberPro. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
