import React, { useState, useEffect } from 'react';

const TelaAluno = ({ alunoId }) => {
  const [debitos, setDebitos] = useState(null);

  useEffect(() => {
    // Chamada para o backend Electron via IPC
    window.electron.verificarDebito(alunoId)
      .then((resposta) => {
        setDebitos(resposta);
      })
      .catch((erro) => console.error(erro));
  }, [alunoId]);

  return (
    <div>
      <h1>Informações do Aluno</h1>
      {/* Informações do aluno */}
      <p>Nome: João Silva</p>
      <p>Plano: Básico</p>

      {/* Verificando se o aluno tem débito */}
      {debitos ? (
        <div>
          <h3>Você está com débito!</h3>
          <p>Valor a pagar: R$ {debitos.valor}</p>
          <h4>Acesso bloqueado</h4>
        </div>
      ) : (
        <p>Você está com o acesso liberado.</p>
      )}
    </div>
  );
};

export default TelaAluno;
