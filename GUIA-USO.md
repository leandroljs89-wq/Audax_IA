# 🏪 BarberPro - Guia Completo de Uso

## 🔐 CREDENCIAIS DE ACESSO

### ⚠️ IMPORTANTE: Execute o SQL primeiro!

Antes de acessar o sistema, você **DEVE** executar o arquivo `supabase-users-clients.sql` no Supabase:

1. Acesse: https://supabase.com/dashboard/project/qcakrewtjkesqdwoximz/sql
   
2. Clique em **New Query**

3. Copie todo o conteúdo do arquivo `supabase-users-clients.sql`

4. Cole no editor e clique em **Run**

---

## 👤 PERFIS DE ACESSO

### 🔴 Administrador Master (Barbeiro Chefe)
```
Email: admin@barberpro.com
Senha: admin123
```
**Permissões:**
- ✅ Acesso total ao sistema
- ✅ Gerenciar todos os usuários
- ✅ Gerenciar barbeiros
- ✅ Gerenciar serviços
- ✅ Gerenciar clientes
- ✅ Ver todos os agendamentos
- ✅ Dashboard completo

### 🔵 Gerente
```
Email: gerente@barberpro.com
Senha: gerente123
```
**Permissões:**
- ✅ Gerenciar agendamentos
- ✅ Gerenciar clientes
- ✅ Ver dashboard
- ⚠️ Não pode gerenciar usuários do sistema

### 🟢 Barbeiro
```
Email: barbeiro@barberpro.com
Senha: barbeiro123
```
**Permissões:**
- ✅ Ver seus agendamentos
- ✅ Confirmar/concluir agendamentos
- ⚠️ Acesso limitado

---

## 🚀 COMO ACESSAR O SISTEMA

### Passo 1: Tela Inicial
- Acesse a URL do sistema
- Você verá a landing page profissional

### Passo 2: Login
1. Clique em **"Área do Barbeiro"** ou **"Área Restrita"**
2. Clique em **"Credenciais de Acesso"** para ver os perfis
3. Clique em um perfil para preencher automaticamente
4. Ou digite manualmente:
   - Email: `admin@barberpro.com`
   - Senha: `admin123`
5. Clique em **"Entrar"**

### Passo 3: Painel Admin
Após o login, você terá acesso ao painel completo com as seguintes abas:

#### 📊 Dashboard
- Agendamentos do dia
- Agendamentos pendentes
- Total de clientes
- Receita total
- Agenda de hoje em tempo real

#### 📅 Agendamentos
- Lista completa de agendamentos
- Filtros por status (pendente, confirmado, concluído, cancelado)
- Ações: Confirmar, Concluir, Cancelar, Excluir

#### ✂️ Serviços
- CRUD completo de serviços
- Nome, descrição, duração, preço
- Ativar/desativar serviços

#### 💈 Barbeiros
- CRUD completo de barbeiros
- Nome, especialidade, avatar
- Status disponível/indisponível

#### 👥 Usuários (SOMENTE ADMIN)
- Criar novos usuários do sistema
- Editar usuários existentes
- Alterar senhas
- Definir perfis (admin, gerente, barbeiro)
- Vincular usuário a um barbeiro
- Ativar/desativar contas

#### 🧑 Clientes
- Lista de todos os clientes
- Estatísticas automáticas:
  - Total de agendamentos
  - Total gasto
  - Último agendamento
- CRUD completo
- Observações por cliente

---

## 📝 COMO CRIAR NOVOS USUÁRIOS

### Como Admin Master:

1. Acesse a aba **"Usuários"**
2. Clique em **"Novo Usuário"**
3. Preencha:
   - **Nome**: Nome completo do usuário
   - **Email**: Email de login (deve ser único)
   - **Senha**: Senha temporária (mínimo 6 caracteres)
   - **Perfil**: Escolha entre Admin, Gerente ou Barbeiro
   - **Vincular ao Barbeiro**: (opcional) Selecione um barbeiro da lista
4. Clique em **"Salvar"**

### Exemplo: Criar um novo barbeiro
```
Nome: João Silva
Email: joao@barberpro.com
Senha: joao123
Perfil: Barbeiro
Vincular: João Silva (barbeiro)
```

---

## 🔑 COMO ALTERAR SENHAS

### Alterar senha de outro usuário:
1. Acesse a aba **"Usuários"**
2. Encontre o usuário na lista
3. Clique no botão **"Senha"** (ícone de chave)
4. Digite a nova senha
5. Confirme a nova senha
6. Clique em **"Alterar"**

### Alterar sua própria senha:
Atualmente, apenas o admin master pode alterar senhas através do banco de dados:

