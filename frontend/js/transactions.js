// Módulo de transações
class Transactions {
    constructor() {
        this.currentTransactions = [];
        this.currentType = 'all';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Configurar filtros para receitas
        const filterReceitasBtn = document.getElementById('filter-receitas-btn');
        if (filterReceitasBtn) {
            filterReceitasBtn.addEventListener('click', () => {
                this.applyFilters('receita');
            });
        }

        // Configurar filtros para saídas
        const filterSaidasBtn = document.getElementById('filter-saidas-btn');
        if (filterSaidasBtn) {
            filterSaidasBtn.addEventListener('click', () => {
                this.applyFilters('gasto');
            });
        }

        // Configurar botão de exportar
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportTransactions();
            });
        }
    }

    async loadTransactions(type = 'all') {
        try {
            Utils.showLoading();
            this.currentType = type;

            const filters = { type: type === 'all' ? '' : type };
            const response = await api.getTransactions(filters);

            this.currentTransactions = response.transactions || [];
            this.renderTransactions(type);
            
            // Carregar categorias para os filtros
            await this.loadCategories(type);

        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            Utils.showToast('Erro ao carregar transações', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async applyFilters(type) {
        const startDateId = type === 'receita' ? 'receitas-start-date' : 'saidas-start-date';
        const endDateId = type === 'receita' ? 'receitas-end-date' : 'saidas-end-date';
        const categoryId = type === 'receita' ? 'receitas-category' : 'saidas-category';

        const startDate = document.getElementById(startDateId)?.value;
        const endDate = document.getElementById(endDateId)?.value;
        const category = document.getElementById(categoryId)?.value;

        const filters = { type };
        
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (category) filters.category = category;

        try {
            Utils.showLoading();
            
            const response = await api.getTransactions(filters);
            this.currentTransactions = response.transactions || [];
            this.renderTransactions(type);

        } catch (error) {
            console.error('Erro ao filtrar transações:', error);
            Utils.showToast('Erro ao aplicar filtros', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    renderTransactions(type) {
        const containerId = type === 'receita' ? 'receitas-list' : 'saidas-list';
        const container = document.getElementById(containerId);
        
        if (!container) return;

        if (!this.currentTransactions || this.currentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-${type === 'receita' ? 'arrow-up' : 'arrow-down'}" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>Nenhuma ${type === 'receita' ? 'receita' : 'saída'} encontrada</h3>
                    <p>Comece adicionando sua primeira ${type === 'receita' ? 'receita' : 'saída'}</p>
                </div>
            `;
            return;
        }

        // Cabeçalho da tabela
        const tableHeader = `
            <div class="table-header">
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 100px; gap: 1rem; align-items: center;">
                    <div><strong>Descrição</strong></div>
                    <div><strong>Categoria</strong></div>
                    <div><strong>Valor</strong></div>
                    <div><strong>Data</strong></div>
                    <div><strong>Ações</strong></div>
                </div>
            </div>
        `;

        // Linhas da tabela
        const tableRows = this.currentTransactions.map(transaction => `
            <div class="transaction-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 100px; gap: 1rem; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); transition: var(--transition);" 
                 onmouseover="this.style.backgroundColor='var(--bg-secondary)'" 
                 onmouseout="this.style.backgroundColor='transparent'">
                <div>
                    <h4 style="font-weight: 500; color: var(--text-primary); margin-bottom: 0.25rem;">${transaction.description}</h4>
                </div>
                <div>
                    <span style="color: var(--text-secondary);">${transaction.category}</span>
                </div>
                <div>
                    <span class="transaction-amount ${transaction.type}" style="font-weight: 600; font-size: 1rem;">
                        ${Utils.formatCurrency(transaction.amount)}
                    </span>
                </div>
                <div>
                    <span style="color: var(--text-secondary);">${Utils.formatDate(transaction.date)}</span>
                </div>
                <div class="transaction-actions" style="display: flex; gap: 0.5rem;">
                    <button class="action-btn" onclick="window.transactions.editTransaction('${transaction._id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="window.transactions.deleteTransaction('${transaction._id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = tableHeader + tableRows;
    }

    async loadCategories(type) {
        try {
            const response = await api.getCategories();
            const categories = response.categories || [];
            
            const selectId = type === 'receita' ? 'receitas-category' : 'saidas-category';
            const select = document.getElementById(selectId);
            
            if (select) {
                // Manter opção "Todas as categorias"
                const defaultOption = select.querySelector('option[value=""]');
                select.innerHTML = '';
                select.appendChild(defaultOption);
                
                // Adicionar categorias encontradas
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat._id;
                    option.textContent = cat._id;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    async editTransaction(id) {
        try {
            // Encontrar transação nos dados carregados
            const transaction = this.currentTransactions.find(t => t._id === id);
            
            if (!transaction) {
                Utils.showToast('Transação não encontrada', 'error');
                return;
            }

            // Preencher modal com dados da transação
            document.getElementById('transaction-type').value = transaction.type;
            document.getElementById('transaction-description').value = transaction.description;
            document.getElementById('transaction-amount').value = transaction.amount;
            document.getElementById('transaction-category').value = transaction.category;
            document.getElementById('transaction-date').value = Utils.formatDateForInput(transaction.date);
            
            // Alterar título do modal
            document.getElementById('modal-title').textContent = 'Editar Transação';
            
            // Alterar comportamento do formulário
            const form = document.getElementById('transaction-form');
            form.dataset.editId = id;
            
            // Abrir modal
            document.getElementById('transaction-modal').classList.add('active');

        } catch (error) {
            console.error('Erro ao editar transação:', error);
            Utils.showToast('Erro ao carregar dados da transação', 'error');
        }
    }

    async deleteTransaction(id) {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) {
            return;
        }

        try {
            Utils.showLoading();
            
            const response = await api.deleteTransaction(id);
            
            if (response.success) {
                Utils.showToast('Transação excluída com sucesso!');
                
                // Recarregar transações
                await this.loadTransactions(this.currentType);
                
                // Atualizar dashboard
                if (window.dashboard) {
                    await window.dashboard.loadDashboardData();
                }
            }
        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            Utils.showToast('Erro ao excluir transação', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async exportTransactions() {
        if (!this.currentTransactions || this.currentTransactions.length === 0) {
            Utils.showToast('Nenhuma transação para exportar', 'warning');
            return;
        }

        try {
            // Preparar dados para exportação
            const exportData = this.currentTransactions.map(transaction => ({
                'Descrição': transaction.description,
                'Tipo': transaction.type === 'receita' ? 'Receita' : 'Gasto',
                'Categoria': transaction.category,
                'Valor': transaction.amount,
                'Data': Utils.formatDate(transaction.date),
                'Criado em': Utils.formatDate(transaction.createdAt)
            }));

            const filename = `transacoes_${this.currentType}_${new Date().toISOString().split('T')[0]}.csv`;
            Utils.exportToCSV(exportData, filename);
            
            Utils.showToast('Dados exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar transações:', error);
            Utils.showToast('Erro ao exportar dados', 'error');
        }
    }

    // Método para limpar filtros
    clearFilters(type) {
        const startDateId = type === 'receita' ? 'receitas-start-date' : 'saidas-start-date';
        const endDateId = type === 'receita' ? 'receitas-end-date' : 'saidas-end-date';
        const categoryId = type === 'receita' ? 'receitas-category' : 'saidas-category';

        document.getElementById(startDateId).value = '';
        document.getElementById(endDateId).value = '';
        document.getElementById(categoryId).value = '';

        // Recarregar transações
        this.loadTransactions(type);
    }

    // Método para buscar transações por texto
    searchTransactions(searchText, type) {
        if (!searchText || searchText.length < 2) {
            this.renderTransactions(type);
            return;
        }

        const filteredTransactions = this.currentTransactions.filter(transaction => 
            transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
            transaction.category.toLowerCase().includes(searchText.toLowerCase())
        );

        const tempTransactions = this.currentTransactions;
        this.currentTransactions = filteredTransactions;
        this.renderTransactions(type);
        this.currentTransactions = tempTransactions;
    }
} 