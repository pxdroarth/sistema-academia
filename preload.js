// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Expondo funções do Electron para o frontend (React)
contextBridge.exposeInMainWorld('electron', {
  verificarDebito: (alunoId) => ipcRenderer.invoke('verificar-debito', alunoId), // Exemplo de função IPC
  salvarArquivo: (conteudo) => ipcRenderer.invoke('salvar-arquivo', conteudo)   // Exemplo de salvar arquivo
});
