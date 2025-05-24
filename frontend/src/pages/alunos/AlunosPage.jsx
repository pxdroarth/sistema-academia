import React, { useEffect, useState } from "react";
import { fetchAlunos } from "../../services/Api";
import { useNavigate } from "react-router-dom";

export default function AlunosPage() {
  const [alunos, setAlunos] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroCPF, setFiltroCPF] = useState("");
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarAlunos();
  }, []);

  async function carregarAlunos() {
    try {
      const dados = await fetchAlunos();
      setAlunos(dados);
    } catch (error) {
      setErro("Erro ao carregar alunos.");
    }
  }

  const alunosFiltrados = alunos.filter((aluno) => {
    return (
      aluno.nome.toLowerCase().includes(filtroNome.toLowerCase()) &&
      aluno.cpf.toLowerCase().includes(filtroCPF.toLowerCase())
    );
  });

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Lista de Alunos</h2>

      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className="border px-3 py-2 rounded w-1/2"
        />
        <input
          type="text"
          placeholder="Buscar por CPF"
          value={filtroCPF}
          onChange={(e) => setFiltroCPF(e.target.value)}
          className="border px-3 py-2 rounded w-1/2"
        />
      </div>

      {erro && <p className="text-red-600">{erro}</p>}

      <table className="min-w-full text-left border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 border">Nome</th>
            <th className="p-3 border">CPF</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Mensalidade</th>
            <th className="p-3 border"></th>
          </tr>
        </thead>
        <tbody>
          {alunosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4">
                Nenhum aluno encontrado.
              </td>
            </tr>
          ) : (
            alunosFiltrados.map((aluno) => (
              <tr
                key={aluno.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/alunos/${aluno.id}`)}
              >
                <td className="p-3 border">{aluno.nome}</td>
                <td className="p-3 border">{aluno.cpf}</td>
                <td className="p-3 border">
                  {aluno.status === "ativo" ? (
                    <span className="text-green-600 font-semibold">Ativo</span>
                  ) : (
                    <span className="text-gray-600">Inativo</span>
                  )}
                </td>
                <td className="p-3 border">
                  {aluno.pendente ? (
                    <span className="text-red-600">Pendente</span>
                  ) : (
                    <span className="text-green-600">Em dia</span>
                  )}
                </td>
                <td className="p-3 border text-blue-600 underline">Ver perfil</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
