import React, { useEffect, useState } from "react";
import ToastNotification from "../../components/ToastNotification";
import { useNavigate, useParams } from "react-router-dom";
import ModalNovaMensalidade from "./ModalNovaMensalidade";

export default function PerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aluno, setAluno] = useState(null);
  const [erro, setErro] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("informacoes");

  // Mensalidades
  const [mensalidades, setMensalidades] = useState([]);
  const [totalMensalidades, setTotalMensalidades] = useState(0);
  const [paginaMensalidade, setPaginaMensalidade] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [planos, setPlanos] = useState([]);

  // Acessos
  const [acessos, setAcessos] = useState([]);
  const [paginaAcesso, setPaginaAcesso] = useState(1);
  const [totalAcessos, setTotalAcessos] = useState(0);

  const [toastMsg, setToastMsg] = useState(null);

  const resultadoTexto = { liberado: "Permitido", bloqueado: "Negado" };
  const resultadoClasse = { liberado: "text-green-700", bloqueado: "text-red-600" };

  useEffect(() => {
    fetch(`http://localhost:3001/alunos/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Aluno não encontrado");
        return res.json();
      })
      .then(setAluno)
      .catch((err) => setErro(err.message));
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:3001/mensalidades/aluno/${id}?pagina=${paginaMensalidade}&limite=10`)
      .then((res) => res.json())
      .then((data) => {
        setMensalidades(data.mensalidades);
        setTotalMensalidades(data.total);
      })
      .catch(() => setMensalidades([]));
  }, [id, paginaMensalidade]);

  useEffect(() => {
    fetch(`http://localhost:3001/acessos/aluno/${id}?pagina=${paginaAcesso}&limite=10`)
      .then((res) => res.json())
      .then(({ acessos, total }) => {
        setAcessos(acessos);
        setTotalAcessos(total);
      })
      .catch(() => setAcessos([]));
  }, [id, paginaAcesso]);

  useEffect(() => {
    fetch(`http://localhost:3001/planos`)
      .then((res) => res.json())
      .then(setPlanos);
  }, []);

  if (erro) return <div className="p-4 text-red-600 font-bold">Erro: {erro}</div>;
  if (!aluno) return <div className="p-4">Carregando...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2 text-blue-700">Perfil de {aluno.nome}</h2>

      <ToastNotification message={toastMsg} onClose={() => setToastMsg(null)} />

      <div className="flex space-x-6 border-b mb-4">
        {["informacoes", "mensalidades", "acessos"].map((tab) => (
          <button
            key={tab}
            onClick={() => setAbaAtiva(tab)}
            className={`pb-2 ${abaAtiva === tab ? "border-b-2 border-blue-600 font-semibold text-blue-600" : "text-gray-600"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {abaAtiva === "informacoes" && (
        <div>
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
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Mensalidades</h3>
            <button onClick={() => setShowModal(true)} className="bg-green-600 text-white rounded px-4 py-2">
              + Registrar Mensalidade
            </button>
          </div>
          <table className="min-w-full border text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-2 border">Vencimento</th>
                <th className="p-2 border">Valor</th>
                <th className="p-2 border">Desconto</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Observações</th>
              </tr>
            </thead>
            <tbody>
              {mensalidades.map(m => (
                <tr key={m.id}>
                  <td className="p-2 border">{m.vencimento?.slice(0,10)}</td>
                  <td className="p-2 border">R$ {Number(m.valor_cobrado).toFixed(2)}</td>
                  <td className="p-2 border">R$ {Number(m.desconto_aplicado).toFixed(2)}</td>
                  <td className="p-2 border text-green-700 font-semibold">{m.status}</td>
                  <td className="p-2 border">{m.observacoes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {abaAtiva === "acessos" && (
        <div>
          <table className="min-w-full border text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-2 border">Data/Hora</th>
                <th className="p-2 border">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {acessos.map(acesso => (
                <tr key={acesso.id}>
                  <td className="p-2 border">{new Date(acesso.data_hora).toLocaleString()}</td>
                  <td className={`p-2 border ${resultadoClasse[acesso.resultado]}`}>{resultadoTexto[acesso.resultado]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
