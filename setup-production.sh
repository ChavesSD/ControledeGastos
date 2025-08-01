#!/bin/bash

echo "🚀 Setup do Sistema de Controle de Gastos para Produção"
echo "======================================================"
echo

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 16+ primeiro."
    exit 1
fi

# Verificar versão do Node
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão $NODE_VERSION encontrada. Versão 16+ necessária."
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado"
    echo "📋 Criando .env a partir do exemplo..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado"
        echo
        echo "🔧 IMPORTANTE: Edite o arquivo .env com suas configurações:"
        echo "   - MONGODB_URI (string de conexão do MongoDB)"
        echo "   - SESSION_SECRET (chave secreta forte)"
        echo "   - NODE_ENV=production"
        echo
    else
        echo "❌ Arquivo .env.example não encontrado"
        exit 1
    fi
fi

# Verificar MongoDB URI
if ! grep -q "MONGODB_URI=" .env; then
    echo "⚠️  Configure a MONGODB_URI no arquivo .env"
fi

# Verificar SESSION_SECRET
if ! grep -q "SESSION_SECRET=" .env; then
    echo "⚠️  Configure a SESSION_SECRET no arquivo .env"
fi

# Criar diretório de logs
mkdir -p logs

echo
echo "🎉 Setup concluído!"
echo
echo "📝 Próximos passos:"
echo "1. Configure o arquivo .env com suas credenciais"
echo "2. Inicie a aplicação com: npm start"
echo "3. Acesse: http://localhost:3000"
echo
echo "📖 Para deploy em produção, consulte: deploy.md"
echo