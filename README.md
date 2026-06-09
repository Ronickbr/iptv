# IPTV Manager

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-20232a?logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479a1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Frontend_Ready-000000?logo=vercel&logoColor=white)](https://vercel.com/)

Sistema de gerenciamento de IPTV com `Next.js` no frontend, `Express` no backend e `MySQL` como banco de dados.

## Visao Geral
- `Frontend`: App Router com `Next.js 14`, `React 18`, `TypeScript` e `Tailwind CSS`
- `Backend`: API REST em `Express`
- `Banco`: `MySQL 8`
- `Auth`: cookie `HttpOnly` + JWT
- `Deploy local`: `npm` ou `Docker Compose`
- `Deploy Vercel`: frontend no `Vercel` + backend separado

## Arquitetura
- `src/`: frontend Next.js
- `server/`: API Express
- `database/`: schema e seed do MySQL
- `scripts/`: utilitarios de apoio
- `docker-compose.yml`: ambiente local com app + MySQL

## O Que Foi Mantido
- Apenas arquivos necessarios para:
- rodar localmente com `npm`
- rodar localmente com `Docker Compose`
- publicar o frontend no `Vercel`
- manter o backend Express e o banco fora do Vercel

## O Que Foi Removido
- documentacao duplicada e espalhada
- scripts antigos de deploy por shell/PowerShell
- stack separada de deploy `prod` baseada em Docker
- arquivos sem uso direto no fluxo atual

## Requisitos
- `Node.js 18+`
- `npm 9+`
- `MySQL 8+`

Opcional:
- `Docker` e `Docker Compose`

## Variaveis De Ambiente
Use `.env.example` como base.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=iptv_user
DB_PASSWORD=iptv_password
DB_NAME=iptv_manager

JWT_SECRET=replace-with-a-random-secret-with-at-least-32-characters
JWT_EXPIRES_IN=7d

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-secret-with-at-least-32-characters

API_URL=http://localhost:3001
APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
SESSION_COOKIE_SECURE=false
```

## Deploy Local Com Npm
### 1. Instale as dependencias

```bash
npm install
```

### 2. Configure o ambiente

```bash
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Depois ajuste ao menos:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`

### 3. Crie o banco
Execute os arquivos abaixo no seu MySQL:
- `database/schema.sql`
- `database/seed.sql`

### 4. Rode o projeto

```bash
npm run dev
```

### 5. Acesse
- `Frontend`: [http://localhost:3000](http://localhost:3000)
- `API`: [http://localhost:3001/api/health](http://localhost:3001/api/health)

## Deploy Local Com Docker
Esse fluxo sobe apenas o que e essencial: `app + mysql`.

### 1. Suba os containers

```bash
docker-compose up --build
```

### 2. Acesse
- `Frontend`: [http://localhost:3000](http://localhost:3000)
- `API`: [http://localhost:3001/api/health](http://localhost:3001/api/health)
- `MySQL`: `localhost:3306`

## Deploy No Vercel
Importante: o `Vercel` publica muito bem o frontend `Next.js`, mas nao deve hospedar este backend `Express` como um processo persistente no mesmo formato atual.

### Estrategia recomendada
- publique o `frontend` no `Vercel`
- publique o `backend` `server/index.js` em outro provedor
- use um `MySQL` acessivel pelo backend

Boas opcoes para o backend:
- `Railway`
- `Render`
- `Fly.io`
- `DigitalOcean`
- VPS propria

### Fluxo recomendado
1. Suba o backend Express em um host separado.
2. Configure o banco MySQL para esse backend.
3. No Vercel, conecte este repositorio.
4. Defina no projeto Vercel:

```env
API_URL=https://sua-api.exemplo.com
NEXTAUTH_URL=https://seu-frontend.vercel.app
APP_URL=https://seu-frontend.vercel.app
CORS_ORIGIN=https://seu-frontend.vercel.app
SESSION_COOKIE_SECURE=true
JWT_SECRET=uma-chave-forte-com-32-caracteres-ou-mais
NEXTAUTH_SECRET=uma-chave-forte-com-32-caracteres-ou-mais
```

### Observacoes importantes
- o rewrite em `next.config.js` envia `/api/*` para `API_URL`
- em producao, `API_URL` precisa apontar para a sua API real
- o backend deve aceitar `CORS_ORIGIN` com o dominio do Vercel
- `SESSION_COOKIE_SECURE=true` deve ser usado com HTTPS

## Scripts Disponiveis
- `npm run dev`: frontend + backend juntos
- `npm run dev:next`: apenas Next.js
- `npm run dev:api`: apenas API Express
- `npm run dev:api:wait`: API aguardando MySQL
- `npm run build`: build do frontend
- `npm run start`: sobe o frontend buildado
- `npm run lint`: lint do projeto

## Usuarios De Teste
- `Admin`: `admin@iptv.com / secret`

## Estrutura Do Projeto

```text
.
|-- database/
|   |-- schema.sql
|   `-- seed.sql
|-- scripts/
|   `-- wait-for-db.js
|-- server/
|   `-- index.js
|-- src/
|   |-- app/
|   `-- lib/
|-- .env.example
|-- Dockerfile
|-- docker-compose.yml
|-- next.config.js
`-- package.json
```

## Checklist De Deploy
### Local
- dependencias instaladas
- MySQL rodando
- `.env.local` configurado
- schema importado
- `npm run dev` ou `docker-compose up`

### Vercel
- frontend publicado
- backend publicado separadamente
- `API_URL` apontando para a API correta
- `CORS_ORIGIN` configurado
- segredos fortes configurados
- cookies seguros habilitados em producao

## Status Atual
- estrutura simplificada para deploy local e Vercel
- arquivos legados de deploy por Docker em producao removidos
- documentacao centralizada neste README

## Licenca
Uso interno ou conforme a licenca definida pelo proprietario do projeto.
