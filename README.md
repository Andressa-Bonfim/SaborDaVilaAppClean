# 🍔 Sabor da Vila App

Aplicativo mobile profissional para gerenciamento completo de vendas, controle de estoque e administração de múltiplas lojas da lanchonete **Sabor da Vila**.

Desenvolvido com **Expo + React Native + TypeScript**, oferece uma experiência robusta e intuitiva para proprietários e administradores gerenciarem seus negócios de forma eficiente.

---

## 🌟 Funcionalidades Principais

### 👥 **Sistema Multi-Usuário**
- **Autenticação segura** com registro e login
- **Múltiplas lojas** por usuário
- **Sistema de roles** (Usuário/Administrador)
- **Isolamento de dados** por loja
- **Troca dinâmica** entre lojas

### 📊 **Dashboard Inteligente**
- Resumo de vendas do dia
- Produtos em baixo estoque
- Vendas recentes
- Navegação rápida para funcionalidades

### 💰 **Gestão de Vendas**
- Registro rápido de vendas
- Desconto automático do estoque
- Histórico completo com filtros
- Relatórios em PDF e Excel

### 📦 **Controle de Estoque**
- Gerenciamento completo de produtos
- Alertas de estoque baixo
- Adição/remoção de produtos
- Controle de quantidades mínimas

### 🛡️ **Painel Administrativo**
- **Backup/Restauração** do banco de dados
- **Estatísticas detalhadas** do sistema
- **Exportação** de dados
- **Limpeza** de dados de teste
- **Gerenciamento** de usuários

### 📱 **Interface Adaptativa**
- **Android:** Navegação por Drawer (menu hambúrguer)
- **iOS:** Navegação por abas inferiores
- **Design responsivo** e moderno
- **Dark theme** com cores profissionais

---

## 🔐 Credenciais de Administrador

Para acessar o painel administrativo:
- **Email:** `admin@sabordavila.com`
- **Senha:** `admin123`

---

## 📸 Screenshots

### Android
<p align="center">
  <img src="./assets/screenshots/Screenshot_1762491989.png" width="200" alt="Menu" />
  <img src="./assets/screenshots/Screenshot_1762491996.png" width="200" alt="Dashboard" />
  <img src="./assets/screenshots/Screenshot_1762492004.png" width="200" alt="Vendas" />
  <img src="./assets/screenshots/Screenshot_1762492068.png" width="200" alt="Estoque" />
</p>

### iOS
<p align="center">
  <img src="./assets/screenshots/Dashboard.jpg" width="200" alt="Dashboard iOS" />
  <img src="./assets/screenshots/Vendas.jpg" width="200" alt="Vendas iOS" />
  <img src="./assets/screenshots/Estoque.jpg" width="200" alt="Estoque iOS" />
</p>

---

## 🚀 Tecnologias

### Core
- **Expo SDK 54** - Framework principal
- **React Native** - Framework mobile
- **TypeScript** - Tipagem estática
- **Expo Router** - Navegação baseada em arquivos

### Banco de Dados
- **Expo SQLite** - Banco local
- **Migrations** automáticas
- **Transações** para integridade

### UI/UX
- **Lucide React Native** - Ícones modernos
- **React Native Reanimated** - Animações fluidas
- **Custom Components** - Interface consistente
- **Dark Theme** - Design profissional

### Funcionalidades Avançadas
- **Expo File System** - Gerenciamento de arquivos
- **Expo Document Picker** - Seleção de arquivos
- **Expo Sharing** - Compartilhamento de dados
- **Expo Print** - Geração de PDF
- **AsyncStorage** - Cache e sessões

---

## 🛠️ Instalação

### Requisitos
- **Node.js 18+**
- **npm** ou **yarn**
- **Expo CLI** (opcional)

### Quick Start

1. **Clone o repositório:**
```bash
git clone https://github.com/ddouglss/SaborDaVilaAppClean.git
cd SaborDaVilaAppClean
```

2. **Instale as dependências:**
```bash
npm install
# ou
yarn install
```

3. **Inicie o servidor de desenvolvimento:**
```bash
npx expo start
# ou com cache limpo
npx expo start --clear
```

4. **Execute em dispositivos:**
```bash
# Android
npx expo start --android

# iOS
npx expo start --ios

# Web (limitado)
npx expo start --web
```

---

## 📁 Arquitetura do Projeto

