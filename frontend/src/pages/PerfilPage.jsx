import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import TelaAluno from "./TelaAluno";
import TelaMensalidade from "./TelaMensalidade";
import TelaAcesso from "./TelaAcesso";

import {
  fetchAlunoById,
  fetchMensalidades,
  fetchAcessos,
} from "../services/Api";

export default function PerfilPage() {
  const { id } = useParams();

  const [aluno, setAluno] = useState(null);
  const [mensalidades, setMensalidades] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("informacoes");

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      setError(null);
      try {
        const alunoData = await fetchAlunoById(id);
        setAluno(alunoData);
        const mensalidadesData = await fetchMensalidades(id);
        setMensalidades(mensalidadesData);
        const acessosData = await fetchAcessos(id);
        setAcessos(acessosData);
      } catch (e) {
        setError("Erro ao carregar dados do aluno.");
      }
      setLoading(false);
    }

    carregarDados();
  }, [id]);

  if (loading) {
    return <p className="text-center p-4">Carregando dados do aluno...</p>;
  }

  if (error) {
    return <p className="text-center p-4 text-red-600">{error}</p>;
  }

  if (!aluno) {
    return <p className="text-center p-4">Aluno não encontrado.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded shadow-md p-6">
      <nav className="mb-6 border-b border-gray-300 flex space-x-4">
        <button
          className={`py-2 px-4 border-b-2 ${
            abaAtiva === "informacoes"
              ? "border-blue-600 font-bold text-blue-600"
              : "border-transparent hover:text-blue-600"
          }`}
          onClick={() => setAbaAtiva("informacoes")}
          type="button"
        >
          Informações
        </button>
        <button
          className={`py-2 px-4 border-b-2 ${
            abaAtiva === "mensalidades"
              ? "border-blue-600 font-bold text-blue-600"
              : "border-transparent hover:text-blue-600"
          }`}
          onClick={() => setAbaAtiva("mensalidades")}
          type="button"
        >
          Mensalidades
        </button>
        <button
          className={`py-2 px-4 border-b-2 ${
            abaAtiva === "acessos"
              ? "border-blue-600 font-bold text-blue-600"
              : "border-transparent hover:text-blue-600"
          }`}
          onClick={() => setAbaAtiva("acessos")}
          type="button"
        >
          Acessos
        </button>
      </nav>

      <section>
        {abaAtiva === "informacoes" && <TelaAluno aluno={aluno} />}
        {abaAtiva === "mensalidades" && <TelaMensalidade mensalidades={mensalidades} />}
        {abaAtiva === "acessos" && <TelaAcesso acessos={acessos} />}
      </section>
    </div>
  );
}
