// Módulo de autenticação
class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupLoginForm();
        this.setupLogoutButton();
        this.checkAuthStatus();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    }

    setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        // Validações
        if (!Utils.isValidEmail(email)) {
            this.showLoginError('Por favor, insira um email válido.');
            return;
        }

        if (!Utils.isValidRequired(password)) {
            this.showLoginError('Por favor, insira sua senha.');
            return;
        }

        try {
            Utils.showLoading();
            this.hideLoginError();

            const response = await api.login(email, password);

            if (response.success) {
                this.currentUser = response.user;
                this.showApp();
                Utils.showToast('Login realizado com sucesso!');
                
                // Carregar dados iniciais
                if (window.dashboard) {
                    window.dashboard.loadDashboardData();
                }
            }
        } catch (error) {
            this.showLoginError(error.message || 'Erro ao fazer login. Tente novamente.');
        } finally {
            Utils.hideLoading();
        }
    }

    async handleLogout() {
        try {
            Utils.showLoading();
            
            await api.logout();
            
            this.currentUser = null;
            this.showLogin();
            Utils.showToast('Logout realizado com sucesso!');
            
            // Limpar dados do localStorage
            Storage.clear();
            
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            Utils.showToast('Erro ao fazer logout', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async checkAuthStatus() {
        try {
            const response = await api.checkAuth();
            
            if (response.authenticated) {
                this.currentUser = response.user;
                this.showApp();
                
                // Carregar dados iniciais
                if (window.dashboard) {
                    window.dashboard.loadDashboardData();
                }
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        
        // Limpar formulário
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.reset();
        }
        this.hideLoginError();
    }

    showApp() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        
        // Atualizar informações do usuário
        this.updateUserInfo();
        
        // Atualizar data atual
        this.updateCurrentDate();
    }

    updateUserInfo() {
        if (this.currentUser) {
            const userNameElements = document.querySelectorAll('#user-name, #user-name-setting');
            const userEmailElements = document.querySelectorAll('#user-email, #user-email-setting');
            
            userNameElements.forEach(el => {
                el.textContent = this.currentUser.name;
            });
            
            userEmailElements.forEach(el => {
                el.textContent = this.currentUser.email;
                if (el.tagName === 'INPUT') {
                    el.value = this.currentUser.email;
                }
            });
        }
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            currentDateElement.textContent = Utils.getCurrentDate();
        }
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    hideLoginError() {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Criar instância global do auth
const auth = new Auth(); 