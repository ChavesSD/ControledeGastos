# 🚀 Guia de Deploy - Sistema de Controle de Gastos

## 📋 Pré-requisitos

- Node.js 16+ 
- MongoDB (local ou Atlas)
- Git

## 🔧 Configuração para Produção

### 1. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

**Edite o arquivo `.env`:**

```env
# Configurações do servidor
PORT=3000

# MongoDB Atlas (OBRIGATÓRIO para produção)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/controle_gastos

# Chave secreta forte (OBRIGATÓRIO)
SESSION_SECRET=sua-chave-super-secreta-de-32-caracteres-ou-mais

# Ambiente
NODE_ENV=production

# Domínios permitidos (opcional)
ALLOWED_ORIGINS=https://seudominio.com
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Criar Primeiro Usuário

Na primeira execução em ambiente de desenvolvimento, um usuário admin será criado automaticamente:

```
Email: admin@gastos.com
Senha: admin123
```

**⚠️ IMPORTANTE:** Altere esta senha imediatamente após o primeiro login!

## 🌐 Deploy em Diferentes Plataformas

### Railway

1. **Conectar repositório GitHub no Railway**
2. **Configurar variáveis de ambiente no dashboard**
3. **Deploy automático a cada push**

### DigitalOcean/VPS

1. **Conectar ao servidor:**
   ```bash
   ssh usuario@seu-servidor
   ```

2. **Clonar repositório:**
   ```bash
   git clone https://github.com/seu-usuario/controle-gastos.git
   cd controle-gastos
   ```

3. **Instalar dependências:**
   ```bash
   npm install
   ```

4. **Configurar .env** (como mostrado acima)

5. **Instalar PM2:**
   ```bash
   npm install -g pm2
   ```

6. **Iniciar aplicação:**
   ```bash
   pm2 start backend/server.js --name "controle-gastos"
   pm2 startup
   pm2 save
   ```

### Vercel/Netlify (Frontend + Serverless)

**Nota:** Estas plataformas são melhores para frontend estático. Para o backend, use Railway ou VPS.

## 🔒 Configurações de Segurança

### MongoDB Atlas

1. **Criar cluster gratuito**
2. **Configurar Network Access:**
   - Adicionar IP da aplicação
   - Ou `0.0.0.0/0` para qualquer IP (menos seguro)

3. **Criar usuário do banco:**
   - Database Access → Add New Database User
   - Permissões: Read and write to any database

### SSL/HTTPS

Para produção, configure sempre HTTPS:

- **Railway:** HTTPS automático
- **VPS:** Use nginx + Let's Encrypt

## 📊 Monitoramento

### Logs da Aplicação

```bash
# Railway
railway logs

# PM2
pm2 logs controle-gastos

# Railway
railway logs
```

### Métricas

- **CPU/Memória:** Railway dashboard
- **Database:** MongoDB Atlas dashboard
- **Uptime:** UptimeRobot, Pingdom

## 🔄 Atualizações

### Deploy Automático

Configure GitHub Actions ou use webhooks da plataforma para deploy automático.

### Deploy Manual

```bash
git pull origin main
npm install
pm2 restart controle-gastos  # Para VPS
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão MongoDB:**
   - Verificar string de conexão
   - Verificar IP whitelist no Atlas
   - Verificar credenciais

2. **Erro de sessão:**
   - Verificar SESSION_SECRET
   - Verificar configuração HTTPS

3. **Erro 500:**
   - Verificar logs da aplicação
   - Verificar variáveis de ambiente

### Comandos Úteis

```bash
# Verificar status
pm2 status

# Restart aplicação
pm2 restart controle-gastos

# Ver logs em tempo real
pm2 logs controle-gastos --lines 50

# Monitorar recursos
pm2 monit
```

## 📱 Pós-Deploy

1. **Testar todas as funcionalidades**
2. **Criar backup do banco**
3. **Configurar monitoramento**
4. **Documentar acessos**

---

**🎉 Seu sistema está no ar!** 

Acesse: `https://seudominio.com` e faça o primeiro login com:
- Email: `admin@gastos.com`
- Senha: `admin123`

**Não esqueça de alterar a senha!**