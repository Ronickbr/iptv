# 🚀 IPTV Manager - Guia de Deploy para Produção

Este guia contém instruções detalhadas para fazer o deploy da aplicação IPTV Manager em ambiente de produção.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Servidor com pelo menos 2GB RAM e 10GB de espaço em disco
- Domínio configurado (opcional, mas recomendado)
- Certificado SSL/TLS (recomendado para produção)

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.production .env.prod

# Edite as variáveis de ambiente
nano .env.prod
```

**Variáveis importantes para alterar:**

```env
# Database - Use senhas seguras!
DB_PASSWORD=sua_senha_segura_aqui
DB_ROOT_PASSWORD=sua_senha_root_segura_aqui

# JWT - Gere uma chave secreta forte
JWT_SECRET=sua-chave-jwt-super-secreta-para-producao

# Next.js - Configure seu domínio
NEXTAUTH_URL=https://seudominio.com
NEXTAUTH_SECRET=sua-chave-nextauth-secreta

# CORS - Configure seu domínio
CORS_ORIGIN=https://seudominio.com
```

### 2. Gerar Chaves Secretas Seguras

```bash
# Para JWT_SECRET
openssl rand -base64 32

# Para NEXTAUTH_SECRET
openssl rand -base64 32
```

## 🚀 Deploy

### Opção 1: Script Automático (Recomendado)

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Opção 2: Deploy Manual

```bash
# 1. Parar containers existentes
docker-compose -f docker-compose.prod.yml down

# 2. Build das imagens
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

# 4. Verificar status
docker-compose -f docker-compose.prod.yml ps
```

## 🔍 Verificação do Deploy

### Verificar Serviços
```bash
# Status dos containers
docker-compose -f docker-compose.prod.yml ps

# Logs da aplicação
docker-compose -f docker-compose.prod.yml logs app

# Logs do banco de dados
docker-compose -f docker-compose.prod.yml logs mysql
```

### Testar Conectividade
```bash
# Testar API
curl http://localhost:3001/api/health

# Testar Frontend
curl http://localhost:3000
```

## 🌐 Configuração de Domínio e SSL

### 1. Configurar Nginx (Recomendado)

Crie um arquivo de configuração do Nginx:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Configurar Let's Encrypt (SSL Gratuito)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

## 📊 Monitoramento

### Logs em Tempo Real
```bash
# Todos os serviços
docker-compose -f docker-compose.prod.yml logs -f

# Apenas a aplicação
docker-compose -f docker-compose.prod.yml logs -f app
```

### Verificar Uso de Recursos
```bash
# Uso de CPU e memória
docker stats

# Espaço em disco
docker system df
```

## 🔄 Backup e Restauração

### Backup do Banco de Dados
```bash
# Criar backup
docker exec iptv-mysql-prod mysqldump -u root -p iptv_manager > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i iptv-mysql-prod mysql -u root -p iptv_manager < backup_file.sql
```

### Backup dos Volumes
```bash
# Backup do volume do MySQL
docker run --rm -v iptv_mysql_prod_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

## 🛠️ Manutenção

### Atualizar Aplicação
```bash
# 1. Fazer backup
./backup.sh

# 2. Baixar nova versão
git pull origin main

# 3. Rebuild e restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Limpeza do Sistema
```bash
# Remover imagens não utilizadas
docker image prune -a

# Remover volumes não utilizados
docker volume prune

# Limpeza completa do sistema
docker system prune -a --volumes
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Container não inicia:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs app
   ```

2. **Erro de conexão com banco:**
   - Verificar se o MySQL está rodando
   - Verificar credenciais no .env.production

3. **Erro 502 Bad Gateway:**
   - Verificar se a aplicação está rodando na porta correta
   - Verificar configuração do proxy reverso

4. **Problemas de performance:**
   - Verificar uso de recursos: `docker stats`
   - Aumentar recursos do servidor se necessário

### Comandos Úteis

```bash
# Reiniciar apenas a aplicação
docker-compose -f docker-compose.prod.yml restart app

# Acessar container da aplicação
docker exec -it iptv-app-prod sh

# Acessar MySQL
docker exec -it iptv-mysql-prod mysql -u root -p

# Verificar portas em uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
```

## 📞 Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs: `docker-compose -f docker-compose.prod.yml logs`
2. Consulte a documentação oficial do Docker
3. Verifique as configurações de rede e firewall
4. Certifique-se de que todas as variáveis de ambiente estão configuradas corretamente

---

**⚠️ Importante:** Sempre faça backup antes de fazer deploy em produção!