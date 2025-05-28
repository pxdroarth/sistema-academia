# Sistema de Academia

Este projeto é um **sistema de gestão de academia** desenvolvido com **React** no frontend, **Electron** para criação da aplicação desktop, e **Node.js/Express** no backend. O sistema permite o gerenciamento de alunos, planos, acessos, produtos, vendas e controle de mensalidades.

## Estrutura de Diretórios (atualizada)

```
sistema-academia/
│
├── main.js                   # Arquivo principal do Electron (entry point)
├── preload.js                # Arquivo de preload para comunicação IPC
├── package.json              # Configurações principais do projeto (Electron, backend)
├── node_modules/             # Dependências principais
├── frontend/                 # Diretório para o frontend (React)
│   ├── node_modules/         # Dependências do frontend
│   ├── public/               # Arquivos públicos do React
│   ├── src/                  # Código-fonte React (componentes, páginas, serviços)
│   │   ├── components/       # Componentes reutilizáveis (Header, Sidebar, etc.)
│   │   ├── pages/            # Páginas principais (Dashboard, Alunos, Produtos, etc.)
│   │   ├── services/         # Serviços para requisições API
│   │   └── App.jsx           # Componente principal de rotas
│   ├── package.json          # Dependências do React
│   └── ...
├── backend/                  # Backend com Node.js e Express
│   ├── routes/               # Rotas da API (alunos.js, produtos.js, vendas.js, etc.)
│   ├── database.js           # Configuração da conexão com o banco de dados
│   └── server.js             # Inicialização do servidor Express
├── uploads/                  # Pasta de imagens dos produtos
├── build/                    # Pasta gerada após build do React
├── dist/                     # Build final para distribuição da aplicação Electron
└── README.md                 # Documentação do projeto
```

## Tecnologias Utilizadas

- **Electron**: Para criação da aplicação desktop com recursos nativos.
- **React.js**: Para construção da interface do usuário.
- **Node.js/Express**: Para gerenciamento das rotas e lógica de backend.
- **MySQL**: Banco de dados relacional utilizado no backend.
- **Multer**: Para upload de imagens (produtos).
- **IPC (Inter-Process Communication)**: Comunicação entre processos do Electron.

## Funcionalidades

- Cadastro, edição, exclusão e listagem de **alunos**.
- Controle de **mensalidades** com status (em dia, pendente).
- Gerenciamento de **acessos** por data e horário.
- Cadastro e venda de **produtos** (água, suplementos, etc.).
- Visualização do **perfil do aluno** com abas (informações, mensalidades, acessos).
- Controle de estoque automático ao realizar vendas.

## Instalação e Execução Local

### 1. Clonar o Repositório
```bash
git clone https://github.com/pxdroarth/sistema-academia.git
cd sistema-academia
```

### 2. Instalar Dependências

#### Backend + Electron:
```bash
npm install
```

#### Frontend:
```bash
cd frontend
npm install
```

### 3. Executar o Backend (API + Electron)
```bash
npm start
```

### 4. Executar o Frontend React
```bash
cd frontend
npm start
```

## Observações

- Para o funcionamento correto, é necessário ter o banco de dados configurado (MySQL) com as tabelas adequadas.
- O backend está configurado para rodar na porta `3001` e o frontend na porta `3000`.
- O Electron carrega a aplicação web localmente e pode funcionar offline após o build.

## Dependencias atuais do projeto 
"dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "multer": "^2.0.0",
    "mysql2": "^3.14.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"

---

Para dúvidas ou melhorias, entre em contato com [Pedro Maia](mailto:Pedroarthurmaia2000@gmail.com).
