const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { loginLimiter } = require('../middleware/security');

// Função para criar usuários padrão se não existirem
async function createDefaultUsers() {
  try {
    const userCount = await User.countDocuments();
    console.log(`📊 Total de usuários no banco: ${userCount}`);
    
    if (userCount === 0) {
      console.log('🚀 Criando usuários padrão...');
      
      // Usuário 1: deyvison@gastos.com
      const deyvison = new User({
        email: 'deyvison@gastos.com',
        password: await bcrypt.hash('deyvison!', 10),
        name: 'Deyvison'
      });
      await deyvison.save();
      console.log('✅ Usuário criado: deyvison@gastos.com');
      
      // Usuário 2: kallenya@gastos.com  
      const kallenya = new User({
        email: 'kallenya@gastos.com',
        password: await bcrypt.hash('kallenya!', 10),
        name: 'Kallenya'
      });
      await kallenya.save();
      console.log('✅ Usuário criado: kallenya@gastos.com');
      
      // Usuário admin (em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        const admin = new User({
          email: 'admin@gastos.com',
          password: await bcrypt.hash('admin123', 10),
          name: 'Administrador'
        });
        await admin.save();
        console.log('✅ Usuário admin criado para desenvolvimento');
      }
      
      console.log('🎉 Usuários padrão criados com sucesso!');
    } else {
      console.log('👥 Usuários já existem no banco de dados');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuários padrão:', error);
  }
}

// Criar usuários padrão (em qualquer ambiente)
createDefaultUsers();

// Rota de login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Tentativa de login para: ${email}`);

    if (!email || !password) {
      console.log('❌ Email ou senha não fornecidos');
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }

    // Verificar conexão com banco
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total de usuários no banco: ${totalUsers}`);

    // Buscar usuário no banco
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(`👤 Usuário encontrado: ${user ? 'Sim' : 'Não'}`);
    
    if (!user) {
      console.log(`❌ Usuário não encontrado: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`🔑 Senha válida: ${isValidPassword ? 'Sim' : 'Não'}`);
    
    if (!isValidPassword) {
      console.log(`❌ Senha incorreta para: ${email}`);
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

    console.log(`✅ Login bem-sucedido para: ${email}`);
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
    console.error('❌ Erro detalhado no login:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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