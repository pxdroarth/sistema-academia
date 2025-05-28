import React, { useEffect, useState } from "react";
import PagamentoAntecipado from '../mensalidades/PagamentoAntecipado';
import { useNavigate, useParams } from "react-router-dom";


export default function PerfilPage() {
  const { id } = useParams(); // id do aluno vindo da rota
  const [aluno, setAluno] = useState(null);
  const [mensalidades, setMensalidades] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("informacoes");
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  // Buscar dados do aluno
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

  // Buscar mensalidades do aluno
  useEffect(() => {
    async function fetchMensalidades() {
      try {
        const res = await fetch(
          `http://localhost:3001/mensalidades/aluno/${id}`
        );
        if (!res.ok) throw new Error("Erro ao buscar mensalidades");
        const data = await res.json();
        setMensalidades(data);
      } catch (err) {
        setErro(err.message);
      }
    }
    fetchMensalidades();
  }, [id]);

  // Buscar acessos do aluno
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

  if (erro) {
    return <div className="p-4 text-red-600 font-bold">Erro: {erro}</div>;
  }

  if (!aluno) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-blue-700">
        Perfil de {aluno.nome}
      </h2>

      {/* Menu abas */}
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
          <h3 className="font-semibold mb-2">Mensalidades</h3>
          {mensalidades.length === 0 ? (
            <p>Sem mensalidades registradas.</p>
          ) : (
            <table className="min-w-full border">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="border p-2">Vencimento</th>
                  <th className="border p-2">Valor Cobrado</th>
                  <th className="border p-2">Desconto</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {mensalidades.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-2 border">
                      {new Date(m.vencimento).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      R$ {(Number(m.valor_cobrado) || 0).toFixed(2)}
                    </td>
                    <td className="p-2 border">
                      R$ {(Number(m.desconto_aplicado) || 0).toFixed(2)}
                    </td>
                    <td
                      className={`p-2 border font-semibold ${
                        m.status === "pago"
                          ? "text-green-700"
                          : m.status === "em_aberto"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {m.status.replace("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                        a.resultado === "liberado"
                          ? "text-green-700"
                          : a.resultado === "bloqueado"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {a.resultado === "liberado" ? "Permitido" : "Negado"}
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