```sql
-- No SQL Editor do Supabase
UPDATE public.system_users 
SET password_hash = crypt('NOVA_SENHA_AQUI', gen_salt('bf'))
WHERE email = 'seu@email.com';
```

---

## 📅 COMO FUNCIONA O AGENDAMENTO

### Para o Cliente:
1. Acessa a landing page
2. Clica em **"Agendar Agora"**
3. Escolhe o **serviço**
4. Escolhe o **barbeiro**
5. Escolhe a **data e horário** (apenas horários disponíveis)
6. Preenche seus dados (nome, telefone, email)
7. Confirma o agendamento

### Para o Admin/Barbeiro:
1. Novo agendamento aparece como **"Pendente"**
2. Pode **Confirmar** (fica azul)
3. Após o atendimento, **Concluir** (fica verde)
4. Ou **Cancelar** (fica vermelho)
5. Estatísticas do cliente são atualizadas automaticamente

---

## 🎯 FLUXO DE TRABALHO RECOMENDADO

### Dia a Dia do Barbeiro:
1. **Manhã**: Ver agenda do dia no Dashboard
2. **Durante o dia**: Confirmar agendamentos pendentes
3. **Após atendimento**: Marcar como "Concluído"
4. **Fim do dia**: Ver estatísticas e receita

### Gestão Semanal:
1. **Segunda**: Revisar agendamentos da semana
2. **Quarta**: Verificar clientes e estatísticas
3. **Sexta**: Planejar próximos dias
4. **Domingo**: Fechar caixa e ver receita total

---

## ⚙️ CONFIGURAÇÕES IMPORTANTES

### Alterar Senhas Padrão (RECOMENDADO)

Execute no SQL Editor do Supabase:

```sql
-- Alterar senha do admin
UPDATE public.system_users 
SET password_hash = crypt('SUA_NOVA_SENHA', gen_salt('bf'))
WHERE email = 'admin@barberpro.com';

-- Alterar senha do gerente
UPDATE public.system_users 
SET password_hash = crypt('SUA_NOVA_SENHA', gen_salt('bf'))
WHERE email = 'gerente@barberpro.com';

-- Alterar senha do barbeiro
UPDATE public.system_users 
SET password_hash = crypt('SUA_NOVA_SENHA', gen_salt('bf'))
WHERE email = 'barbeiro@barberpro.com';
```

---

## 🆘 PROBLEMAS COMUNS

### "Não consigo fazer login"
- ✅ Verifique se executou o SQL `supabase-users-clients.sql`
- ✅ Verifique se está usando as credenciais corretas
- ✅ Verifique se o email está correto (sem espaços)
- ✅ Tente usar o botão "Credenciais de Acesso" para preencher automaticamente

### "Não vejo os agendamentos"
- ✅ Clique no botão de atualizar (ícone de refresh) no topo
- ✅ Verifique se há agendamentos no banco de dados
- ✅ Verifique os filtros de status

### "Não consigo criar usuários"
- ✅ Você precisa estar logado como **admin@barberpro.com**
- ✅ Apenas o perfil "admin" pode gerenciar usuários
- ✅ Verifique se o email já existe (deve ser único)

---

## 📞 SUPORTE

Para problemas técnicos:
1. Verifique o console do navegador (F12)
2. Verifique os logs no Supabase
3. Consulte a documentação do Supabase

---

## 🎓 DICAS PROFISSIONAIS

### Para o Barbeiro Chefe:
1. **Crie usuários individuais** para cada barbeiro
2. **Vincule cada usuário** ao barbeiro correspondente
3. **Altere as senhas padrão** imediatamente
4. **Revise os agendamentos** diariamente
5. **Acompanhe as estatísticas** dos clientes

### Para Melhor Experiência:
1. Use um navegador moderno (Chrome, Firefox, Edge)
2. Mantenha o sistema atualizado
3. Faça backup regular do banco de dados
4. Treine sua equipe no uso do sistema

---

## 📊 RELATÓRIOS E ESTATÍSTICAS

O sistema gera automaticamente:
- ✅ Total de agendamentos por dia
- ✅ Receita total (apenas agendamentos concluídos)
- ✅ Estatísticas por cliente
- ✅ Agenda do dia em tempo real
- ✅ Histórico de logins dos usuários

---

## 🔒 SEGURANÇA

- ✅ Senhas criptografadas com bcrypt
- ✅ Row Level Security (RLS) habilitado
- ✅ Sessão expira ao fechar o navegador
- ✅ Conexão HTTPS
- ✅ Validação de credenciais no servidor

---

**🎉 Sistema pronto para uso profissional!**

Desenvolvido com ❤️ usando React, TypeScript, Supabase e Tailwind CSS
