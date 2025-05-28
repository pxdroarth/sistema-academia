import React, { useEffect, useState } from "react";

export default function PagamentoAntecipado({ alunoId }) {
  const [mensalidades, setMensalidades] = useState([]);
  const [selecionadas, setSelecionadas] = useState(new Set());
  const [desconto, setDesconto] = useState(0);
  const [mensagem, setMensagem] = useState(null);

  // Buscar mensalidades pendentes do aluno
  useEffect(() => {
    fetch(`http://localhost:3001/mensalidades/aluno/${alunoId}`)
      .then((res) => res.json())
      .then((data) => {
        // Filtrar apenas as pendentes (status em aberto, por exemplo)
        const pendentes = data.filter(m => m.status === "em_aberto");
        setMensalidades(pendentes);
      })
      .catch(() => setMensagem("Erro ao carregar mensalidades"));
  }, [alunoId]);

  // Marcar / desmarcar mensalidade
  function toggleSelecionada(id) {
    const copia = new Set(selecionadas);
    if (copia.has(id)) {
      copia.delete(id);
    } else {
      copia.add(id);
    }
    setSelecionadas(copia);
  }

  // Enviar pagamento antecipado
  async function pagar() {
    if (selecionadas.size === 0) {
      setMensagem("Selecione pelo menos uma mensalidade");
      return;
    }
    setMensagem(null);

    try {
      const res = await fetch("http://localhost:3001/mensalidades/pagamento-antecipado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensalidadesIds: Array.from(selecionadas),
          desconto: Number(desconto),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro desconhecido");
      }

      const data = await res.json();
      setMensagem(`Pagamento realizado para ${data.mensalidades.length} mensalidades`);
      // Atualizar lista removendo pagas
      setMensalidades(mensalidades.filter(m => !selecionadas.has(m.id)));
      setSelecionadas(new Set());
      setDesconto(0);
    } catch (error) {
      setMensagem(`Erro: ${error.message}`);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Pagamento Antecipado</h2>
      {mensagem && (
        <p className={`p-2 rounded ${mensagem.startsWith("Erro") ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
          {mensagem}
        </p>
      )}

      <div>
        <label className="block mb-1 font-semibold">Desconto (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={desconto}
          onChange={e => setDesconto(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="max-h-64 overflow-y-auto border rounded p-2">
        {mensalidades.length === 0 ? (
          <p>Nenhuma mensalidade pendente.</p>
        ) : (
          mensalidades.map((m) => (
            <label key={m.id} className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                checked={selecionadas.has(m.id)}
                onChange={() => toggleSelecionada(m.id)}
              />
              <span>{`#${m.id} - Vencimento: ${m.vencimento} - Valor: R$ ${m.valor_cobrado}`}</span>
            </label>
          ))
        )}
      </div>

      <button
        onClick={pagar}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Confirmar Pagamento
      </button>
    </div>
  );
}
