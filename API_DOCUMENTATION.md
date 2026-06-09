# IPTV Manager - Documentação da API

## Visão Geral

Esta é a documentação completa da API do IPTV Manager, um sistema completo de gerenciamento de IPTV com funcionalidades de autenticação, assinaturas, recompensas, indicações e muito mais.

**Base URL:** `http://localhost:3001/api`

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header `Authorization` como `Bearer <token>`.

### Endpoints de Autenticação

#### POST /auth/register
Registra um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "phone": "+5511999999999"
}
```

**Response:**
```json
{
  "message": "Conta criada com sucesso",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "client"
  }
}
```

#### POST /auth/login
Faz login do usuário.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "client"
  }
}
```

## Endpoints Públicos

#### GET /health
Verifica o status da API.

**Response:**
```json
{
  "status": "OK",
  "message": "IPTV Manager API is running"
}
```

#### GET /plans
Retorna os planos de assinatura disponíveis.

**Response:**
```json
{
  "plans": [
    {
      "id": "uuid",
      "name": "Plano Básico",
      "description": "Acesso básico",
      "price": 29.90,
      "duration_days": 30,
      "max_devices": 1,
      "features": ["HD Quality", "Mobile Access"],
      "is_popular": false,
      "is_active": true
    }
  ]
}
```

## Endpoints Protegidos (Requer Autenticação)

### Perfil do Usuário

