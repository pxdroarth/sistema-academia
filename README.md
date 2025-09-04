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

## 📸 Screenshots

## Dashboard Principal do Projeto
<img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/ef7aaa61-5616-4e7a-bf33-633ae93ff024" />

## Informações principais do aluno
<img width="1915" height="915" alt="image" src="https://github.com/user-attachments/assets/903ab435-a47f-445b-be18-6a0c7ce5a690" />

## Mensalidades é historico do aluno
<img width="1911" height="911" alt="image" src="https://github.com/user-attachments/assets/96ba6570-2827-4303-aa80-371de297a2cf" />

## Registro de Acessos do aluno
<img width="1918" height="905" alt="image" src="https://github.com/user-attachments/assets/14a28bc5-e9ea-48ec-823d-e6db738a0343" />


## Cadastro e Listagem de Alunos
<img width="1915" height="913" alt="image" src="https://github.com/user-attachments/assets/fba4913a-2216-43da-97ac-e97a732b2020" />
<img width="1914" height="902" alt="image" src="https://github.com/user-attachments/assets/3bc615ad-d288-4c65-bf31-414a6f0c9adf" />

## Cadadastro de Produtos
<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/20bf4177-620e-433d-8039-33a54d1f13c0" />

## Vendas é Historico de Vendas
<img width="1912" height="905" alt="image" src="https://github.com/user-attachments/assets/9e0b3b8c-5c3a-457c-bcf8-d695301afb4c" />

## Planos, mensalidades 
<img width="1909" height="910" alt="image" src="https://github.com/user-attachments/assets/3dc64652-69c5-432e-a2a2-7ae0bdde8396" />

## Associações e Vinculos de Planos Compartilhados
<img width="1913" height="914" alt="image" src="https://github.com/user-attachments/assets/00256bef-67f7-4ee3-aea1-77703a5b1c8c" />

## Tela Principal do Financeiro 
<img width="1914" height="909" alt="image" src="https://github.com/user-attachments/assets/418d60f9-ad64-42ac-b8a2-09f29c0b2fe3" />

## Contas a pagar, receber
<img width="1913" height="903" alt="image" src="https://github.com/user-attachments/assets/cfb1b69d-62e3-4fa9-be9b-011c91b7534f" />

## Plano de Contas (adicionar/criar contas padroes)
<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/0f9746cb-722d-48fd-b405-683c58e88d99" />



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
* João Pedro Maia Damasceno [devjoaomaia13@gmail.com]

---

**Projeto desenvolvido por Pedro Arthur & João Pedro.**\*
