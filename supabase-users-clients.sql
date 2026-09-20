-- ============================================
-- BARBERPRO - GESTÃO DE USUÁRIOS E CLIENTES
-- SQL adicional para Supabase
-- ============================================

-- 1. Tabela de Clientes (para gestão completa)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    total_appointments INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Usuários do Sistema (barbeiros com acesso)
CREATE TABLE IF NOT EXISTS public.system_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'barber' CHECK (role IN ('admin', 'barber', 'manager')),
    barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_system_users_email ON public.system_users(email);
CREATE INDEX IF NOT EXISTS idx_system_users_role ON public.system_users(role);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Usuário Admin Principal (Barbeiro Chefe)
INSERT INTO public.system_users (email, password_hash, name, role, active) VALUES
    ('admin@barberpro.com', crypt('admin123', gen_salt('bf')), 'Administrador Master', 'admin', true)
ON CONFLICT DO NOTHING;

-- Usuário Gerente
INSERT INTO public.system_users (email, password_hash, name, role, active) VALUES
    ('gerente@barberpro.com', crypt('gerente123', gen_salt('bf')), 'Gerente da Barbearia', 'manager', true)
ON CONFLICT DO NOTHING;

-- Usuário Barbeiro (exemplo)
INSERT INTO public.system_users (email, password_hash, name, role, active) VALUES
    ('barbeiro@barberpro.com', crypt('barbeiro123', gen_salt('bf')), 'Barbeiro Padrão', 'barber', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNÇÕES DE GESTÃO
-- ============================================

-- Função para login de usuário do sistema
CREATE OR REPLACE FUNCTION public.login_system_user(p_email TEXT, p_password TEXT)
RETURNS TABLE(
    id UUID, 
    email TEXT, 
    name TEXT, 
    role TEXT, 
    barber_id UUID
) AS $$
BEGIN
    -- Verificar credenciais e atualizar último login
    UPDATE public.system_users
    SET last_login = NOW()
    WHERE email = p_email
    AND password_hash = crypt(p_password, password_hash)
    AND active = true
    RETURNING public.system_users.id, public.system_users.email, public.system_users.name, 
              public.system_users.role, public.system_users.barber_id;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar novo usuário do sistema
CREATE OR REPLACE FUNCTION public.create_system_user(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_role TEXT DEFAULT 'barber',
    p_barber_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    INSERT INTO public.system_users (email, password_hash, name, role, barber_id, active)
    VALUES (
        p_email,
        crypt(p_password, gen_salt('bf')),
        p_name,
        p_role,
        p_barber_id,
        true
    )
    RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar senha do usuário
CREATE OR REPLACE FUNCTION public.update_user_password(p_user_id UUID, p_new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.system_users
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar/atualizar cliente
CREATE OR REPLACE FUNCTION public.upsert_client(
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    client_id UUID;
BEGIN
    -- Verificar se cliente já existe pelo telefone
    SELECT id INTO client_id
    FROM public.clients
    WHERE phone = p_phone
    LIMIT 1;
    
    IF client_id IS NULL THEN
        -- Criar novo cliente
        INSERT INTO public.clients (name, phone, email)
        VALUES (p_name, p_phone, p_email)
        RETURNING id INTO client_id;
    ELSE
        -- Atualizar cliente existente
        UPDATE public.clients
        SET name = p_name,
            email = COALESCE(p_email, email),
            updated_at = NOW()
        WHERE id = client_id;
    END IF;
    
    RETURN client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar estatísticas do cliente após agendamento
CREATE OR REPLACE FUNCTION public.update_client_stats(p_client_phone TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.clients
    SET 
        total_appointments = (
            SELECT COUNT(*) 
            FROM public.appointments 
            WHERE client_phone = p_client_phone 
            AND status = 'completed'
        ),
        total_spent = (
            SELECT COALESCE(SUM(s.price), 0)
            FROM public.appointments a
            JOIN public.services s ON a.service_id = s.id
            WHERE a.client_phone = p_client_phone
            AND a.status = 'completed'
        ),
        updated_at = NOW()
    WHERE phone = p_client_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- Políticas para clients
CREATE POLICY "Clients are viewable by everyone" ON public.clients
    FOR SELECT USING (true);

CREATE POLICY "Clients are insertable by everyone" ON public.clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Clients are updatable by everyone" ON public.clients
    FOR UPDATE USING (true);

-- Políticas para system_users
CREATE POLICY "System users are viewable by authenticated" ON public.system_users
    FOR SELECT USING (true);

CREATE POLICY "System users are insertable" ON public.system_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System users are updatable" ON public.system_users
    FOR UPDATE USING (true);

CREATE POLICY "System users are deletable" ON public.system_users
    FOR DELETE USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_users_updated_at BEFORE UPDATE ON public.system_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar estatísticas do cliente após agendamento
CREATE OR REPLACE FUNCTION public.trigger_update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        PERFORM public.update_client_stats(NEW.client_phone);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_appointment_completed
AFTER UPDATE ON public.appointments
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION trigger_update_client_stats();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de clientes com estatísticas
CREATE OR REPLACE VIEW public.v_clients_stats AS
SELECT 
    c.id,
    c.name,
    c.phone,
    c.email,
    c.total_appointments,
    c.total_spent,
    c.notes,
    c.created_at,
    COUNT(a.id) as appointments_count,
    MAX(a.appointment_date) as last_appointment
FROM public.clients c
LEFT JOIN public.appointments a ON c.phone = a.client_phone
GROUP BY c.id, c.name, c.phone, c.email, c.total_appointments, 
         c.total_spent, c.notes, c.created_at;

-- View de usuários do sistema com informações do barbeiro
CREATE OR REPLACE VIEW public.v_system_users AS
SELECT 
    su.id,
    su.email,
    su.name,
    su.role,
    su.barber_id,
    su.active,
    su.last_login,
    su.created_at,
    b.name as barber_name,
    b.specialty as barber_specialty
FROM public.system_users su
LEFT JOIN public.barbers b ON su.barber_id = b.id;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Execute este SQL após o schema inicial
-- 2. Credenciais padrão:
--    - Admin: admin@barberpro.com / admin123
--    - Gerente: gerente@barberpro.com / gerente123
--    - Barbeiro: barbeiro@barberpro.com / barbeiro123
-- 3. Altere as senhas após o primeiro login
-- 4. O sistema agora suporta gestão completa de:
--    - Usuários do sistema (com diferentes roles)
--    - Clientes (com estatísticas automáticas)
--    - Barbeiros
--    - Serviços
--    - Agendamentos
