import React from "react";
import { useNavigate } from "react-router-dom";

export default function TelaAluno({ aluno, debitos }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded shadow p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Informações do Aluno</h2>
        <button
          onClick={() => navigate(`/alunos/editar/${aluno.id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Editar Aluno
        </button>
      </div>

      <div className="space-y-2 text-base">
        <p><strong>Nome:</strong> {aluno.nome}</p>
        <p><strong>CPF:</strong> {aluno.cpf}</p>
        <p><strong>Email:</strong> {aluno.email}</p>
        <p><strong>Status:</strong> {aluno.status}</p>
      </div>

      {debitos && (
        <p className="text-red-600 mt-4 font-semibold">
          Você possui débitos pendentes
        </p>
      )}
    </div>
  );
}
