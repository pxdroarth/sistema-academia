import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAlunos } from "../../services/Api";

export default function AlunosPage() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarAlunos() {
      try {
        const dados = await fetchAlunos();
        setAlunos(dados);
      } catch {
        setError("Erro ao buscar alunos.");
      }
    }

    carregarAlunos();
  }, []);

  const alunosFiltrados = alunos.filter((a) =>
    a.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-700">Alunos</h2>
        <button
          onClick={() => navigate("/alunos/novo")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Novo Aluno
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
      />

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {alunosFiltrados.length === 0 ? (
        <p className="text-gray-600">Nenhum aluno encontrado.</p>
      ) : (
        <ul className="space-y-2">
          {alunosFiltrados.map((a) => (
            <li
              key={a.id}
              onClick={() => navigate(`/alunos/${a.id}`)}
              className="p-4 bg-gray-50 border rounded cursor-pointer hover:bg-gray-100 transition flex justify-between items-center"
            >
              <span className="font-medium">{a.nome}</span>
              <span className="text-sm text-gray-500">{a.email}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
