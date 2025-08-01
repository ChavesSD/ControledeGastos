// Módulo para comunicação com a API
class API {
    constructor() {
        this.baseURL = '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    }

    // Métodos de autenticação
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async checkAuth() {
        return this.request('/auth/check');
    }

    // Métodos de transações
    async getTransactions(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/transactions?${params}`);
    }

    async createTransaction(transactionData) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }

    async updateTransaction(id, transactionData) {
        return this.request(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transactionData)
        });
    }

    async deleteTransaction(id) {
        return this.request(`/transactions/${id}`, {
            method: 'DELETE'
        });
    }

    async getCategories() {
        return this.request('/transactions/categories');
    }

    // Métodos de relatórios
    async getSummary(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/reports/summary?${params}`);
    }

    async getCategoryReport(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/reports/by-category?${params}`);
    }

    async getMonthlyReport(year) {
        const params = year ? `?year=${year}` : '';
        return this.request(`/reports/monthly${params}`);
    }

    async getRecentTransactions(limit = 10) {
        return this.request(`/reports/recent?limit=${limit}`);
    }
}

// Criar instância global da API
const api = new API(); 