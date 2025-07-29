# Sistema de Gestão de Academia (ERP)

Este projeto é um **sistema ERP completo** desenvolvido especificamente para a gestão de academias, combinando **Electron** para aplicação desktop, **React.js** no frontend, e **Node.js/Express** no backend com SQLite para o banco de dados.

## Estrutura Atualizada

```
sistema-academia/
├── main.js                 # Arquivo principal Electron
├── preload.js              # Comunicação IPC Electron
├── package.json            # Configurações principais
├── backend/
│   ├── dbHelper.js         # Funções auxiliares de DB
│   ├── routes/             # Rotas da API
│   │   ├── alunos.js
│   │   ├── mensalidades.js
│   │   ├── acessos.js
│   │   ├── planos.js
│   │   ├── produtos.js
│   │   └── financeiro.js
│   ├── helpers/
│   │   └── periodoHelper.js
│   ├── services/
│   │   └── FinanceService.js
│   ├── cron.js             # Automação Node-Cron
│   └── server.js           # Inicialização Express
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── alunos/
│   │   │   │   ├── AlunosPage.jsx
│   │   │   │   ├── FormAlunoPage.jsx
│   │   │   │   └── PerfilPage.jsx
│   │   │   ├── mensalidades/
│   │   │   │   └── ModalNovaMensalidade.jsx
│   │   │   └── financeiro/
│   │   │       └── FinanceiroDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
├── uploads/                # Imagens produtos
├── dist/                   # Distribuição Electron
└── README.md
```

## Tecnologias Utilizadas

* **Electron** (Desktop)
* **React.js** (Frontend)
* **Node.js + Express** (Backend)
* **SQLite** (Banco de Dados)
* **Tailwind CSS** (Design)
* **Node-Cron** (Automação diária)

## Funcionalidades Atualizadas

* **Gestão de Alunos:**

  * Cadastro com validação.
  * Perfil detalhado com abas (Informações, Mensalidades, Acessos).
  * Status dinâmico: em dia ou atrasado.
  * Filtros rápidos e contadores de status para gestão.

* **Mensalidades:**

  * Controle avançado com status (pago, em aberto).
  * Pagamentos imediatos com cálculo automático de datas.
  * Histórico completo paginado.

* **Acessos:**

  * Histórico detalhado com resultados (permitido/negado).
  * Paginação eficiente para grandes volumes de dados.

* **Financeiro Completo (ERP):**

  * Dashboard financeiro com KPIs (receita, despesa, lucro real).
  * Gestão completa de contas a pagar e receber.
  * Plano de contas com categorias padronizadas.

* **Produtos e Vendas:**

  * Cadastro de produtos com imagens.
  * Gestão de estoque integrada às vendas.

## Automação e Integração

* Automação diária via **Node-Cron** para gestão automática de inadimplência.
* Integração biométrica facial via API Hikvision para acesso.

## Instalação e Execução

### 1. Clone o Repositório

```bash
git clone https://github.com/pxdroarth/sistema-academia.git
cd sistema-academia
```

### 2. Instale Dependências

**Backend e Electron:**

```bash
npm install
```

**Frontend React:**

```bash
cd frontend
npm install
```

### 3. Executar Backend e Electron

```bash
npm start
```

### 4. Executar Frontend React

```bash
cd frontend
npm start
```

## Estrutura do Banco de Dados

* **Aluno:** Informações pessoais, status e plano.
* **Mensalidade:** Status de pagamento, vencimentos e histórico.
* **Acesso:** Registros de entrada e saída dos alunos.
* **Plano:** Planos oferecidos pela academia.
* **Produtos:** Cadastro e estoque de produtos vendidos.
* **Conta Financeira:** Registro financeiro completo (despesas e receitas).

## Melhorias Recentes

* Página de alunos com filtros de status (em dia, atrasado).
* Perfil do aluno com paginação nos acessos.
* Atualização dinâmica de status de mensalidade no frontend.

## Dependências Atualizadas

```json
"dependencies": {
  "cors": "^2.8.5",
  "express": "^5.1.0",
  "multer": "^2.0.0",
  "sqlite3": "^5.1.6",
  "react": "^19.1.0",
  "node-cron": "^4.0.7",
  "react-dom": "^19.1.0",
  "tailwindcss": "^3.4.1"
}
```
📅 Banco de Dados Atualizado
Tabela	Descrição
aluno	Cadastro de alunos, vínculo plano
mensalidade	Pagamentos, status, períodos
acesso	Controle de acessos, bloqueios
produto	Cadastro + estoque
venda_produto	Registro de vendas
conta_financeira	ERP financeiro centralizado
plano_contas	Categorias ERP
orcamento	Orçamentos futuros

## Contato

Para sugestões ou dúvidas, entre em contato:

* Pedro Arthur Maia: [Pedroarthurmaia2000@gmail.com](mailto:Pedroarthurmaia2000@gmail.com)

---

**Projeto desenvolvido por Pedro Arthur Maia.**\*
