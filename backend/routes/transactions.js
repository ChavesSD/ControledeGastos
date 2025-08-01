const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Middleware para verificar autenticação
function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Acesso negado. Faça login primeiro.' });
  }
}

// Aplicar middleware de autenticação a todas as rotas
router.use(requireAuth);

// Obter todas as transações do usuário
router.get('/', async (req, res) => {
  try {
    const { type, startDate, endDate, category } = req.query;
    const userId = req.session.user.id;

    let filter = { userId };

    if (type) {
      filter.type = type;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (category) {
      filter.category = category;
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(100);

    res.json({ success: true, transactions });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Criar nova transação
router.post('/', async (req, res) => {
  try {
    const { type, description, amount, category, date } = req.body;
    const userId = req.session.user.id;

    if (!type || !description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    if (!['receita', 'gasto'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo deve ser "receita" ou "gasto"'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve ser maior que zero'
      });
    }

    const transaction = new Transaction({
      userId,
      type,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date(date)
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Transação criada com sucesso!',
      transaction
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Atualizar transação
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, amount, category, date } = req.body;
    const userId = req.session.user.id;

    const transaction = await Transaction.findOne({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    if (type) transaction.type = type;
    if (description) transaction.description = description;
    if (amount) transaction.amount = parseFloat(amount);
    if (category) transaction.category = category;
    if (date) transaction.date = new Date(date);
    transaction.updatedAt = new Date();

    await transaction.save();

    res.json({
      success: true,
      message: 'Transação atualizada com sucesso!',
      transaction
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Deletar transação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Transação deletada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Obter categorias mais usadas
router.get('/categories', async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    const categories = await Transaction.aggregate([
      { $match: { userId: new require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router; 