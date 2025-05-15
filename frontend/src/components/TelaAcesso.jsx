import React from 'react';

export default function TelaAcesso({ acessos }) {
  if (!acessos || acessos.length === 0) {
    return <p>Nenhum acesso registrado.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow-md mt-10 max-h-[400px] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Histórico de Acessos</h2>
      <ul className="space-y-2">
        {acessos.map(a => (
          <li key={a.id} className="border border-gray-300 rounded p-2">
            <p><strong>Data/Hora:</strong> {new Date(a.data_hora).toLocaleString()}</p>
            <p><strong>Resultado:</strong> {a.resultado}</p>
            {a.motivo_bloqueio && <p><strong>Motivo do bloqueio:</strong> {a.motivo_bloqueio}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
