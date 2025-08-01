const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

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

// Resumo geral
router.get('/summary', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id);
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const summary = await Transaction.aggregate([
      { $match: { userId, ...dateFilter } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalReceitas = 0;
    let totalGastos = 0;
    let countReceitas = 0;
    let countGastos = 0;

    summary.forEach(item => {
      if (item._id === 'receita') {
        totalReceitas = item.total;
        countReceitas = item.count;
      } else if (item._id === 'gasto') {
        totalGastos = item.total;
        countGastos = item.count;
      }
    });

    const saldo = totalReceitas - totalGastos;

    res.json({
      success: true,
      summary: {
        totalReceitas,
        totalGastos,
        saldo,
        countReceitas,
        countGastos,
        totalTransacoes: countReceitas + countGastos
      }
    });
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Relatório por categoria
router.get('/by-category', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id);
    const { type, startDate, endDate } = req.query;

    let filter = { userId };
    if (type) filter.type = type;
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const categoryReport = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          type: { $first: '$type' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      categoryReport
    });
  } catch (error) {
    console.error('Erro ao gerar relatório por categoria:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Relatório mensal
router.get('/monthly', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id);
    const year = req.query.year || new Date().getFullYear();

    const monthlyReport = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          receitas: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'receita'] }, '$total', 0]
            }
          },
          gastos: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'gasto'] }, '$total', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Preencher meses sem transações
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const completeReport = months.map((month, index) => {
      const monthData = monthlyReport.find(item => item._id === index + 1);
      return {
        month,
        receitas: monthData?.receitas || 0,
        gastos: monthData?.gastos || 0,
        saldo: (monthData?.receitas || 0) - (monthData?.gastos || 0)
      };
    });

    res.json({
      success: true,
      monthlyReport: completeReport
    });
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Transações recentes
router.get('/recent', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      recentTransactions
    });
  } catch (error) {
    console.error('Erro ao buscar transações recentes:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

module.exports = router; 