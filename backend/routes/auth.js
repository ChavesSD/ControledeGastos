const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { loginLimiter } = require('../middleware/security');

// Função para criar primeiro usuário admin (apenas em desenvolvimento)
async function createAdminUser() {
  try {
    const adminCount = await User.countDocuments();
    if (adminCount === 0 && process.env.NODE_ENV === 'development') {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = new User({
        email: 'admin@gastos.com',
        password: hashedPassword,
        name: 'Administrador'
      });
      await adminUser.save();
      console.log('✅ Usuário administrador criado para desenvolvimento');
      console.log('📧 Email: admin@gastos.com');
      console.log('🔑 Senha: admin123');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}

// Criar usuário admin apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  createAdminUser();
}

// Rota de login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário no banco
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Criar sessão
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    res.json({ 
      success: true, 
      message: 'Login realizado com sucesso!',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// Rota de logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao fazer logout' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Logout realizado com sucesso!' 
    });
  });
});

// Rota para verificar se está logado
router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({ 
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ 
      authenticated: false 
    });
  }
});

module.exports = router; 