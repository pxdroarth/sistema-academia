import React from 'react';

function TelaMensalidade({ mensalidades }) {
  if (!mensalidades || mensalidades.length === 0) {
    return <p>Nenhuma mensalidade encontrada.</p>;
  }

  return (
    <div className="bg-white shadow rounded p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Mensalidades</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">Vencimento</th>
            <th className="border p-2 text-left">Valor Cobrado</th>
            <th className="border p-2 text-left">Desconto</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {mensalidades.map((m) => (
            <tr key={m.id}>
              <td className="border p-2">{new Date(m.vencimento).toLocaleDateString()}</td>
              <td className="border p-2">
                R$ {parseFloat(m.valor_cobrado).toFixed(2)}
              </td>
              <td className="border p-2">
                R$ {parseFloat(m.desconto_aplicado || 0).toFixed(2)}
              </td>
              <td className="border p-2 capitalize">{m.status.replace('_', ' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TelaMensalidade;
