import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAlunoById, createAluno, updateAluno } from "../../services/Api";

export default function FormAlunoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("ativo");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchAlunoById(id).then((aluno) => {
        setNome(aluno.nome || "");
        setCpf(aluno.cpf || "");
        setEmail(aluno.email || "");
        setStatus(aluno.status || "ativo");
      }).catch(() => setError("Erro ao carregar dados do aluno."));
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const dadosAluno = { nome, cpf, email, status };

    try {
      if (id) {
        await updateAluno(id, dadosAluno);
      } else {
        await createAluno(dadosAluno);
      }
      navigate("/alunos");
    } catch {
      setError("Erro ao salvar dados do aluno.");
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{id ? "Editar Aluno" : "Novo Aluno"}</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">CPF</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
