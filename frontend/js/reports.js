// Módulo de relatórios
class Reports {
    constructor() {
        this.categoryChart = null;
        this.evolutionChart = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Configurar filtros de data se existirem
        const yearSelect = document.getElementById('report-year');
        if (yearSelect) {
            yearSelect.addEventListener('change', () => {
                this.loadReports();
            });
        }
    }

    async loadReports() {
        try {
            Utils.showLoading();
            
            // Carregar dados em paralelo
            const [categoryData, monthlyData, summaryData] = await Promise.all([
                api.getCategoryReport(),
                api.getMonthlyReport(),
                api.getSummary()
            ]);

            // Atualizar gráficos
            this.updateCategoryChart(categoryData.categoryReport);
            this.updateEvolutionChart(monthlyData.monthlyReport);
            
            // Adicionar informações extras se necessário
            this.updateReportSummary(summaryData.summary);
            
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            Utils.showToast('Erro ao carregar relatórios', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    updateCategoryChart(categoryData) {
        const canvas = document.getElementById('category-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destruir gráfico anterior se existir
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        if (!categoryData || categoryData.length === 0) {
            this.showEmptyChart(ctx, 'Nenhum dado de categoria encontrado');
            return;
        }

        // Separar receitas e gastos
        const receitas = categoryData.filter(item => item.type === 'receita');
        const gastos = categoryData.filter(item => item.type === 'gasto');

        // Preparar dados para o gráfico
        const labels = [...new Set(categoryData.map(item => item._id))];
        const receitasData = labels.map(label => {
            const item = receitas.find(r => r._id === label);
            return item ? item.total : 0;
        });
        const gastosData = labels.map(label => {
            const item = gastos.find(g => g._id === label);
            return item ? item.total : 0;
        });

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: receitasData,
                        backgroundColor: [
                            '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b',
                            '#ef4444', '#6366f1', '#ec4899', '#84cc16'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = Utils.formatCurrency(context.raw);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateEvolutionChart(monthlyData) {
        const canvas = document.getElementById('evolution-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destruir gráfico anterior se existir
        if (this.evolutionChart) {
            this.evolutionChart.destroy();
        }

        if (!monthlyData || monthlyData.length === 0) {
            this.showEmptyChart(ctx, 'Nenhum dado mensal encontrado');
            return;
        }

        // Preparar dados
        const labels = monthlyData.map(item => item.month);
        const receitasData = monthlyData.map(item => item.receitas);
        const gastosData = monthlyData.map(item => item.gastos);
        const saldoData = monthlyData.map(item => item.saldo);

        this.evolutionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: receitasData,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Gastos',
                        data: gastosData,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: '#ef4444',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Saldo',
                        data: saldoData,
                        type: 'line',
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
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
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Utils.formatCurrency(value);
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
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

    updateReportSummary(summary) {
        // Adicionar cards de resumo se existirem elementos específicos
        const summaryContainer = document.getElementById('reports-summary');
        if (summaryContainer && summary) {
            summaryContainer.innerHTML = `
                <div class="summary-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="summary-card" style="background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius); box-shadow: var(--shadow-sm); border-left: 4px solid var(--success-color);">
                        <h4 style="color: var(--success-color); margin-bottom: 0.5rem;">Total Receitas</h4>
                        <p style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${Utils.formatCurrency(summary.totalReceitas || 0)}</p>
                        <small style="color: var(--text-secondary);">${summary.countReceitas || 0} transações</small>
                    </div>
                    <div class="summary-card" style="background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius); box-shadow: var(--shadow-sm); border-left: 4px solid var(--danger-color);">
                        <h4 style="color: var(--danger-color); margin-bottom: 0.5rem;">Total Gastos</h4>
                        <p style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">${Utils.formatCurrency(summary.totalGastos || 0)}</p>
                        <small style="color: var(--text-secondary);">${summary.countGastos || 0} transações</small>
                    </div>
                    <div class="summary-card" style="background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius); box-shadow: var(--shadow-sm); border-left: 4px solid var(--info-color);">
                        <h4 style="color: var(--info-color); margin-bottom: 0.5rem;">Saldo</h4>
                        <p style="font-size: 1.5rem; font-weight: 600; color: ${(summary.saldo || 0) >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${Utils.formatCurrency(summary.saldo || 0)}</p>
                        <small style="color: var(--text-secondary);">${(summary.saldo || 0) >= 0 ? 'Positivo' : 'Negativo'}</small>
                    </div>
                </div>
            `;
        }
    }

    showEmptyChart(ctx, message) {
        // Limpar canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Desenhar mensagem de vazio
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

    // Método para exportar relatório
    async exportReport() {
        try {
            Utils.showLoading();
            
            const [categoryData, monthlyData, summaryData] = await Promise.all([
                api.getCategoryReport(),
                api.getMonthlyReport(),
                api.getSummary()
            ]);

            // Preparar dados para exportação
            const reportData = {
                resumo: summaryData.summary,
                mensal: monthlyData.monthlyReport,
                categorias: categoryData.categoryReport
            };

            // Exportar cada seção
            if (monthlyData.monthlyReport && monthlyData.monthlyReport.length > 0) {
                const monthlyExport = monthlyData.monthlyReport.map(item => ({
                    'Mês': item.month,
                    'Receitas': item.receitas,
                    'Gastos': item.gastos,
                    'Saldo': item.saldo
                }));
                Utils.exportToCSV(monthlyExport, `relatorio_mensal_${new Date().toISOString().split('T')[0]}.csv`);
            }

            Utils.showToast('Relatório exportado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            Utils.showToast('Erro ao exportar relatório', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    // Método para atualizar período do relatório
    async updateReportPeriod(startDate, endDate) {
        try {
            Utils.showLoading();
            
            const filters = {};
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const [categoryData, summaryData] = await Promise.all([
                api.getCategoryReport(filters),
                api.getSummary(filters)
            ]);

            this.updateCategoryChart(categoryData.categoryReport);
            this.updateReportSummary(summaryData.summary);
            
        } catch (error) {
            console.error('Erro ao atualizar período do relatório:', error);
            Utils.showToast('Erro ao atualizar relatório', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    // Método para refresh dos dados
    async refresh() {
        await this.loadReports();
    }
} 