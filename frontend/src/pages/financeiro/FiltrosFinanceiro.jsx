import React, { useState } from "react";

export default function FiltrosFinanceiro({ onAplicarFiltros }) {
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [tipoDados, setTipoDados] = useState("todos"); // "mensalidades", "vendas", "todos"
  const [status, setStatus] = useState("todos"); // para mensalidades: "pago", "em_aberto", "todos"

  function aplicarFiltros() {
    onAplicarFiltros({ dataInicial, dataFinal, tipoDados, status });
  }

  return (
    <div className="p-4 bg-white rounded shadow mb-4 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block mb-1 font-semibold" htmlFor="dataInicial">Data Inicial</label>
        <input
          id="dataInicial"
          type="date"
          value={dataInicial}
          onChange={e => setDataInicial(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="dataFinal">Data Final</label>
        <input
          id="dataFinal"
          type="date"
          value={dataFinal}
          onChange={e => setDataFinal(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="tipoDados">Tipo de Dados</label>
        <select
          id="tipoDados"
          value={tipoDados}
          onChange={e => setTipoDados(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="todos">Todos</option>
          <option value="mensalidades">Mensalidades</option>
          <option value="vendas">Vendas</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="statusMensalidades">Status (Mensalidades)</label>
        <select
          id="statusMensalidades"
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border rounded px-2 py-1"
          disabled={tipoDados !== "mensalidades" && tipoDados !== "todos"}
        >
          <option value="todos">Todos</option>
          <option value="pago">Pago</option>
          <option value="em_aberto">Em Aberto</option>
        </select>
      </div>

      <button
        onClick={aplicarFiltros}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Aplicar
      </button>
    </div>
  );
}
