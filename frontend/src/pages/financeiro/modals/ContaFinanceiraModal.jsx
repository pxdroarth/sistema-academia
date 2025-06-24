import React, { useEffect, useState } from 'react';

export default function ContaFinanceiraModal({ aberto, onFechar, onSalvar, conta }) {
  const [form, setForm] = useState({
    descricao: '',
    tipo: 'despesa',
    valor: '',
    data_lancamento: '',
    status: 'pendente',
    plano_contas_id: '',
    observacao: '',
  });

  useEffect(() => {
    if (conta) setForm(conta);
    else setForm({ descricao: '', tipo: 'despesa', valor: '', data_lancamento: '', status: 'pendente', plano_contas_id: '', observacao: '' });
  }, [conta]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSalvar(form);
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{conta ? 'Editar Conta' : 'Nova Conta'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" className="w-full border rounded p-2" required />
          <div className="flex gap-4">
            <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full border rounded p-2">
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
            <input name="valor" value={form.valor} onChange={handleChange} type="number" placeholder="Valor" className="w-full border rounded p-2" required />
          </div>
          <input name="data_lancamento" value={form.data_lancamento} onChange={handleChange} type="date" className="w-full border rounded p-2" required />
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded p-2">
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
          <textarea name="observacao" value={form.observacao} onChange={handleChange} placeholder="Observações" className="w-full border rounded p-2" rows={3} />

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onFechar} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
