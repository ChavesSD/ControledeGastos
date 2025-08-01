# Sistema de Controle de Gastos

Um sistema web completo para gerenciar suas finanças pessoais, desenvolvido com Node.js, MongoDB e uma interface moderna em HTML/CSS/JavaScript.

## 🚀 Funcionalidades

- **Autenticação segura** com sessões
- **Dashboard interativo** com estatísticas em tempo real
- **Gestão de receitas e saídas** com filtros avançados
- **Relatórios detalhados** com gráficos
- **Interface responsiva** e moderna
- **Exportação de dados** para CSV
- **Categorização automática** de transações

## 🛠 Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB com Mongoose
- bcryptjs para criptografia
- express-session para sessões

### Frontend
- HTML5 semântico
- CSS3 com variáveis customizadas
- JavaScript ES6+ (Vanilla)
- Chart.js para gráficos
- Font Awesome para ícones
- Google Fonts (Inter)

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [MongoDB](https://www.mongodb.com/) (local ou cloud)
- Git

## 🔧 Instalação

### Desenvolvimento Local

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/controle-de-gastos.git
cd controle-de-gastos
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o MongoDB**
   - **Local:** Instale e inicie o MongoDB
   - **Cloud:** Crie conta no MongoDB Atlas e configure a string de conexão

5. **Inicie o servidor**
```bash
# Desenvolvimento (com usuário admin automático)
npm run dev

# Configuração inicial
npm run setup
```

6. **Acesse a aplicação**
   - Desenvolvimento: `http://localhost:3000`
   - Usuário admin: `admin@gastos.com` / `admin123`

### Deploy para Produção

**📖 Guia completo:** [deploy.md](deploy.md)

```bash
# 1. Configure variáveis de ambiente
cp .env.example .env

# 2. Instale dependências
npm install

# 3. Deploy
npm run deploy
```

## 👤 Acesso Inicial

### Desenvolvimento
Em modo desenvolvimento, um usuário administrador é criado automaticamente:

| Email | Senha | Nome |
|-------|-------|------|
| admin@gastos.com | admin123 | Administrador |

**⚠️ IMPORTANTE:** Altere a senha após o primeiro login!

### Produção
Em produção, você deve criar o primeiro usuário manualmente através da interface após o deploy.

## 📱 Páginas Disponíveis

### 🏠 Dashboard
- Visão geral das finanças
- Estatísticas de receitas, gastos e saldo
- Transações recentes
- Gráfico de evolução mensal

### 💰 Receitas
- Lista completa de receitas
- Filtros por data e categoria
- Adição, edição e exclusão de receitas

### 💸 Saídas
- Lista completa de gastos
- Filtros por data e categoria
- Adição, edição e exclusão de gastos

### 📊 Relatórios
- Gráficos por categoria
- Evolução mensal de receitas e gastos
- Exportação de dados para CSV

### ⚙️ Configurações
- Perfil do usuário
- Categorias personalizadas
- Exportação de dados

## 🎨 Interface

O sistema possui uma interface moderna e intuitiva com:
- **Design responsivo** que funciona em desktop e mobile
- **Tema claro** com cores profissionais
- **Navegação intuitiva** com sidebar
- **Feedback visual** com toasts e loading
- **Gráficos interativos** com Chart.js

## 📊 Funcionalidades Técnicas

### Autenticação
- Login seguro com validação
- Sessões persistentes
- Logout automático de segurança

### Banco de Dados
- Modelo relacional com MongoDB
- Índices otimizados para performance
- Validação de dados no backend

### API REST
- Endpoints organizados por funcionalidade
- Tratamento de erros padronizado
- Validações robustas

### Frontend SPA
- Single Page Application
- Roteamento dinâmico
- Estado reativo

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Validação de dados no frontend e backend
- Proteção contra ataques básicos
- Sessões seguras

## 📁 Estrutura do Projeto

```
controle-de-gastos/
├── backend/
│   ├── config/
│   │   └── credentials.js
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── reports.js
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── app.js
│   │   ├── dashboard.js
│   │   ├── transactions.js
│   │   ├── reports.js
│   │   └── utils.js
│   └── index.html
├── package.json
├── .env
└── README.md
```

## 🚀 Deploy

### DigitalOcean/VPS
1. Configure um servidor Node.js
2. Instale MongoDB
3. Configure nginx como proxy reverso
4. Configure PM2 para gerenciamento de processos

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se o MongoDB está rodando
3. Verifique os logs do console do navegador
4. Verifique os logs do servidor

## 🎯 Próximas Funcionalidades

- [ ] Autenticação com Google/Facebook
- [ ] Múltiplas contas/carteiras
- [ ] Metas de gastos
- [ ] Notificações push
- [ ] App móvel
- [ ] Integração com bancos
- [ ] Análise de padrões de gastos
- [ ] Modo escuro

---

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal. 