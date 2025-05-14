Estrutura de Diretórios (atualizada)
Antes de começar a documentar, aqui está a estratégia de pastas do seu projeto:
sistema-academia/
│
├── main.js                   # Arquivo principal do Electron (Entry point)
├── preload.js                # Arquivo de preload para comunicação IPC
├── package.json              # Configurações do projeto (dependências, scripts)
├── node_modules/             # Pasta com as dependências do projeto
├── frontend/                 # Diretório para o frontend (React)
│   ├── node_modules/         
│   ├── public/               
│   ├── src/                  
│   ├── package.json          
│   └── ...                   
├── backend/                  # Código do backend (Node.js/Express)
│   └── server.js             
├── build/                    
├── dist/                     
└── README.md                 # Documentação do projeto

# Sistema de Academia

Este projeto é um **sistema de gestão de academia** desenvolvido com **React** no frontend e **Electron** para criar uma aplicação de desktop nativa. O sistema simula um controle de alunos com planos, débito e catracas bloqueadas.

## Estrutura do Projeto

Abaixo está a estrutura geral do projeto:

sistema-academia/
│
├── main.js # Arquivo principal do Electron (Entry point)
├── preload.js # Arquivo de preload para comunicação IPC
├── package.json # Configurações do projeto (dependências, scripts)
├── node_modules/ # Pasta com as dependências do projeto
├── frontend/ # Diretório para o frontend (React)
│ ├── node_modules/
│ ├── public/
│ ├── src/
│ ├── package.json
│ └── ...
├── backend/ # Código do backend (Node.js/Express)
│ └── server.js
├── build/
├── dist/
└── README.md # Documentação do projeto

## Tecnologias Utilizadas

- **Electron**: Para criar a aplicação de desktop com funcionalidades nativas.
- **React**: Para a construção do frontend da aplicação.
- **Node.js/Express**: Para o backend (API) da aplicação.
- **IPC (Inter-Process Communication)**: Para comunicação entre o frontend React e o backend Electron.

## Instalação

Siga as etapas abaixo para rodar o projeto localmente:

### 1. Clonar o Repositório

```bash
git clone https://github.com/pxdroarth/sistema-academia.git
cd sistema-academia






package.json da sistema
 # Contém as dependências do Electron, Express, etc.

  package.json Do Frontend
  
# Contém as dependências do React.
               