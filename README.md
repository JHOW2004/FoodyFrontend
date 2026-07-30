# Foody Delivery - Frontend (React 19 + TypeScript + Vite)

Interface Web Single Page Application (SPA) moderna, de alta performance e totalmente responsiva desenvolvida com **React 19**, **TypeScript**, **Vite**, **Tailwind CSS 4**, **Zustand** e **TanStack Query** para a gestão e rastreamento de pedidos de delivery em tempo real.

---

## 🛠️ Tecnologias e Dependências

- **Core & Runtime**: React 19 (com JSX / TSX)
- **Linguagem**: TypeScript 5.x (Strict mode + module Resolution NodeNext)
- **Build Tool / Bundler**: Vite 8 (`@vitejs/plugin-react`)
- **Estilização**: Vanilla CSS + Tailwind CSS 4 (`@tailwindcss/vite`) com Suporte Nativo a Dark/Light Mode
- **Gerenciamento de Estado Global**: Zustand (`useAuthStore` com persistência automática no `localStorage`)
- **Gerenciamento de Estado Assíncrono / Data Fetching**: TanStack Query v5 (`@tanstack/react-query`)
- **Tabelas de Dados**: TanStack Table v8 (`@tanstack/react-table` com paginação, ordenação e filtros em tempo real)
- **Formulários & Validação**: React Hook Form + Zod (`@hookform/resolvers/zod` com regras estritas de senha e controle customizado de quantidade)
- **Cliente HTTP**: Axios com interceptors automáticos para inclusão do token Bearer JWT
- **Notificações**: Sonner Toast (`sonner`)
- **Ícones**: Lucide React (`lucide-react`)
- **Manipulação de Datas**: `date-fns` (com suporte a localidade `pt-BR`)

---

## 🏗️ Arquitetura e Estrutura de Pastas

```text
frontend
 ├── public/                           # Ativos Estáticos (LogoCompleta.png, favicon...)
 ├── src/
 │   ├── components/                   # Componentes UI Reutilizáveis
 │   │   ├── Button.tsx                # Botão genérico com suporte a estados de loading
 │   │   ├── Input.tsx                 # Campo de entrada reutilizável com toggle de senha
 │   │   ├── CreateOrderModal.tsx      # Modal de novo pedido com seletor de produtos e stepper customizado
 │   │   ├── OrderDetailsModal.tsx     # Modal completo com abas de itens do pedido e auditoria da timeline
 │   │   ├── ProductManagerModal.tsx   # Modal de gestão do cardápio (CRUD de produtos)
 │   │   ├── StatusBadge.tsx           # Badges e seletor interativo de status (StatusSelect)
 │   │   ├── MetricsCards.tsx          # Cards de indicadores operacionais e faturamento (R$)
 │   │   ├── ThemeContext.tsx          # Contexto de alternância de tema Claro/Escuro
 │   │   └── ThemeToggle.tsx           # Botão alternador de tema no header
 │   ├── context/                      # Contextos React (ThemeContext)
 │   ├── pages/                        # Páginas / Rotas da Aplicação
 │   │   ├── Login.tsx                 # Página de login com autenticação JWT
 │   │   ├── Register.tsx              # Página de cadastro de novos usuários com Zod
 │   │   └── Dashboard.tsx             # Dashboard principal de gestão de pedidos com TanStack Table
 │   ├── services/                     # Comunicação com a API REST
 │   │   ├── api.ts                    # Instância do Axios com interceptor de token Bearer JWT
 │   │   ├── authService.ts            # Serviços de Login e Registro
 │   │   ├── orderService.ts           # CRUD de Pedidos, Transição de Status e Histórico
 │   │   └── productService.ts        # Serviços de Gestão de Produtos do Cardápio
 │   ├── stores/                       # Estado Global
 │   │   └── useAuthStore.ts           # Store do Zustand para sessão do usuário
 │   ├── types/                        # Definições de Tipos TypeScript
 │   │   └── index.ts                  # Interfaces de User, Order, Product, OrderStatus...
 │   ├── App.tsx                       # Configuração de Rotas e Guards de Autenticação
 │   ├── main.tsx                      # Ponto de entrada React com QueryClientProvider
 │   └── index.css                     # Variáveis CSS para o sistema de Design Tokens (Dark/Light)
 ├── index.html                        # HTML Principal da SPA
 ├── vite.config.ts                    # Configuração do Vite + Tailwind CSS 4
 └── README.md                         # Documentação Técnica do Frontend
```

---

## 🔑 Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz da pasta `frontend/` com a URL do backend:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🚀 Como Executar o Frontend Localmente

### Pré-requisitos
- **Node.js**: versão 18+ ou 20+ instalada
- **npm** ou **yarn**

### Passo a Passo:

1. **Instalar as dependências**:
   ```bash
   npm install
   ```

2. **Executar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   *O frontend estará disponível em **`http://localhost:5173`**.*

3. **Validar a compilação do TypeScript**:
   ```bash
   npm run build
   ```

---

## 🌟 Recursos e Telas da Aplicação

1. **Página de Login e Registro (`/login` e `/register`)**:
   - Validação em tempo real com React Hook Form + Zod.
   - Requisitos estritos para criação de senha (mínimo de 10 caracteres, letra maiúscula, letra minúscula, número e caractere especial).
   - Alternador de visibilidade de senha (ícone de olho).
   - Logomarca oficial `LogoCompleta.png`.

2. **Dashboard de Pedidos (`/dashboard`)**:
   - Tabela responsiva fluida construída com **TanStack Table v8** (sem barras de rolagem horizontais em telas desktop).
   - Cards de **Métricas Operacionais** (Pedidos Recebidos, Em Preparo, Saiu para Entrega, Concluídos) e **Faturamento Total (R$)**.
   - Campo de busca em tempo real (por cliente, endereço ou ID do pedido).
   - Abas de filtro por status (`Todos`, `Recebido`, `Em Preparo`, `Saiu p/ Entrega`, `Entregue`, `Cancelado`).

3. **Seletor Interativo de Status na Tabela (`StatusSelect`)**:
   - O próprio badge colorido de status é um menu suspenso interativo que permite trocar o status do pedido com 1 clique.
   - Opções com alto contraste e legibilidade perfeita tanto no **Modo Escuro** quanto no **Modo Claro**.

4. **Modal de Detalhes & Auditoria (`OrderDetailsModal`)**:
   - Ao clicar em qualquer linha da tabela, um modal com limite de altura (`max-h-[85vh]`) é exibido com duas abas:
     - **Aba 1 (Detalhes & Itens)**: Dados do cliente, endereço e tabela com scroll interno listando todos os produtos, quantidades, preços unitários e total.
     - **Aba 2 (Linha do Tempo & Histórico)**: Histórico completo de auditoria com eixo vertical e pontos marcadores alinhados por flexbox nativo.

5. **Modal de Gestão do Cardápio (`ProductManagerModal`)**:
   - Botão **"Cardápio / Produtos"** no header do Dashboard para visualizar, cadastrar, editar preços e remover itens do cardápio em 5 categorias.

6. **Modal de Novo Pedido (`CreateOrderModal`)**:
   - Seletor de produtos agrupados por categoria em `<optgroup>` com preenchimento automático do preço unitário.
   - Controle customizado de quantidade com botões `-` e `+` e suporte à digitação manual (sem spinners nativos incômodos).
   - Botão proeminente tracejado `+ Adicionar Outro Produto ao Pedido` posicionado abaixo da lista de itens.
