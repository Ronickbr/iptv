# Instruções para Testar as Indicações

## Problema Identificado
O sistema de indicações está funcionando corretamente no código, mas não há dados de exemplo no banco de dados para exibir na interface.

## Solução Implementada
Foi adicionado dados de exemplo no arquivo `database/seed.sql` para demonstrar o funcionamento das indicações.

## Como Executar

### 1. Configurar o Banco de Dados
```bash
# Conecte-se ao MySQL e execute:
mysql -u root -p

# Crie o banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS iptv_manager;
USE iptv_manager;

# Execute o schema
source database/schema.sql;

# Execute os dados de exemplo
source database/seed.sql;
```

### 2. Iniciar o Servidor Backend
```bash
# Instale as dependências (se necessário)
npm install

# Inicie o servidor
npm run dev
# ou
node server/index.js
```

### 3. Iniciar o Frontend
```bash
# Em outro terminal
npm run dev
```

## Dados de Exemplo Criados

### Usuários de Teste:
- **Rafael Silva** (rafael@email.com) - Usuário que fez indicações
  - Código de indicação: `RAFAEL2024`
  - Total de indicações: 2 (concluídas)
  - Pontos ganhos: 250

- **Maria Santos** (maria@email.com) - Indicada por Rafael
  - Status: Concluída
  - Pontos ganhos por Rafael: 100

- **João Oliveira** (joao@email.com) - Indicado por Rafael
  - Status: Concluída
  - Pontos ganhos por Rafael: 100

- **Ana Costa** (ana@email.com) - Indicação pendente
  - Status: Pendente
  - Pontos: 0 (aguardando aprovação)

### Para Testar:
1. Faça login como Rafael (rafael@email.com, senha: password)
2. Acesse a página "Indicações" no menu lateral
3. Vá para a aba "Minhas Indicações"
4. Você verá as 3 indicações listadas com seus respectivos status

## Funcionalidades Verificadas

✅ **API Backend**: Rota `/api/client/referrals` funcionando corretamente
✅ **Frontend**: Página de indicações renderizando dados corretamente
✅ **Banco de Dados**: Estrutura das tabelas `referrals` e `point_transactions` corretas
✅ **Dados de Exemplo**: Criados para demonstrar o funcionamento

## Observações

- O sistema está funcionando corretamente
- O problema era apenas a falta de dados de exemplo
- Todas as funcionalidades de indicação estão implementadas:
  - Visualização de indicações
  - Códigos de indicação
  - Sistema de pontos
  - Status das indicações (pendente, concluída, cancelada)
  - Histórico de transações de pontos

## Senha Padrão
Todos os usuários de exemplo usam a senha: `password`
(Hash: `$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O`)