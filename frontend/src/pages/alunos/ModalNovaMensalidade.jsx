import React, { useState } from "react";
import { toast } from "react-toastify";

export default function ModalNovaMensalidade({ open, aluno, planos, onClose, onSuccess }) {
  const [form, setForm] = useState({
    valor_cobrado: "",
    desconto_aplicado: "",
    observacoes: "",
    data_pagamento: new Date().toISOString().slice(0, 10),
  });

  const [carregando, setCarregando] = useState(false);

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    try {
      const res = await fetch("http://localhost:3001/mensalidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno_id: aluno.id,
          plano_id: aluno.plano_id,
          ...form,
        }),
      });

      if (!res.ok) throw new Error("Erro ao registrar mensalidade");
      toast.success("Mensalidade registrada com sucesso!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Registrar Mensalidade de {aluno.nome}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-semibold">Valor:</label>
            <input
              type="number"
              name="valor_cobrado"
              value={form.valor_cobrado}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full border rounded px-4 py-2"
            />
          </div>
          <div>
            <label className="font-semibold">Desconto:</label>
            <input
              type="number"
              name="desconto_aplicado"
              value={form.desconto_aplicado}
              onChange={handleChange}
              step="0.01"
              className="w-full border rounded px-4 py-2"
            />
          </div>
          <div>
            <label className="font-semibold">Data de Pagamento:</label>
            <input
              type="date"
              name="data_pagamento"
              value={form.data_pagamento}
              onChange={handleChange}
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>
          <div>
            <label className="font-semibold">Observações:</label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className={`px-4 py-2 rounded text-white font-bold ${
                carregando ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {carregando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
