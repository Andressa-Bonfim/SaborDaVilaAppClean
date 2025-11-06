# Sabor da Vila App

Sistema de gestão para a Lanchonete Sabor da Vila - Aplicativo mobile para controle de vendas e estoque.

## 🚀 Tecnologias Utilizadas

- **React Native** com Expo
- **TypeScript** para tipagem
- **NativeWind** (Tailwind CSS para React Native)
- **Expo Router** para navegação
- **Lucide React Native** para ícones

## 📱 Funcionalidades

- **Dashboard**: Resumo das vendas do dia e ações rápidas
- **Vendas**: Registro rápido de novas vendas
- **Estoque**: Controle de produtos com alertas de estoque baixo

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)

### Passos para executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar o projeto:**
   ```bash
   npx expo start
   ```

3. **Executar em dispositivo específico:**
   ```bash
   # Android
   npx expo start --android
   
   # iOS
   npx expo start --ios
   
   # Web
   npx expo start --web
   ```

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Telas e navegação (Expo Router)
│   ├── _layout.tsx     # Configuração da navegação de abas
│   ├── index.tsx       # Dashboard
│   ├── sales.tsx       # Tela de Vendas
│   └── inventory.tsx   # Tela de Estoque
├── components/         # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Input.tsx
│   ├── Button.tsx
│   └── Card.tsx
├── assets/            # Imagens, fontes, etc.
└── styles/
    └── global.css    # Configuração base do Tailwind
```

## 🎨 Design

O aplicativo utiliza um tema escuro moderno com:
- Cores principais: Zinc (cinza escuro) e Indigo (azul)
- Interface limpa e intuitiva
- Componentes reutilizáveis
- Navegação por abas na parte inferior

## 📋 Funcionalidades Implementadas

### Dashboard
- Cards com resumo das vendas do dia
- Ações rápidas para nova venda e adicionar produto
- Estatísticas da semana

### Vendas
- Formulário para registro de vendas
- Validação de campos obrigatórios
- Lista de vendas recentes
- Confirmação visual das vendas

### Estoque
- Lista de produtos com quantidades
- Alertas visuais para estoque baixo
- Formulário para adicionar novos produtos
- Controle de quantidade mínima

## 🔧 Configuração

O projeto está configurado com:
- **TypeScript** para tipagem estática
- **NativeWind** para estilização com Tailwind CSS
- **Expo Router** para navegação baseada em arquivos
- **Lucide React Native** para ícones consistentes

## 📱 Compatibilidade

- iOS 13.0+
- Android 6.0+
- Web (Chrome, Firefox, Safari)

## 🤝 Contribuição

Este é um projeto de demonstração para a Lanchonete Sabor da Vila. Para sugestões ou melhorias, entre em contato com a equipe de desenvolvimento.
