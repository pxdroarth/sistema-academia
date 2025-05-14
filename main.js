const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// Função para criar a janela do Electron
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,  // Desabilitar nodeIntegration por segurança
            preload: path.join(__dirname, 'preload.js')  // Carregar o arquivo preload.js
        }
    });

    mainWindow.loadURL('http://localhost:3000');  // Frontend React rodando no localhost

    // Responder à solicitação do frontend (IPC)
    ipcMain.handle('verificar-debito', async (event, alunoId) => {
        // Exemplo: Verificar débito do aluno
        return { bloqueado: false, valor: 50.00 };  // Simulação de resposta
    });
}

// Quando o Electron estiver pronto, crie a janela
app.whenReady().then(createWindow);

// Fechar o aplicativo quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
