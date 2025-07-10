import React, { useEffect, useState } from "react";
import PagamentoAntecipado from "../mensalidades/PagamentoAntecipado";
import GerarMensalidadesFuturas from "../../components/GerarMensalidadesFuturas";
import ToastNotification from "../../components/ToastNotification";
import { useNavigate, useParams } from "react-router-dom";

export default function PerfilPage() {
  const { id } = useParams();
  const [aluno, setAluno] = useState(null);
  const [mensalidades, setMensalidades] = useState([]);
  const [totalMensalidades, setTotalMensalidades] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [acessos, setAcessos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("informacoes");
  const [erro, setErro] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [emDebito, setEmDebito] = useState(false);
  const navigate = useNavigate();

  const resultadoTexto = {
    liberado: "Permitido",
    bloqueado: "Negado",
  };

  const resultadoClasse = {
    liberado: "text-green-700",
    bloqueado: "text-red-600",
  };

  useEffect(() => {
    async function fetchAluno() {
      try {
        const res = await fetch(`http://localhost:3001/alunos/${id}`);
        if (!res.ok) throw new Error("Aluno não encontrado");
        const data = await res.json();
        setAluno(data);
      } catch (err) {
        setErro(err.message);
      }
    }
    fetchAluno();
  }, [id]);

  useEffect(() => {
    recarregarMensalidades(pagina);
    verificarDebito();
  }, [id, pagina]);

  async function recarregarMensalidades(paginaAtual = 1) {
    try {
      const res = await fetch(
        `http://localhost:3001/mensalidades/aluno/${id}?status=todos&pagina=${paginaAtual}&limite=10`
      );
      if (!res.ok) throw new Error("Erro ao buscar mensalidades");
      const data = await res.json();
      setMensalidades(data.mensalidades);
      setTotalMensalidades(data.total);
      setPagina(paginaAtual);
    } catch (err) {
      setErro(err.message);
    }
  }

  async function verificarDebito() {
    try {
      const res = await fetch(`http://localhost:3001/alunos/${id}/debito`);
      if (!res.ok) throw new Error("Erro ao verificar débito");
      const data = await res.json();
      setEmDebito(data.em_debito);
    } catch {
      setEmDebito(false);
    }
  }

  useEffect(() => {
    async function fetchAcessos() {
      try {
        const res = await fetch(`http://localhost:3001/acessos/aluno/${id}`);
        if (!res.ok) throw new Error("Erro ao buscar acessos");
        const data = await res.json();
        setAcessos(data);
      } catch (err) {
        setErro(err.message);
      }
    }
    fetchAcessos();
  }, [id]);

  async function atualizarVencimento(mensalidadeId, novoVencimento) {
    try {
      await fetch(
        `http://localhost:3001/mensalidades/${mensalidadeId}/vencimento`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ novoVencimento }),
        }
      );
      setToastMsg("Vencimento atualizado com sucesso!");
      recarregarMensalidades(pagina);
    } catch {
      setToastMsg("Erro ao atualizar vencimento");
    }
  }

  async function confirmarPagamento(mensalidadeId) {
    try {
      const res = await fetch(
        `http://localhost:3001/mensalidades/${mensalidadeId}/pagar`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Erro ao confirmar pagamento");
      setToastMsg("Mensalidade marcada como paga!");
      recarregarMensalidades(pagina);
      verificarDebito();
    } catch {
      setToastMsg("Erro ao confirmar pagamento");
    }
  }

  if (erro) {
    return <div className="p-4 text-red-600 font-bold">Erro: {erro}</div>;
  }

  if (!aluno) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2 text-blue-700">
        Perfil de {aluno.nome}
      </h2>

      {emDebito && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          <strong>Aluno em débito!</strong> Existem mensalidades vencidas e não pagas.
        </div>
      )}

      <ToastNotification message={toastMsg} onClose={() => setToastMsg(null)} />

      <div className="flex space-x-6 border-b mb-4">
        <button
          onClick={() => setAbaAtiva("informacoes")}
          className={`pb-2 ${
            abaAtiva === "informacoes"
              ? "border-b-2 border-blue-600 font-semibold text-blue-600"
              : "text-gray-600"
          }`}
        >
          Informações
        </button>
        <button
          onClick={() => setAbaAtiva("mensalidades")}
          className={`pb-2 ${
            abaAtiva === "mensalidades"
              ? "border-b-2 border-blue-600 font-semibold text-blue-600"
              : "text-gray-600"
          }`}
        >
          Mensalidades
        </button>
        <button
          onClick={() => setAbaAtiva("acessos")}
          className={`pb-2 ${
            abaAtiva === "acessos"
              ? "border-b-2 border-blue-600 font-semibold text-blue-600"
              : "text-gray-600"
          }`}
        >
          Acessos
        </button>
        <button
          onClick={() => setAbaAtiva("pagamento-antecipado")}
          className={`pb-2 ${
            abaAtiva === "pagamento-antecipado"
              ? "border-b-2 border-blue-600 font-semibold text-blue-600"
              : "text-gray-600"
          }`}
        >
          Pagamento Antecipado
        </button>
      </div>

      {abaAtiva === "informacoes" && (
        <div>
          <h3 className="font-semibold mb-2">Informações do Aluno</h3>
          <p><strong>Nome:</strong> {aluno.nome}</p>
          <p><strong>CPF:</strong> {aluno.cpf}</p>
          <p><strong>Email:</strong> {aluno.email}</p>
          <p><strong>Status:</strong> {aluno.status}</p>
          <button
            onClick={() => navigate(`/alunos/editar/${aluno.id}`)}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Editar Aluno
          </button>
        </div>
      )}

      {abaAtiva === "mensalidades" && (
        <div>
          <h3 className="font-semibold mb-2">
            Mensalidades (página {pagina} de {Math.max(1, Math.ceil(totalMensalidades / 10))})
          </h3>
          {mensalidades.length === 0 ? (
            <p>Sem mensalidades registradas.</p>
          ) : (
            <>
              <table className="min-w-full border">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="border p-2">Vencimento</th>
                    <th className="border p-2">Valor Cobrado</th>
                    <th className="border p-2">Desconto</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mensalidades.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="p-2 border">
                        <input
                          type="date"
                          value={m.vencimento.slice(0, 10)}
                          onChange={(e) =>
                            atualizarVencimento(m.id, e.target.value)
                          }
                          disabled={m.status === "pago"}
                          className="border rounded px-2 py-1"
                        />
                      </td>
                      <td className="p-2 border">
                        R$ {(Number(m.valor_cobrado) || 0).toFixed(2)}
                      </td>
                      <td className="p-2 border">
                        R$ {(Number(m.desconto_aplicado) || 0).toFixed(2)}
                      </td>
                      <td
                        className={`p-2 border font-semibold ${
                          m.status?.trim() === "pago"
                            ? "text-green-700"
                            : m.status?.trim() === "em_aberto"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {m.status && m.status.trim()
                          ? m.status.trim().replace("_", " ")
                          : "não informado"}
                      </td>
                      <td className="p-2 border">
                        {m.status !== "pago" && (
                          <button
                            onClick={() => confirmarPagamento(m.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Confirmar Pagamento
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between mt-2">
                <button
                  disabled={pagina <= 1}
                  onClick={() => setPagina(pagina - 1)}
                  className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={pagina >= Math.ceil(totalMensalidades / 10)}
                  onClick={() => setPagina(pagina + 1)}
                  className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>

              {aluno && aluno.plano_id && (
                <div className="mt-6">
                  <GerarMensalidadesFuturas
                    alunoId={aluno.id}
                    planoId={aluno.plano_id}
                    onGerar={() => recarregarMensalidades(pagina)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {abaAtiva === "acessos" && (
        <div>
          <h3 className="font-semibold mb-2">Histórico de Acessos</h3>
          {acessos.length === 0 ? (
            <p>Sem registros de acesso.</p>
          ) : (
            <table className="min-w-full border">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 border">Data/Hora</th>
                  <th className="p-2 border">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {acessos.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2 border">
                      {new Date(a.data_hora).toLocaleString()}
                    </td>
                    <td
                      className={`p-2 border font-semibold ${
                        resultadoClasse[a.resultado] || ""
                      }`}
                    >
                      {resultadoTexto[a.resultado] || a.resultado}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {abaAtiva === "pagamento-antecipado" && (
        <PagamentoAntecipado alunoId={parseInt(id, 10)} />
      )}
    </div>
  );
}
