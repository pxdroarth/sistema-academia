import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAlunos } from "../../services/Api";

// ✅ Regras de status da mensalidade (fallback se backend não enviar mensalidade_status)
// 1) Preferencial: existe mensalidade PAGA e vigente (data_inicio <= hoje <= data_fim)
// 2) Fallback p/ registros antigos sem período: se PAGA e vencimento >= hoje => em_dia
function verificarStatusMensalidade(mensalidades) {
  if (!Array.isArray(mensalidades) || mensalidades.length === 0) return "atrasado";
  const hoje = new Date().toISOString().slice(0, 10);

  const emDia = mensalidades.some((m) => {
    if (m.status !== "pago") return false;

    const temPeriodo = !!m.data_inicio && !!m.data_fim;
    if (temPeriodo) {
      return m.data_inicio <= hoje && m.data_fim >= hoje;
    }
    if (!m.data_inicio && !m.data_fim && m.vencimento) {
      return m.vencimento >= hoje;
    }
    return false;
  });

  return emDia ? "em_dia" : "atrasado";
}

// ⚙️ Flag de ordenação (asc|desc). Padrão asc para seus testes.
const ORDER = (import.meta.env?.VITE_ALUNOS_ORDER || "asc").toLowerCase();

export default function AlunosPage() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    carregarAlunos();
  }, []);

  async function carregarAlunos() {
    try {
      const dados = await fetchAlunos(); // pode vir em DESC do backend
      const normalizados = (dados || []).map((a) => {
        const statusAtivo = a.status_ativo || a.status || "inativo";
        const mensalidadeStatus =
          a.mensalidade_status ||
          verificarStatusMensalidade(a.mensalidades || a.mensalidade || []);
        return { ...a, status_ativo: statusAtivo, mensalidade_status: mensalidadeStatus };
      });

      // 🔄 Força ordenação conforme flag (para testes agora em ASC)
      normalizados.sort((a, b) => {
        const va = Number(a.matricula || a.id || 0);
        const vb = Number(b.matricula || b.id || 0);
        return ORDER === "desc" ? vb - va : va - vb;
      });

      setAlunos(normalizados);
      setPaginaAtual(1);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  }

  const totalAlunos = alunos.length;
  const totalEmDia = alunos.filter((a) => a.mensalidade_status === "em_dia").length;
  const totalAtrasados = alunos.filter((a) => a.mensalidade_status !== "em_dia").length;

  const termo = busca.toLowerCase();
  const alunosFiltrados = alunos.filter(
    (a) =>
      (a.nome || "").toLowerCase().includes(termo) ||
      String(a.matricula || "").includes(busca)
  );

  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const alunosPaginados = alunosFiltrados.slice(indexPrimeiroItem, indexUltimoItem);
  const totalPaginas = Math.max(1, Math.ceil(alunosFiltrados.length / itensPorPagina));

  function mudarPagina(novaPagina) {
    setPaginaAtual(novaPagina);
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-700">Alunos</h2>
        <input
          type="text"
          placeholder="Buscar por nome ou matrícula"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1); // reset da paginação ao digitar
          }}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* ✅ Contadores rápidos */}
      <div className="flex gap-4 mt-4">
        <div className="flex-1 p-4 bg-gray-100 rounded shadow text-center">
          <p className="text-gray-600">Total de Alunos</p>
          <p className="text-2xl font-bold">{totalAlunos}</p>
        </div>
        <div className="flex-1 p-4 bg-green-100 rounded shadow text-center">
          <p className="text-gray-600">Em Dia</p>
          <p className="text-2xl font-bold text-green-700">{totalEmDia}</p>
        </div>
        <div className="flex-1 p-4 bg-red-100 rounded shadow text-center">
          <p className="text-gray-600">Atrasados</p>
          <p className="text-2xl font-bold text-red-700">{totalAtrasados}</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Link
          to="/alunos/novo"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          + Novo Aluno
        </Link>
      </div>

      <table className="min-w-full border mt-4">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">Matrícula</th>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Mensalidade</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunosPaginados.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">
                Nenhum aluno encontrado.
              </td>
            </tr>
          ) : (
            alunosPaginados.map((aluno) => (
              <tr key={aluno.id} className="hover:bg-gray-50">
                <td className="p-2 border font-mono text-sm">{aluno.matricula}</td>
                <td className="p-2 border">{aluno.nome}</td>
                <td className="p-2 border">
                  {String(aluno.status_ativo).toLowerCase() === "ativo" ? (
                    <span className="text-green-600">✅ Ativo</span>
                  ) : (
                    <span className="text-red-600">❌ Inativo</span>
                  )}
                </td>
                <td className="p-2 border">
                  {aluno.mensalidade_status === "em_dia" ? (
                    <span className="text-green-600 font-bold">🟢 Em dia</span>
                  ) : (
                    <span className="text-red-600 font-bold">🔴 Atrasado</span>
                  )}
                </td>
                <td className="p-2 border">
                  <button
                    onClick={() => navigate(`/alunos/${aluno.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Perfil
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => mudarPagina(num)}
            className={`px-3 py-1 border rounded ${
              num === paginaAtual ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
