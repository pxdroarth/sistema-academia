import React from "react";

export default function TelaAluno({ aluno, debitos }) {
  return (
    <div className="bg-white rounded shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Informações do Aluno</h2>
      <div className="space-y-2 text-base">
        <p><strong>Nome:</strong> {aluno.nome}</p>
        <p><strong>CPF:</strong> {aluno.cpf}</p>
        <p><strong>Email:</strong> {aluno.email}</p>
        <p><strong>Status:</strong> {aluno.status}</p>
      </div>

      {debitos && (
        <p className="text-red-600 mt-4">Você possui débitos pendentes</p>
      )}
    </div>
  );
}
