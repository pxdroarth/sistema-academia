// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchAlunos, fetchAcessos } from "../services/Api";

export default function Dashboard() {
  const [alunos, setAlunos] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const listaAlunos = await fetchAlunos();
      setAlunos(listaAlunos);

      const acessosCompletos = [];
      for (const aluno of listaAlunos) {
        const acessosAluno = await fetchAcessos(aluno.id);
        acessosCompletos.push(...acessosAluno.map(a => ({ ...a, nome: aluno.nome })));
      }

      // Ordenar por data/hora decrescente
      const acessosOrdenados = acessosCompletos.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
      setAcessos(acessosOrdenados);
    } catch (error) {
      setErro("Erro ao carregar dados do dashboard.");
    }
  }

  const totalAlunos = alunos.length;
  const alunosAtivos = alunos.filter(a => a.status === "ativo").length;
  const alunosInativos = alunos.filter(a => a.status !== "ativo").length;

  const ultimosAcessos = acessos.slice(-20).reverse(); // Mostra os últimos 20

  return (
    <div className="pt-16 max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-8">
      <h2 className="text-2xl font-bold text-blue-700">Dashboard Geral</h2>

      {erro && <p className="text-red-600">{erro}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-blue-100 text-blue-900 p-4 rounded shadow text-center">
          <p className="text-sm">Total de Alunos</p>
          <p className="text-xl font-bold">{totalAlunos}</p>
        </div>
        <div className="bg-green-100 text-green-900 p-4 rounded shadow text-center">
          <p className="text-sm">Alunos Ativos</p>
          <p className="text-xl font-bold">{alunosAtivos}</p>
        </div>
        <div className="bg-red-100 text-red-900 p-4 rounded shadow text-center">
          <p className="text-sm">Alunos Inativos</p>
          <p className="text-xl font-bold">{alunosInativos}</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Últimos 20 Acessos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 border">Aluno</th>
                <th className="p-3 border">Data/Hora</th>
                <th className="p-3 border">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {ultimosAcessos.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-center">Nenhum acesso encontrado.</td>
                </tr>
              )}
              {ultimosAcessos.map(({ id, nome, data_hora, resultado }) => (
                <tr key={id} className="border-t hover:bg-gray-50">
                  <td className="p-3 border">{nome}</td>
                  <td className="p-3 border">{new Date(data_hora).toLocaleString("pt-BR")}</td>
                  <td className={`p-3 border font-semibold ${resultado === "permitido" ? "text-green-600" : "text-red-600"}`}>
                    {resultado === "permitido" ? "Permitido" : "Negado"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
