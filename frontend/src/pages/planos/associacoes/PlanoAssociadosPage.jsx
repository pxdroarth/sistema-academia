import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PlanoAssociadosPage = () => {
  const [associacoes, setAssociacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarVinculos() {
      try {
        const alunosRes = await fetch("http://localhost:3001/alunos");
        const todosAlunos = await alunosRes.json();

        const grupos = await Promise.all(
          todosAlunos.map(async (resp) => {
            const res = await fetch(`http://localhost:3001/plano-associado/${resp.id}`);
            if (!res.ok) return null;

            const data = await res.json();
            if (data.associados?.length) {
              return {
                responsavel: resp,
                associados: data.associados
              };
            }
            return null;
          })
        );

        setAssociacoes(grupos.filter((g) => g !== null));
      } catch (error) {
        toast.error("Erro ao carregar vínculos");
      } finally {
        setCarregando(false);
      }
    }

    carregarVinculos();
  }, []);

  async function removerAssociacao(id) {
    if (!window.confirm("Deseja remover este vínculo?")) return;

    try {
      const res = await fetch(`http://localhost:3001/plano-associado/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erro ao remover vínculo");

      setAssociacoes((prev) =>
        prev.map((grupo) => ({
          ...grupo,
          associados: grupo.associados.filter((a) => a.id !== id),
        })).filter((grupo) => grupo.associados.length > 0)
      );

      toast.success("Associação removida com sucesso");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Vínculos de Planos Compartilhados</h2>

      {carregando ? (
        <p className="text-gray-600">Carregando...</p>
      ) : associacoes.length === 0 ? (
        <p className="text-gray-600">Nenhum vínculo encontrado.</p>
      ) : (
        associacoes.map(({ responsavel, associados }) => (
          <div key={responsavel.id} className="border rounded p-4 shadow bg-gray-50">
            <h3 className="font-bold text-lg text-blue-600 mb-2">
              Responsável: {responsavel.matricula} - {responsavel.nome}
            </h3>
            <table className="min-w-full border text-sm bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Matrícula</th>
                  <th className="p-2 border">Nome</th>
                  <th className="p-2 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {associados.map((assoc) => (
                  <tr key={assoc.id} className="hover:bg-gray-100">
                    <td className="p-2 border">{assoc.matricula}</td>
                    <td className="p-2 border">{assoc.nome}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => removerAssociacao(assoc.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default PlanoAssociadosPage;
