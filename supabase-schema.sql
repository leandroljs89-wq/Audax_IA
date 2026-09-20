-- ============================================
-- BARBERPRO - SISTEMA DE BARBEARIA
-- SQL para criação das tabelas no Supabase
-- ============================================

-- 1. Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    icon TEXT DEFAULT 'scissors',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Barbeiros
CREATE TABLE IF NOT EXISTS public.barbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT,
    avatar TEXT DEFAULT '💈',
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Usuários Admin (para login do barbeiro)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'barber')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON public.appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_date_time ON public.appointments(barber_id, appointment_date, appointment_time);

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Serviços padrão
INSERT INTO public.services (name, description, duration, price, icon) VALUES
    ('Corte Masculino', 'Corte moderno com acabamento na máquina', 30, 45.00, 'scissors'),
    ('Barba Completa', 'Aparar, modelar e hidratar a barba', 30, 35.00, 'scissors'),
    ('Corte + Barba', 'Combo completo com corte e barba', 60, 70.00, 'scissors'),
    ('Pigmentação', 'Pigmentação capilar para disfarçar falhas', 45, 60.00, 'scissors'),
    ('Hidratação Capilar', 'Tratamento profundo para cabelos', 30, 40.00, 'scissors'),
    ('Sobrancelha', 'Design e alinhamento de sobrancelha', 15, 20.00, 'scissors')
ON CONFLICT DO NOTHING;

-- Barbeiros padrão
INSERT INTO public.barbers (name, specialty, avatar, available) VALUES
    ('Carlos Silva', 'Cortes Clássicos & Degradê', '👨‍🦱', true),
    ('Rafael Santos', 'Barba & Design', '🧔', true),
    ('Lucas Oliveira', 'Cortes Modernos & Pigmentação', '💈', true)
ON CONFLICT DO NOTHING;

-- Admin padrão (senha: admin123)
-- IMPORTANTE: Em produção, use uma função para gerar o hash
-- Para este exemplo, estamos usando pgcrypto para hash
INSERT INTO public.admin_users (email, password_hash, name, role) VALUES
    ('admin@barberpro.com', crypt('admin123', gen_salt('bf')), 'Administrador', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para services (leitura pública, escrita apenas admin)
CREATE POLICY "Services are viewable by everyone" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Services are editable by authenticated users" ON public.services
    FOR ALL USING (true);

-- Políticas para barbers (leitura pública, escrita apenas admin)
CREATE POLICY "Barbers are viewable by everyone" ON public.barbers
    FOR SELECT USING (true);

CREATE POLICY "Barbers are editable by authenticated users" ON public.barbers
    FOR ALL USING (true);

-- Políticas para appointments (leitura e escrita)
CREATE POLICY "Appointments are viewable by everyone" ON public.appointments
    FOR SELECT USING (true);

CREATE POLICY "Appointments are insertable by everyone" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Appointments are updatable by everyone" ON public.appointments
    FOR UPDATE USING (true);

CREATE POLICY "Appointments are deletable by everyone" ON public.appointments
    FOR DELETE USING (true);

-- Políticas para admin_users
CREATE POLICY "Admin users are viewable by authenticated" ON public.admin_users
    FOR SELECT USING (true);

CREATE POLICY "Admin users are insertable" ON public.admin_users
    FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNÇÃO PARA VERIFICAR LOGIN ADMIN
-- ============================================
CREATE OR REPLACE FUNCTION public.verify_admin_login(p_email TEXT, p_password TEXT)
RETURNS TABLE(id UUID, email TEXT, name TEXT, role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT au.id, au.email, au.name, au.role
    FROM public.admin_users au
    WHERE au.email = p_email
    AND au.password_hash = crypt(p_password, au.password_hash)
    AND au.active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO PARA VERIFICAR HORÁRIOS DISPONÍVEIS
-- ============================================
CREATE OR REPLACE FUNCTION public.get_available_slots(p_date DATE, p_barber_id UUID)
RETURNS TABLE(time_slot TIME) AS $$
DECLARE
    all_slots TIME[] := ARRAY[
        '09:00'::time, '09:30'::time, '10:00'::time, '10:30'::time,
        '11:00'::time, '11:30'::time, '13:00'::time, '13:30'::time,
        '14:00'::time, '14:30'::time, '15:00'::time, '15:30'::time,
        '16:00'::time, '16:30'::time, '17:00'::time, '17:30'::time,
        '18:00'::time, '18:30'::time
    ];
    slot TIME;
    is_available BOOLEAN;
BEGIN
    FOREACH slot IN ARRAY all_slots
    LOOP
        SELECT NOT EXISTS(
            SELECT 1 FROM public.appointments
            WHERE appointment_date = p_date
            AND barber_id = p_barber_id
            AND appointment_time = slot
            AND status NOT IN ('cancelled')
        ) INTO is_available;
        
        IF is_available THEN
            time_slot := slot;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- EXTENSÃO PARA CRIPTOGRAFIA
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Execute este SQL no Editor SQL do Supabase
-- 2. A extensão pgcrypto é necessária para a função crypt()
-- 3. A senha padrão do admin é: admin123
-- 4. Em produção, altere a senha após o primeiro login
-- 5. As políticas RLS permitem acesso total via anon key
--    Para maior segurança, implemente autenticação JWT
