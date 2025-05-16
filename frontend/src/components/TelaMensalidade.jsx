import React from "react";

export default function TelaMensalidade({ mensalidades }) {
  if (!mensalidades || mensalidades.length === 0) {
    return <p className="text-center mt-6">Nenhuma mensalidade encontrada.</p>;
  }

  // Função para converter valor para número seguro
  const formatValor = (valor) => {
    const num = Number(valor);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded shadow overflow-x-auto">
      <h3 className="text-lg font-semibold p-4 border-b">Mensalidades</h3>
      <table className="min-w-full text-left">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-3">Vencimento</th>
            <th className="p-3">Valor Cobrado</th>
            <th className="p-3">Desconto</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {mensalidades.map(({ id, vencimento, valor_cobrado, desconto_aplicado, status }) => (
            <tr key={id} className="border-b hover:bg-gray-50">
              <td className="p-3">{new Date(vencimento).toLocaleDateString("pt-BR")}</td>
              <td className="p-3">R$ {formatValor(valor_cobrado)}</td>
              <td className="p-3">R$ {formatValor(desconto_aplicado)}</td>
              <td className="p-3 capitalize">{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