#### GET /user/profile
Retorna o perfil do usuário logado.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "client",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z",
    "client": {
      "id": "uuid",
      "phone": "+5511999999999",
      "referral_code": "JOA123456",
      "total_points": 150,
      "total_referrals": 3
    }
  }
}
```

#### GET /dashboard/stats
Retorna estatísticas do dashboard.

**Headers:** `Authorization: Bearer <token>`

**Response (Cliente):**
```json
{
  "stats": {
    "subscription": {
      "id": "uuid",
      "status": "active",
      "plan_name": "Plano Premium",
      "end_date": "2024-02-01T00:00:00.000Z",
      "days_remaining": 15
    },
    "totalPoints": 150,
    "totalReferrals": 3
  }
}
```

**Response (Admin):**
```json
{
  "stats": {
    "totalUsers": 1250,
    "activeSubscriptions": 980,
    "totalRevenue": 45000.00
  }
}
```

## Endpoints do Cliente

### Recompensas

#### GET /client/rewards
Retorna recompensas disponíveis e histórico de resgates.

**Response:**
```json
{
  "totalPoints": 150,
  "rewards": [
    {
      "id": "uuid",
      "name": "Desconto 10%",
      "description": "10% de desconto na próxima mensalidade",
      "points_required": 100,
      "reward_type": "discount",
      "reward_value": 10.00,
      "is_active": true
    }
  ],
  "redemptions": [
    {
      "id": "uuid",
      "reward_name": "Desconto 10%",
      "points_used": 100,
      "status": "approved",
      "redeemed_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST /client/rewards/:id/redeem
Resgata uma recompensa.

**Response:**
```json
{
  "message": "Recompensa resgatada com sucesso",
  "id": "redemption_uuid"
}
```

### Indicações

#### GET /client/referrals
Retorna informações sobre indicações.

**Response:**
```json
{
  "referralCode": "JOA123456",
  "totalReferrals": 3,
  "referrals": [
    {
      "id": "uuid",
      "referred_name": "Maria Silva",
      "referred_email": "maria@email.com",
      "status": "completed",
      "reward_points": 50,
      "created_at": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

#### POST /client/referrals
Cria uma nova indicação usando código de referência.

**Body:**
```json
{
  "referral_code": "ABC123456"
}
```

### Assinaturas

#### GET /client/subscriptions
Retorna assinaturas do cliente.

**Response:**
```json
{
  "subscriptions": [
    {
      "id": "uuid",
      "status": "active",
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-02-01T00:00:00.000Z",
      "plan_name": "Plano Premium",
      "max_devices": 3,
      "days_remaining": 15
    }
  ]
}
```

### Notificações

#### GET /client/notifications
Retorna notificações do cliente.

**Query Parameters:**
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `unread_only` (opcional): Apenas não lidas (true/false)

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Assinatura Renovada",
      "message": "Sua assinatura foi renovada com sucesso",
      "type": "success",
      "is_read": false,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "unreadCount": 5
}
```

#### PATCH /client/notifications/:id/read
Marca uma notificação como lida.

#### PATCH /client/notifications/read-all
Marca todas as notificações como lidas.

## Endpoints Administrativos (Requer role: admin)

### Gerenciamento de Usuários

#### GET /admin/users
Retorna lista de usuários com paginação e filtros.

**Query Parameters:**
- `page` (opcional): Página
- `limit` (opcional): Itens por página
- `search` (opcional): Busca por nome ou email
- `role` (opcional): Filtro por role
- `status` (opcional): Filtro por status

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "role": "client",
      "status": "active",
      "phone": "+5511999999999",
      "total_points": 150,
      "total_referrals": 3,
      "active_subscriptions": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1250,
    "pages": 125
  }
}
```

#### PATCH /admin/users/:id/status
Atualiza o status de um usuário.

**Body:**
```json
{
  "status": "active" // active, inactive, suspended
}
```

### Gerenciamento de Assinaturas

#### GET /admin/subscriptions
Retorna lista de assinaturas.

**Query Parameters:**
- `page`, `limit`, `status`, `search`

#### POST /admin/subscriptions
Cria uma nova assinatura.

**Body:**
```json
{
  "client_id": "uuid",
  "plan_id": "uuid",
  "duration_days": 30,
  "price_paid": 29.90,
  "payment_method": "credit_card",
  "notes": "Assinatura manual"
}
```

#### PATCH /admin/subscriptions/:id/status
Atualiza status da assinatura.

### Gerenciamento de Recompensas

#### GET /admin/rewards
Retorna lista de recompensas.

#### POST /admin/rewards
Cria uma nova recompensa.

**Body:**
```json
{
  "name": "Desconto 15%",
  "description": "15% de desconto na próxima mensalidade",
  "points_required": 150,
  "reward_type": "discount", // discount, free_month, upgrade, cashback
  "reward_value": 15.00,
  "max_redemptions": 100,
  "valid_until": "2024-12-31T23:59:59.000Z"
}
```

#### PUT /admin/rewards/:id
Atualiza uma recompensa.

#### GET /admin/reward-redemptions
Retorna lista de resgates de recompensas.

#### PATCH /admin/reward-redemptions/:id/status
Atualiza status do resgate.

### Gerenciamento de Indicações

#### GET /admin/referrals
Retorna lista de indicações.

#### PATCH /admin/referrals/:id/status
Atualiza status da indicação e distribui pontos.

**Body:**
```json
{
  "status": "completed", // pending, completed, cancelled
  "reward_points": 50
}
```

### Relatórios

#### GET /admin/reports
Retorna relatórios administrativos.

**Query Parameters:**
- `period` (opcional): Período em dias (padrão: 30)

**Response:**
```json
{
  "revenue": [
    {
      "date": "2024-01-15",
      "revenue": 1500.00,
      "transactions": 50
    }
  ],
  "userGrowth": [
    {
      "date": "2024-01-15",
      "new_users": 25
    }
  ],
  "subscriptionStats": {
    "active": 980,
    "expired": 45,
    "cancelled": 12,
    "total": 1037
  },
  "topPlans": [
    {
      "name": "Plano Premium",
      "subscriptions": 450,
      "revenue": 22500.00
    }
  ]
}
```

### Configurações do Sistema

#### GET /admin/settings
Retorna configurações do sistema.

#### PUT /admin/settings
Atualiza configurações do sistema.

**Body:**
```json
{
  "settings": {
    "app_name": "IPTV Manager",
    "logo_url": "https://example.com/logo.png",
    "referral_points": 50,
    "max_devices_per_plan": 5,
    "maintenance_mode": false
  }
}
```

### Gerenciamento de Planos

#### GET /admin/plans
Retorna todos os planos (incluindo inativos).

#### POST /admin/plans
Cria um novo plano.

#### PUT /admin/plans/:id
Atualiza um plano.

#### DELETE /admin/plans/:id
Exclui um plano (apenas se não houver assinaturas ativas).

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Tipos de Dados

### User Roles
- `admin` - Administrador
- `client` - Cliente

### User Status
- `active` - Ativo
- `inactive` - Inativo
- `suspended` - Suspenso

### Subscription Status
- `pending` - Pendente
- `active` - Ativa
- `expired` - Expirada
- `cancelled` - Cancelada
- `suspended` - Suspensa

### Reward Types
- `discount` - Desconto
- `free_month` - Mês grátis
- `upgrade` - Upgrade de plano
- `cashback` - Cashback

### Referral Status
- `pending` - Pendente
- `completed` - Concluída
- `cancelled` - Cancelada

### Notification Types
- `info` - Informação
- `success` - Sucesso
- `warning` - Aviso
- `error` - Erro

## Exemplos de Uso

### Autenticação Completa
```bash
# 1. Registrar usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@email.com","password":"senha123"}'

# 2. Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"senha123"}'

# 3. Usar token para acessar perfil
curl -X GET http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Resgate de Recompensa
```bash
# 1. Ver recompensas disponíveis
curl -X GET http://localhost:3001/api/client/rewards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Resgatar recompensa
curl -X POST http://localhost:3001/api/client/rewards/REWARD_ID/redeem \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Segurança

- Todas as senhas são criptografadas com bcrypt
- Tokens JWT têm expiração configurável
- Validação de entrada em todos os endpoints
- Controle de acesso baseado em roles
- Logs de atividade para auditoria

## Banco de Dados

O sistema utiliza MySQL 8.0 com as seguintes tabelas principais:
- `users` - Usuários do sistema
- `clients` - Dados específicos de clientes
- `admins` - Dados específicos de administradores
- `subscription_plans` - Planos de assinatura
- `subscriptions` - Assinaturas ativas/históricas
- `payments` - Histórico de pagamentos
- `rewards` - Recompensas disponíveis
- `reward_redemptions` - Resgates de recompensas
- `referrals` - Sistema de indicações
- `notifications` - Notificações do sistema
- `activity_logs` - Logs de atividade
- `system_settings` - Configurações do sistema

## Desenvolvimento

Para executar o backend em desenvolvimento:

```bash
# Instalar dependências
npm install

# Executar apenas a API
npm run dev:api

# Executar aplicação completa (frontend + backend)
npm run dev
```

## Docker

O projeto inclui configuração Docker completa:

```bash
# Executar com Docker
docker-compose up -d

# Verificar logs
docker logs iptv-app

# Acessar banco de dados via phpMyAdmin
# http://localhost:8080
```

---

**Versão da API:** 1.0.0  
**Última atualização:** Janeiro 2024