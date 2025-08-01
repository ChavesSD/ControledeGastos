// Módulo do Dashboard
class Dashboard {
    constructor() {
        this.monthlyChart = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Configurar filtros se necessário
    }

    async loadDashboardData() {
        try {
            Utils.showLoading();
            
            // Carregar dados em paralelo
            const [summaryData, recentTransactions, monthlyData] = await Promise.all([
                api.getSummary(),
                api.getRecentTransactions(5),
                api.getMonthlyReport()
            ]);

            // Atualizar estatísticas
            this.updateStats(summaryData.summary);
            
            // Atualizar transações recentes
            this.updateRecentTransactions(recentTransactions.recentTransactions);
            
            // Atualizar gráfico mensal
            this.updateMonthlyChart(monthlyData.monthlyReport);
            
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            Utils.showToast('Erro ao carregar dados do dashboard', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    updateStats(summary) {
        // Atualizar valores
        const totalReceitasEl = document.getElementById('total-receitas');
        const totalGastosEl = document.getElementById('total-gastos');
        const saldoEl = document.getElementById('saldo');
        
        if (totalReceitasEl) {
            Utils.animateCounter(totalReceitasEl, summary.totalReceitas || 0);
        }
        
        if (totalGastosEl) {
            Utils.animateCounter(totalGastosEl, summary.totalGastos || 0);
        }
        
        if (saldoEl) {
            Utils.animateCounter(saldoEl, summary.saldo || 0);
        }

        // Atualizar contadores
        const countReceitasEl = document.getElementById('count-receitas');
        const countGastosEl = document.getElementById('count-gastos');
        
        if (countReceitasEl) {
            countReceitasEl.textContent = `${summary.countReceitas || 0} transações`;
        }
        
        if (countGastosEl) {
            countGastosEl.textContent = `${summary.countGastos || 0} transações`;
        }

        // Atualizar status do saldo
        const statusSaldoEl = document.getElementById('status-saldo');
        if (statusSaldoEl) {
            const saldo = summary.saldo || 0;
            if (saldo > 0) {
                statusSaldoEl.textContent = 'Positivo';
                statusSaldoEl.style.color = 'var(--success-color)';
            } else if (saldo < 0) {
                statusSaldoEl.textContent = 'Negativo';
                statusSaldoEl.style.color = 'var(--danger-color)';
            } else {
                statusSaldoEl.textContent = 'Equilibrado';
                statusSaldoEl.style.color = 'var(--text-muted)';
            }
        }
    }

    updateRecentTransactions(transactions) {
        const container = document.getElementById('recent-transactions');
        if (!container) return;

        if (!transactions || transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <p>Nenhuma transação encontrada</p>
                    <small>Comece adicionando sua primeira transação</small>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.type}">
                        <i class="fas fa-arrow-${transaction.type === 'receita' ? 'up' : 'down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${transaction.description}</h4>
                        <p>${transaction.category} • ${Utils.formatDate(transaction.date)}</p>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'receita' ? '+' : '-'} ${Utils.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="action-btn" onclick="window.transactions.editTransaction('${transaction._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="window.transactions.deleteTransaction('${transaction._id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateMonthlyChart(monthlyData) {
        const canvas = document.getElementById('monthly-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destruir gráfico anterior se existir
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
        }

        // Preparar dados
        const labels = monthlyData.map(item => item.month);
        const receitasData = monthlyData.map(item => item.receitas);
        const gastosData = monthlyData.map(item => item.gastos);

        this.monthlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: receitasData,
                        borderColor: 'var(--success-color)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Gastos',
                        data: gastosData,
                        borderColor: 'var(--danger-color)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + Utils.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Método para refresh dos dados
    async refresh() {
        await this.loadDashboardData();
    }
} 