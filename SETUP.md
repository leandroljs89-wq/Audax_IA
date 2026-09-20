# 🏪 BarberPro - Sistema de Barbearia Profissional

## 📋 Configuração do Supabase

### Passo 1: Executar o SQL no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/project/qcakrewtjkesqdwoximz)
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase-schema.sql`
5. Cole no editor e clique em **Run** (ou pressione Ctrl+Enter)

### Passo 2: Verificar as Tabelas

Após executar o SQL, verifique se as tabelas foram criadas:
- `services` - Serviços da barbearia
- `barbers` - Barbeiros
- `appointments` - Agendamentos
- `admin_users` - Usuários administradores

### Passo 3: Credenciais de Acesso Admin

| Campo | Valor |
|-------|-------|
| **Email** | `admin@barberpro.com` |
| **Senha** | `admin123` |

> ⚠️ **IMPORTANTE**: Após o primeiro acesso, altere a senha diretamente no banco de dados para maior segurança.

### Passo 4: Alterar Senha do Admin (Recomendado)

No SQL Editor do Supabase, execute:

```sql
UPDATE public.admin_users 
SET password_hash = crypt('SUA_NOVA_SENHA_AQUI', gen_salt('bf'))
WHERE email = 'admin@barberpro.com';
```

---

## 🗄️ Estrutura das Tabelas

### `services` - Serviços
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do serviço |
| description | TEXT | Descrição |
| duration | INTEGER | Duração em minutos |
| price | DECIMAL(10,2) | Preço em R$ |
| icon | TEXT | Ícone (emoji/texto) |
| active | BOOLEAN | Status ativo/inativo |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

### `barbers` - Barbeiros
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| name | TEXT | Nome do barbeiro |
| specialty | TEXT | Especialidade |
| avatar | TEXT | Avatar (emoji) |
| available | BOOLEAN | Disponível para agendamento |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

### `appointments` - Agendamentos
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| client_name | TEXT | Nome do cliente |
| client_phone | TEXT | Telefone/WhatsApp |
| client_email | TEXT | Email do cliente |
| service_id | UUID | Referência ao serviço |
| barber_id | UUID | Referência ao barbeiro |
| appointment_date | DATE | Data do agendamento |
| appointment_time | TIME | Horário do agendamento |
| status | TEXT | pending/confirmed/completed/cancelled |
| notes | TEXT | Observações |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

### `admin_users` - Administradores
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| email | TEXT | Email de login (único) |
| password_hash | TEXT | Senha criptografada (bcrypt) |
| name | TEXT | Nome do admin |
| role | TEXT | admin/barber |
| active | BOOLEAN | Conta ativa |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

---

## 🔧 Funções do Banco

### `verify_admin_login(email, password)`
Verifica as credenciais do admin. Retorna os dados do usuário se válido.

### `get_available_slots(date, barber_id)`
Retorna os horários disponíveis para uma data e barbeiro específicos.

---

## 🚀 Funcionalidades

### Para o Cliente:
- ✅ Landing page profissional
- ✅ Agendamento em 4 etapas (serviço → barbeiro → data/hora → dados)
- ✅ Visualização de horários disponíveis em tempo real
- ✅ Confirmação visual do agendamento

### Para o Administrador:
- ✅ Login seguro com email e senha
- ✅ Dashboard com métricas (agendamentos do dia, pendentes, receita)
- ✅ Gestão completa de agendamentos (confirmar, concluir, cancelar)
- ✅ CRUD de serviços
- ✅ CRUD de barbeiros
- ✅ Filtros por status

---

## 🔒 Segurança

- Senhas armazenadas com bcrypt (pgcrypto)
- Row Level Security (RLS) habilitado
- Conexão via HTTPS
- Sessão admin via sessionStorage (expira ao fechar o navegador)

---

## 📱 Tecnologias

- React 18 + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL + API)
- Lucide React (ícones)
- date-fns (datas)
- Vite (build)
