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
      carregarDados();
    }, [id]);

    async function carregarDados() {
      try {
        const alunoData = await fetchAlunoById(id);
        setAluno(alunoData);
        const mensa = await fetchMensalidades(id);
        const acess = await fetchAcessos(id);
        setMensalidades(mensa);
        setAcessos(acess);
      } catch {
        setError("Erro ao carregar dados do aluno.");
      }
    }

    if (!aluno) return <p className="p-6">Carregando aluno...</p>;

    return (
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow animate-fadeIn">
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          Perfil de {aluno.nome}
        </h2>

        <nav className="mb-4 border-b border-gray-300 flex space-x-4">
          <button
            className={`py-2 px-4 border-b-2 transition ${
              abaAtiva === "informacoes"
                ? "border-blue-600 font-bold text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setAbaAtiva("informacoes")}
          >
            Informações
          </button>
          <button
            className={`py-2 px-4 border-b-2 transition ${
              abaAtiva === "mensalidades"
                ? "border-blue-600 font-bold text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setAbaAtiva("mensalidades")}
          >
            Mensalidades
          </button>
          <button
            className={`py-2 px-4 border-b-2 transition ${
              abaAtiva === "acessos"
                ? "border-blue-600 font-bold text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setAbaAtiva("acessos")}
          >
            Acessos
          </button>
        </nav>

        {/* Conteúdo das Abas */}
        {abaAtiva === "informacoes" && (
          <TelaAluno aluno={aluno} debitos={mensalidades.find((m) => m.status !== "paga")} />
        )}
        {abaAtiva === "mensalidades" && (
          <TelaMensalidade mensalidades={mensalidades} />
        )}
        {abaAtiva === "acessos" && <TelaAcesso acessos={acessos} />}
      </div>
    );
  }
