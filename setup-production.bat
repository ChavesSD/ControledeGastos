@echo off
echo 🚀 Setup do Sistema de Controle de Gastos para Produção
echo ======================================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale Node.js 16+ primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js detectado: 
node --version

REM Instalar dependências
echo.
echo 📦 Instalando dependências...
npm install

if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo ✅ Dependências instaladas

REM Verificar se .env existe
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado
    echo 📋 Criando .env a partir do exemplo...
    
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ Arquivo .env criado
        echo.
        echo 🔧 IMPORTANTE: Edite o arquivo .env com suas configurações:
        echo    - MONGODB_URI (string de conexão do MongoDB)
        echo    - SESSION_SECRET (chave secreta forte)
        echo    - NODE_ENV=production
        echo.
    ) else (
        echo ❌ Arquivo .env.example não encontrado
        pause
        exit /b 1
    )
)

REM Criar diretório de logs
if not exist "logs" mkdir logs

echo.
echo 🎉 Setup concluído!
echo.
echo 📝 Próximos passos:
echo 1. Configure o arquivo .env com suas credenciais
echo 2. Inicie a aplicação com: npm start
echo 3. Acesse: http://localhost:3000
echo.
echo 📖 Para deploy em produção, consulte: deploy.md
echo.
pause