import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAlunoById, createAluno, updateAluno, fetchPlanos } from "../../services/Api";

export default function FormAlunoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("ativo");
  const [diaVencimento, setDiaVencimento] = useState("");
  const [planoId, setPlanoId] = useState("");
  const [planos, setPlanos] = useState([]); // lista de planos
  const [error, setError] = useState(null);

  useEffect(() => {
    // Buscar planos para popular select
    async function carregarPlanos() {
      try {
        const data = await fetchPlanos();
        setPlanos(data);
      } catch {
        setError("Erro ao carregar planos.");
      }
    }
    carregarPlanos();
  }, []);

  useEffect(() => {
    if (id) {
      fetchAlunoById(id)
        .then((aluno) => {
          setNome(aluno.nome || "");
          setCpf(aluno.cpf || "");
          setEmail(aluno.email || "");
          setStatus(aluno.status || "ativo");
          setDiaVencimento(aluno.dia_vencimento ? String(aluno.dia_vencimento) : "");
          setPlanoId(aluno.plano_id ? String(aluno.plano_id) : "");
        })
        .catch(() => setError("Erro ao carregar dados do aluno."));
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const diaNum = Number(diaVencimento);
    if (!diaVencimento || isNaN(diaNum) || diaNum < 1 || diaNum > 31) {
      setError("Informe um dia de vencimento válido (1 a 31).");
      return;
    }
    if (!planoId) {
      setError("Selecione um plano.");
      return;
    }

    const dadosAluno = {
      nome,
      cpf,
      email,
      status,
      dia_vencimento: diaNum,
      plano_id: Number(planoId),
    };

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

        <div>
          <label className="block font-semibold mb-1">Dia de Vencimento</label>
          <input
            type="number"
            min="1"
            max="31"
            value={diaVencimento}
            onChange={(e) => setDiaVencimento(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Informe o dia do mês para vencimento"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Plano</label>
          <select
            value={planoId}
            onChange={(e) => setPlanoId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Selecione um plano</option>
            {planos.map((plano) => (
              <option key={plano.id} value={plano.id}>
                {plano.nome} — R$ {Number(plano.valor_base).toFixed(2)}
              </option>
            ))}
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
