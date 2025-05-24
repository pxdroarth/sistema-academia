import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchAlunoById,
  fetchMensalidades,
  fetchAcessos,
} from "../../services/Api";

import TelaAluno from "../../components/TelaAluno";
import TelaMensalidade from "../../components/TelaMensalidade";
import TelaAcesso from "../../components/TelaAcesso";

export default function PerfilPage() {
  const { id } = useParams();
  const [aluno, setAluno] = useState(null);
  const [mensalidades, setMensalidades] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("informacoes");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const alunoData = await fetchAlunoById(id);
        const mensa = await fetchMensalidades(id);
        const acess = await fetchAcessos(id);
        setAluno(alunoData);
        setMensalidades(mensa);
        setAcessos(acess);
      } catch {
        setError("Erro ao carregar dados do aluno.");
      }
    }

    if (id) carregarDados();
  }, [id]);

  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!aluno) return <p className="p-6">Carregando aluno...</p>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Perfil de {aluno.nome}</h2>

      {/* Abas */}
      <nav className="mb-4 border-b border-gray-300 flex space-x-4">
        {["informacoes", "mensalidades", "acessos"].map((aba) => (
          <button
            key={aba}
            onClick={() => setAbaAtiva(aba)}
            className={`py-2 px-4 border-b-2 transition ${
              abaAtiva === aba
                ? "border-blue-600 font-bold text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-500"
            }`}
          >
            {aba[0].toUpperCase() + aba.slice(1)}
          </button>
        ))}
      </nav>

      {/* Conteúdo da aba selecionada */}
      {abaAtiva === "informacoes" && (
        <TelaAluno aluno={aluno} debitos={mensalidades.some((m) => m.status !== "paga")} />
      )}
      {abaAtiva === "mensalidades" && <TelaMensalidade mensalidades={mensalidades} />}
      {abaAtiva === "acessos" && <TelaAcesso acessos={acessos} />}
    </div>
  );
}