```
src/
├─ app/                     # 📱 Rotas e Telas (Expo Router)
│  ├─ tabs/                 # 📋 Navegação por abas
│  │  ├─ _layout.tsx        # Layout das abas (iOS)
│  │  ├─ index.tsx          # 🏠 Dashboard
│  │  ├─ sales.tsx          # 💰 Gestão de Vendas
│  │  ├─ inventory.tsx      # 📦 Controle de Estoque
│  │  ├─ my-shops.tsx       # 🏪 Minhas Lojas
│  │  └─ DebugScreen.tsx    # 🛠️ Debug/Admin
│  ├─ _layout.tsx           # Layout principal (Drawer Android)
│  ├─ index.tsx             # Tela inicial
│  ├─ login.tsx             # 🔐 Login
│  ├─ register.tsx          # 📝 Cadastro
│  ├─ settings.tsx          # ⚙️ Configurações
│  └─ create-first-shop.tsx # 🏪 Primeira loja
├─ components/              # 🧩 Componentes Reutilizáveis
│  ├─ Button.tsx            # Botões customizáveis
│  ├─ Card.tsx              # Cards informativos
│  ├─ Header.tsx            # Cabeçalho com navegação
│  └─ Input.tsx             # Campos de entrada
├─ context/                 # 🌐 Contextos Globais
│  └─ AuthContext.tsx       # Autenticação e estado
├─ database/                # 🗃️ Camada de Dados
│  ├─ database.ts           # Conexão SQLite
│  ├─ authRepository.ts     # Usuários e lojas
│  ├─ productRepository.ts  # Produtos
│  ├─ salesRepository.ts    # Vendas
│  └─ exportDatabase.ts     # Exportação de dados
├─ services/                # ⚙️ Serviços de Negócio
│  ├─ authService.ts        # Autenticação
│  ├─ shopService.ts        # Gerenciamento de lojas
│  ├─ adminService.ts       # 🛡️ Funcionalidades admin
│  └─ reportService.ts      # 📊 Relatórios e exports
├─ types/                   # 📋 Definições TypeScript
│  ├─ auth.ts               # Tipos de autenticação
│  └─ sales.ts              # Tipos de vendas
├─ hooks/                   # 🎣 Hooks Customizados
│  ├─ useDatabase.ts        # Hook do banco
│  └─ useShopData.ts        # Dados da loja ativa
├─ utils/                   # 🛠️ Utilitários
│  └─ shopUtils.ts          # Funções auxiliares
└─ assets/                  # 📁 Recursos Estáticos
   └─ screenshots/          # Capturas de tela
```

---

## 🎯 Principais Funcionalidades

### 🔐 **Autenticação & Usuários**
- [x] Sistema de registro com validação
- [x] Login seguro com hash de senha
- [x] Validação de CPF/CNPJ
- [x] Sessões persistentes
- [x] Sistema de roles (User/Admin)

### 🏪 **Gestão Multi-Loja**
- [x] Criação de múltiplas lojas
- [x] Troca dinâmica entre lojas
- [x] Isolamento completo de dados
- [x] Gerenciamento de lojas ativas

### 💼 **Vendas & Estoque**
- [x] Registro rápido de vendas
- [x] Controle automático de estoque
- [x] Alertas de estoque baixo
- [x] Histórico completo de vendas
- [x] Dashboard com métricas em tempo real

### 📊 **Relatórios & Exports**
- [x] Relatórios PDF (vendas, estoque, produtos)
- [x] Exportação para Excel (CSV)
- [x] Estatísticas detalhadas
- [x] Dados filtráveis por período

### 🛡️ **Administração**
- [x] Backup completo do banco de dados
- [x] Restauração de backups
- [x] Estatísticas do sistema
- [x] Limpeza de dados de teste
- [x] Gestão de usuários

---

## 🎨 Design & UX

### 🎨 **Tema Visual**
- **Cores principais:** `#09090B`, `#18181B`, `#FFFFFF`
- **Accent:** `#10B981` (verde)
- **Secundárias:** `#A1A1AA`, `#71717A`
- **Dark theme** moderno e profissional

### 📱 **Responsividade**
- Layout adaptativo para diferentes tamanhos
- Navegação otimizada por plataforma
- Componentes reutilizáveis e consistentes

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start           # Inicia o Metro Bundler
npm run start:clear     # Inicia com cache limpo

# Compilação
npm run android         # Build/emula Android
npm run ios             # Build/emula iOS
npm run web             # Executa no navegador

# Manutenção
npx expo install        # Atualiza dependências do Expo
npx expo doctor         # Diagnóstico do projeto
```

---

## 🚦 Status do Projeto

### ✅ **Concluído**
- Sistema de autenticação multi-usuário
- Gestão completa de lojas
- Controle de vendas e estoque
- Dashboard com métricas em tempo real
- Sistema administrativo
- Relatórios e exportações
- Interface adaptativa (Android/iOS)

### 🔄 **Em Desenvolvimento**
- Sincronização em nuvem
- Notificações push
- Análise avançada de dados
- Sistema de backup automático

---

## 👨‍💻 Desenvolvedores

**Douglas Souza Silva**
- [LinkedIn](https://www.linkedin.com/in/ddouglss/)
- [GitHub](https://github.com/ddouglss)

**Andressa Bonfim de Araujo**
- [LinkedIn](https://www.linkedin.com/in/andressa-bonfim/)

---

## 📄 Licença

Este projeto é privado e proprietário da equipe **Sabor da Vila**.

---

## 🤝 Contribuições

Este é um projeto proprietário. Para contribuições ou sugestões, entre em contato com a equipe de desenvolvimento.

---

<p align="center">
  <strong>🍔 Sabor da Vila - Gerenciamento Profissional de Lanchonetes</strong>
</p>

