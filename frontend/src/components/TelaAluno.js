import React from 'react';

export default function TelaAluno({ aluno, debitos }) {
  if (!aluno) return <p>Aluno não encontrado.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow-md mt-10">
      <h2 className="text-xl font-semibold mb-4">Informações do Aluno</h2>
      <p><strong>Nome:</strong> {aluno.nome}</p>
      <p><strong>CPF:</strong> {aluno.cpf}</p>
      <p><strong>Email:</strong> {aluno.email || 'Não informado'}</p>
      <p><strong>Status:</strong> {aluno.status}</p>

      {debitos && debitos.emDebito ? (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          <p><strong>Atenção:</strong> Você está com débito!</p>
          <p>Valor a pagar: R$ {debitos.valor}</p>
          <p><strong>Acesso bloqueado</strong></p>
        </div>
      ) : (
        <p className="mt-4 text-green-600 font-semibold">Seu acesso está liberado</p>
      )}
    </div>
  );
}
