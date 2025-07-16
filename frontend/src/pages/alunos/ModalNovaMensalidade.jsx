import React, { useEffect, useState } from "react";
import { cadastrarMensalidade } from "../../services/Api";

export default function ModalNovaMensalidade({ open, onClose, aluno, planos, onSaved }) {
  const [form, setForm] = useState({
    aluno_id: "",
    plano_id: "",
    valor_cobrado: "",
    desconto_aplicado: 0,
    data_inicio: new Date().toISOString().slice(0, 10),
    vencimento: "",
    observacoes: "",
  });

  useEffect(() => {
    if (open && aluno) {
      let vencSug = "";
      if (aluno.dia_vencimento) {
        const hoje = new Date();
        let mes = hoje.getMonth();
        let ano = hoje.getFullYear();
        if (hoje.getDate() > aluno.dia_vencimento) {
          mes += 1;
          if (mes > 11) { mes = 0; ano++; }
        }
        vencSug = new Date(ano, mes, aluno.dia_vencimento).toISOString().slice(0, 10);
      }
      setForm({
        aluno_id: aluno.id,
        plano_id: "",
        valor_cobrado: "",
        desconto_aplicado: 0,
        data_inicio: new Date().toISOString().slice(0, 10),
        vencimento: vencSug,
        observacoes: "",
      });
    }
  }, [open, aluno]);

  const handlePlanoChange = (e) => {
    const plano = planos.find(p => p.id === parseInt(e.target.value));
    setForm(prev => ({
      ...prev,
      plano_id: e.target.value,
      valor_cobrado: plano ? plano.valor_base : ""
    }));
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plano_id || !form.valor_cobrado) return alert("Selecione um plano e preencha o valor!");
    try {
      await cadastrarMensalidade(form);
      alert("Mensalidade registrada com sucesso!");
      if (onSaved) onSaved();
      onClose();
    } catch {
      alert("Erro ao registrar mensalidade!");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 space-y-4 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-800">Registrar Pagamento/Mensalidade</h2>

        <div className="space-y-2">
          <label className="font-semibold text-gray-700">Plano:</label>
          <select name="plano_id" value={form.plano_id} onChange={handlePlanoChange} required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="">Selecione o plano</option>
            {planos.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-gray-700">Valor Cobrado:</label>
            <input type="number" name="valor_cobrado" value={form.valor_cobrado} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2" required />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Desconto:</label>
            <input type="number" name="desconto_aplicado" value={form.desconto_aplicado} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-gray-700">Data Início:</label>
            <input type="date" name="data_inicio" value={form.data_inicio} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2" required />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Vencimento:</label>
            <input type="date" name="vencimento" value={form.vencimento} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2" required />
          </div>
        </div>

        <div>
          <label className="font-semibold text-gray-700">Observações:</label>
          <input type="text" name="observacoes" value={form.observacoes} onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2" />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">Cancelar</button>
          <button type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition">Salvar</button>
        </div>
      </form>
    </div>
  );
}
