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
    <div className="App">
      <h1>Informações do Sistema de Academia</h1>
      {/* Passar o estado 'debitos' para o componente TelaAluno */}
      <TelaAluno alunoId={alunoId} debitos={debitos} />
    </div>
  );
}

export default App;
