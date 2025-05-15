import React, { useState, useEffect } from 'react';
import TelaAluno from './TelaAluno'; // Importe o componente TelaAluno

function App() {
  const [alunoId] = useState(1);  // Defina o ID do aluno para testar
  const [debitos, setDebitos] = useState(null);

  useEffect(() => {
    // Chamar a função IPC do Electron para verificar débito
    window.electron.verificarDebito(alunoId)
      .then((resposta) => {
        console.log('Resposta do backend IPC:', resposta);  // Verificar a resposta
        setDebitos(resposta);  // Atualizar o estado com a resposta
      })
      .catch((erro) => {
        console.error('Erro ao verificar débito:', erro);  // Captura erro
      });
  }, [alunoId]);

   return (
    <div className="App p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Informações do Sistema de Academia
      </h1>
      {/* Aqui é onde você "renderiza" o componente TelaAluno */}
      <TelaAluno alunoId={alunoId} debitos={debitos} />
    </div>
  );
}

export default App;
