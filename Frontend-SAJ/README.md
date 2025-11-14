# Sistema de Agendamento Jurídico (SAJ) - Frontend

Frontend moderno e minimalista para o Sistema de Agendamento Jurídico, desenvolvido com Vite + React + TypeScript.

## 🚀 Tecnologias

- **Vite** - Build tool rápido
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

## 📋 Pré-requisitos

- Node.js 16+
- npm ou yarn
- Backend SAJ rodando em `http://localhost:8081`

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 🎨 Funcionalidades

- ✅ Autenticação com JWT
- ✅ CRUD completo de Clientes
- ✅ CRUD completo de Processos
- ✅ Gestão de Agendamentos
- ✅ Dashboard com métricas
- ✅ Design responsivo e moderno
- ✅ Loading states e tratamento de erros
- ✅ Validação de formulários

## 🏗️ Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── ui/            # Componentes de UI
│   ├── layout/        # Layout (Sidebar, Header)
│   └── shared/        # Componentes compartilhados
├── contexts/          # Context API (Auth)
├── services/          # Serviços de API
├── hooks/             # Custom hooks
├── pages/             # Páginas da aplicação
│   ├── Auth/         # Login
│   ├── Dashboard/    # Dashboard
│   ├── Clients/      # Gestão de clientes
│   ├── Processes/    # Gestão de processos
│   └── Appointments/ # Gestão de agendamentos
├── types/             # TypeScript interfaces
└── lib/               # Utilitários
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. O token é armazenado no localStorage e incluído automaticamente em todas as requisições.

```typescript
// Exemplo de login
await login('username', 'password');
```

## 📡 Integração com Backend

Base URL: `http://localhost:8081/api`

### Endpoints utilizados:

- **Auth**: `POST /auth/login`
- **Users**: `GET|POST|PUT|DELETE /users`
- **Clients**: `GET|POST|PUT|DELETE /clients`
- **Processes**: `GET|POST|PUT|DELETE /processes`
- **Appointments**: `GET|POST|PUT|DELETE /appointments`

## 🎨 Design System

O projeto utiliza um design system moderno e minimalista baseado em:

- **Cores primárias**: Azul (hsl(221.2 83.2% 53.3%))
- **Tipografia**: System fonts para melhor performance
- **Espaçamento**: Sistema consistente baseado em Tailwind
- **Componentes**: Estilo clean com bordas arredondadas

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🚀 Deploy

Para fazer deploy:

```bash
# Build
npm run build

# A pasta dist/ contém os arquivos otimizados para produção
```

## 📝 Como Usar

1. **Faça login** com suas credenciais
2. **Cadastre clientes** na seção Clientes
3. **Crie processos** vinculados aos clientes
4. **Agende consultas** para seus clientes e processos
5. **Acompanhe** tudo no Dashboard

## 📄 Licença

Este projeto está sob a licença MIT.
