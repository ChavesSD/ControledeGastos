// Aplicação principal SPA
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModal();
        this.setupResponsive();
        this.initializeModules();
        
        // Aguardar autenticação para carregar dados
        setTimeout(() => {
            if (auth.isAuthenticated()) {
                this.loadInitialData();
            }
        }, 100);
    }

    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });
    }

    setupModal() {
        const modal = document.getElementById('transaction-modal');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const addTransactionBtns = document.querySelectorAll('.add-transaction-btn');

        // Abrir modal
        addTransactionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.openTransactionModal(type);
            });
        });

        // Fechar modal
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Fechar modal clicando fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Setup do formulário
        this.setupTransactionForm();
    }

    setupTransactionForm() {
        const form = document.getElementById('transaction-form');
        if (form) {
            form.addEventListener('submit', this.handleTransactionSubmit.bind(this));
            
            // Definir data atual por padrão
            const dateInput = document.getElementById('transaction-date');
            if (dateInput) {
                dateInput.value = Utils.formatDateForInput(new Date());
            }
        }
    }

    async handleTransactionSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const editId = form.dataset.editId;
        
        const transactionData = {
            type: document.getElementById('transaction-type').value,
            description: document.getElementById('transaction-description').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            category: document.getElementById('transaction-category').value,
            date: document.getElementById('transaction-date').value
        };

        // Validações
        if (!this.validateTransaction(transactionData)) {
            return;
        }

        try {
            Utils.showLoading();
            
            let response;
            if (editId) {
                // Editar transação existente
                response = await api.updateTransaction(editId, transactionData);
                Utils.showToast('Transação atualizada com sucesso!');
            } else {
                // Criar nova transação
                response = await api.createTransaction(transactionData);
                Utils.showToast('Transação criada com sucesso!');
            }
            
            if (response.success) {
                this.closeModal();
                
                // Recarregar dados das páginas
                this.reloadPageData();
                
                // Limpar formulário e resetar modo de edição
                form.reset();
                delete form.dataset.editId;
                document.getElementById('transaction-date').value = Utils.formatDateForInput(new Date());
                document.getElementById('modal-title').textContent = 'Nova Transação';
            }
        } catch (error) {
            Utils.showToast(error.message || 'Erro ao salvar transação', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    validateTransaction(data) {
        if (!data.type) {
            Utils.showToast('Selecione o tipo da transação', 'warning');
            return false;
        }
        
        if (!Utils.isValidRequired(data.description)) {
            Utils.showToast('Insira uma descrição para a transação', 'warning');
            return false;
        }
        
        if (!Utils.isValidAmount(data.amount)) {
            Utils.showToast('Insira um valor válido para a transação', 'warning');
            return false;
        }
        
        if (!Utils.isValidRequired(data.category)) {
            Utils.showToast('Insira uma categoria para a transação', 'warning');
            return false;
        }
        
        if (!data.date) {
            Utils.showToast('Selecione uma data para a transação', 'warning');
            return false;
        }
        
        return true;
    }

    openTransactionModal(type = '') {
        const modal = document.getElementById('transaction-modal');
        const typeSelect = document.getElementById('transaction-type');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('transaction-form');
        
        // Limpar modo de edição
        delete form.dataset.editId;
        form.reset();
        document.getElementById('transaction-date').value = Utils.formatDateForInput(new Date());
        
        modal.classList.add('active');
        
        if (type && type !== 'all') {
            typeSelect.value = type;
            modalTitle.textContent = type === 'receita' ? 'Nova Receita' : 'Nova Saída';
        } else {
            modalTitle.textContent = 'Nova Transação';
        }
    }

    closeModal() {
        const modal = document.getElementById('transaction-modal');
        modal.classList.remove('active');
    }

    setupResponsive() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
            
            // Fechar sidebar ao clicar fora (mobile)
            document.addEventListener('click', (e) => {
                if (Utils.isMobile() && 
                    !sidebar.contains(e.target) && 
                    !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('mobile-open');
                }
            });
        }
        
        // Ajustar layout no redimensionamento
        window.addEventListener('resize', Utils.debounce(() => {
            if (!Utils.isMobile()) {
                sidebar?.classList.remove('mobile-open');
            }
        }, 250));
    }

    navigateTo(page) {
        // Atualizar menu ativo
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
        
        // Mostrar página correspondente
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });
        
        document.getElementById(`${page}-page`).classList.add('active');
        
        // Atualizar título
        const pageTitle = document.getElementById('page-title');
        const titles = {
            dashboard: 'Dashboard',
            receitas: 'Receitas',
            saidas: 'Saídas',
            relatorios: 'Relatórios',
            configuracoes: 'Configurações'
        };
        
        pageTitle.textContent = titles[page] || 'Dashboard';
        
        // Fechar sidebar mobile
        if (Utils.isMobile()) {
            document.querySelector('.sidebar')?.classList.remove('mobile-open');
        }
        
        // Carregar dados da página específica
        this.loadPageData(page);
        
        this.currentPage = page;
    }

    initializeModules() {
        // Inicializar módulos globais
        window.dashboard = new Dashboard();
        window.transactions = new Transactions();
        window.reports = new Reports();
    }

    async loadInitialData() {
        if (this.currentPage === 'dashboard') {
            await window.dashboard.loadDashboardData();
        }
    }

    async loadPageData(page) {
        try {
            switch (page) {
                case 'dashboard':
                    await window.dashboard.loadDashboardData();
                    break;
                case 'receitas':
                    await window.transactions.loadTransactions('receita');
                    break;
                case 'saidas':
                    await window.transactions.loadTransactions('gasto');
                    break;
                case 'relatorios':
                    await window.reports.loadReports();
                    break;
                case 'configuracoes':
                    // Configurações já carregadas no auth
                    break;
            }
        } catch (error) {
            console.error(`Erro ao carregar dados da página ${page}:`, error);
        }
    }

    async reloadPageData() {
        // Recarregar dados da página atual e dashboard
        await this.loadPageData(this.currentPage);
        
        if (this.currentPage !== 'dashboard') {
            await window.dashboard.loadDashboardData();
        }
    }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 