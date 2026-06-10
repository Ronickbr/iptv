# IPTV Manager

Aplicacao full stack com `Next.js 14`, `Express` e `MySQL` para gerenciamento de clientes, assinaturas, indicacoes, recompensas e painel administrativo.

## Stack

- `Next.js 14` com `TypeScript` e `Tailwind CSS`
- `Express` como API interna
- `MySQL 8`
- Autenticacao por sessao com cookie `HttpOnly`
- Deploy recomendado no `Dokploy` com `Railpack`

## Estrutura

- `src/`: frontend e dashboards
- `server/index.js`: API Express
- `server/start-production.js`: entrypoint de producao que sobe `Next.js` + API
- `database/schema.sql`: estrutura inicial do banco
- `database/seed.sql`: dados de exemplo para ambiente local
- `railpack.json`: configuracao base para build via Railpack

## Desenvolvimento Local

1. Suba o banco:

```bash
docker compose up -d
```

2. Copie as variaveis:

```bash
copy .env.example .env
```

3. Instale as dependencias e rode a aplicacao:

```bash
npm install
npm run dev
```

4. Acesse:

- App: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001/api/health](http://localhost:3001/api/health)
- phpMyAdmin opcional: [http://localhost:8080](http://localhost:8080)

## Deploy no Dokploy

1. Crie um banco MySQL no proprio Dokploy ou use um banco externo.
2. Crie uma aplicacao do tipo `Application`.
3. Conecte este repositorio Git.
4. Em `Build Type`, selecione `Railpack`.
5. Opcionalmente fixe uma versao do Railpack no painel.
6. Use o arquivo [`.env.dokploy.example`](file:///d:/Sites/KMKZIPTV-v2/.env.dokploy.example) como base e configure as variaveis no painel.
7. Faça o deploy.

### Variaveis recomendadas

```env
NODE_ENV=production
PORT=3000
API_PORT=3001

DB_HOST=seu-host-mysql
DB_PORT=3306
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=iptv_manager

JWT_SECRET=gere-uma-chave-com-32-caracteres-ou-mais
JWT_EXPIRES_IN=7d

NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=gere-uma-chave-com-32-caracteres-ou-mais

APP_URL=https://seu-dominio.com
CORS_ORIGIN=https://seu-dominio.com
API_URL=http://127.0.0.1:3001
SESSION_COOKIE_SECURE=true
```

### Como funciona no Dokploy

- O container sobe o `Next.js` na porta publica `PORT`.
- A API Express sobe internamente em `API_PORT`.
- O frontend usa rewrite de `/api/*` para `API_URL`.
- Em producao, o padrao interno esperado e `http://127.0.0.1:3001`.

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm start
```

## Observacoes

- `npm start` usa o entrypoint de producao para iniciar web e API no mesmo container.
- O repositório foi limpo para manter apenas o que e util para desenvolvimento local e deploy no Dokploy.
- Se quiser separar frontend e API em dois servicos no futuro, o ideal e extrair a API para um servico independente.
