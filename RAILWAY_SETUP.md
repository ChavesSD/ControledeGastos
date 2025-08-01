# 🚂 Configuração Railway - Variáveis de Ambiente

## ⚠️ IMPORTANTE: Configure as seguintes variáveis no Railway Dashboard

### 📋 Variáveis Obrigatórias:

1. **`MONGODB_URI`** *(OBRIGATÓRIO)*
   ```
   mongodb+srv://usuario:senha@cluster.mongodb.net/controle_gastos
   ```
   - Obtenha no [MongoDB Atlas](https://cloud.mongodb.com)
   - Crie cluster gratuito
   - Copie a connection string

2. **`NODE_ENV`** 
   ```
   production
   ```

3. **`SESSION_SECRET`** 
   ```
   sua-chave-secreta-super-segura-2024
   ```
   - Use uma string aleatória e segura

4. **`PORT`** *(Automático)*
   ```
   Configurado automaticamente pelo Railway
   ```

### 🏃‍♂️ Como configurar no Railway:

1. Acesse seu projeto no Railway
2. Vá em **Variables** 
3. Adicione cada variável acima
4. Clique **Deploy** para aplicar

### 👥 Usuários Padrão (Criados Automaticamente):

- **Email:** `deyvison@gastos.com` | **Senha:** `deyvison!`
- **Email:** `kallenya@gastos.com` | **Senha:** `kallenya!`

### 🔍 Verificar Logs:

```bash
# No Railway Dashboard > View Logs
```

### ✅ Após configurar as variáveis, o sistema irá:

1. Conectar no MongoDB Atlas
2. Criar usuários padrão automaticamente  
3. Exibir logs detalhados de conexão
4. Permitir login normalmente

### 🆘 Se ainda der erro:

1. Verifique se MONGODB_URI está correto
2. Verifique se IP está liberado no MongoDB Atlas
3. Verifique logs no Railway para detalhes