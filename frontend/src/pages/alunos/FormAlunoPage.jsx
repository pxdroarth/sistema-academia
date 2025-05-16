import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchAlunoById,
  fetchPlanos,
  createAluno,
  updateAluno,
} from "../../services/Api";

export default function FormAlunoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aluno, setAluno] = useState({
    nome: "",
    numero: "",
    email: "",
    cpf: "",
    status: "ativo",
    plano_id: "",
  });

  const [planos, setPlanos] = useState([]);
  const [error, setError] = useState(null);

  const editando = id !== "novo";

  useEffect(() => {
    carregarPlanos();
    if (editando) {
      carregarAluno();
    }
  }, [id]);

  async function carregarAluno() {
    try {
      const dados = await fetchAlunoById(id);
      setAluno(dados);
    } catch {
      setError("Erro ao carregar aluno.");
    }
  }

  async function carregarPlanos() {
    try {
      const dados = await fetchPlanos();
      setPlanos(dados);
    } catch {
      setError("Erro ao carregar planos.");
    }
  }

  async function salvar(e) {
    e.preventDefault();
    try {
      if (editando) {
        await updateAluno(id, aluno);
      } else {
        await createAluno(aluno);
      }
      navigate("/alunos");
    } catch {
      setError("Erro ao salvar aluno.");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setAluno((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow animate-fadeIn">
      <h2 className="text-xl font-bold mb-4 text-blue-700">
        {editando ? "Editar Aluno" : "Novo Aluno"}
      </h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block font-medium">Nome</label>
          <input
            name="nome"
            value={aluno.nome}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Número</label>
          <input
            name="numero"
            value={aluno.numero}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={aluno.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">CPF</label>
          <input
            name="cpf"
            value={aluno.cpf}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Status</label>
          <select
            name="status"
            value={aluno.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Plano</label>
          <select
            name="plano_id"
            value={aluno.plano_id || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Selecione um plano</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate("/alunos")}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
