import React from 'react';

export default function TelaMensalidade({ mensalidades }) {
  if (!mensalidades || mensalidades.length === 0) {
    return <p>Nenhuma mensalidade encontrada.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow-md mt-10">
      <h2 className="text-xl font-semibold mb-4">Mensalidades</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Vencimento</th>
            <th className="border border-gray-300 px-4 py-2">Valor Cobrado</th>
            <th className="border border-gray-300 px-4 py-2">Desconto</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {mensalidades.map(m => (
            <tr key={m.id}>
              <td className="border border-gray-300 px-4 py-2">{m.vencimento}</td>
              <td className="border border-gray-300 px-4 py-2">R$ {m.valor_cobrado.toFixed(2)}</td>
              <td className="border border-gray-300 px-4 py-2">R$ {m.desconto_aplicado.toFixed(2)}</td>
              <td className="border border-gray-300 px-4 py-2">{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
  