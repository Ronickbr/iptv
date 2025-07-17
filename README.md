# IPTV Manager

Um sistema completo de gerenciamento de IPTV desenvolvido com Next.js, React, Node.js e MySQL.

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Banco de Dados**: MySQL 8.0
- **Autenticação**: JWT (JSON Web Tokens)
- **Containerização**: Docker & Docker Compose
- **UI/UX**: Framer Motion, Lucide React Icons

## 📋 Funcionalidades

### Landing Page
- Design moderno e responsivo
- Seção de recursos e benefícios
- Planos de assinatura
- Formulários de login e registro

### Sistema de Autenticação
- Registro de usuários
- Login seguro com JWT
- Diferentes níveis de acesso (Admin/Cliente)

### Gerenciamento de Usuários
- Perfis de administradores e clientes
- Sistema de indicações com recompensas
- Controle de dispositivos por usuário

### Planos e Assinaturas
- Múltiplos planos de assinatura
- Renovação automática
- Histórico de pagamentos

### Sistema de Recompensas
- Pontos por indicações
- Resgates de recompensas
- Descontos e benefícios

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)

### Executando com Docker

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd iptv-manager
```

2. Inicie os serviços:
```bash
docker-compose up -d
```

3. Acesse as aplicações:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **phpMyAdmin**: http://localhost:8080

### Desenvolvimento Local

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

3. Execute o desenvolvimento:
```bash
npm run dev
```

## 🗄️ Banco de Dados

### Credenciais Padrão
- **Host**: localhost:3306
- **Usuário**: iptv_user
- **Senha**: iptv_password
- **Banco**: iptv_manager
- **Root**: iptv_root_password

### Estrutura
O banco de dados inclui as seguintes tabelas principais:
- `users` - Usuários do sistema
- `clients` - Dados dos clientes
- `admins` - Dados dos administradores
- `subscription_plans` - Planos de assinatura
- `subscriptions` - Assinaturas ativas
- `channels` - Canais de TV
- `payments` - Histórico de pagamentos
- `devices` - Dispositivos dos clientes
- `referrals` - Sistema de indicações
- `rewards` - Recompensas disponíveis

## 🔐 Autenticação

### Usuários de Teste
- **Admin**: admin@iptv.com / secret
- **Cliente**: joao@email.com / secret

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login

### Usuários
- `GET /api/user/profile` - Perfil do usuário (protegido)

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas (protegido)

### Planos
- `GET /api/plans` - Lista de planos

### Canais
- `GET /api/channels` - Canais disponíveis (protegido)

## 🎨 Interface

### Páginas Principais
- `/` - Landing page
- `/login` - Página de login
- `/register` - Página de registro

### Componentes
- Header responsivo
- Formulários com validação
- Cards de planos
- Seções de recursos
- Footer informativo

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Banco de Dados
DB_HOST=mysql
DB_PORT=3306
DB_USER=iptv_user
DB_PASSWORD=iptv_password
DB_NAME=iptv_manager

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# API
API_URL=http://localhost:3001
```

## 🚀 Deploy

### Produção
1. Configure as variáveis de ambiente para produção
2. Build da aplicação:
```bash
npm run build
```
3. Execute com Docker Compose em modo produção

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas, entre em contato através do email: kmkz.clan@gmail.com
