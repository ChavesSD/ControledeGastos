const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
require('dotenv').config();

// Import security middleware
const { apiLimiter, validateInput, securityHeaders } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(securityHeaders);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
app.use('/api', apiLimiter);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(validateInput);
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'gastos-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // HTTPS em produção
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Conexão com MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/controle_gastos';

console.log('🔍 Configurações do ambiente:');
console.log(`📊 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🗄️ MONGODB_URI: ${process.env.MONGODB_URI ? 'Configurado' : 'NÃO CONFIGURADO'}`);
console.log(`🔐 SESSION_SECRET: ${process.env.SESSION_SECRET ? 'Configurado' : 'Usando padrão'}`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado ao MongoDB com sucesso!');
  console.log(`🌐 Database: ${mongoose.connection.name}`);
})
.catch((err) => {
  console.error('❌ Erro ao conectar com MongoDB:', err);
  console.error('💡 Verifique se MONGODB_URI está configurado corretamente no Railway');
});

// Importar rotas
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// Rota principal - servir o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Middleware para verificar autenticação
function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Acesso negado. Faça login primeiro.' });
  }
}

// Rota protegida para verificar se usuário está logado
app.get('/api/verify-auth', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
}); 