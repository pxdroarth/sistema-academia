import React from 'react';

export default function TelaAcesso({ acessos }) {
  if (!acessos || acessos.length === 0) {
    return <p className="text-center mt-6 text-gray-600">Nenhum acesso registrado.</p>;
  }

  return (
    <div className="bg-white rounded shadow p-6 max-w-4xl mx-auto overflow-x-auto mt-6">
      <h2 className="text-lg font-semibold mb-4">Acessos</h2>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Data e Hora</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Resultado</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Motivo Bloqueio</th>
          </tr>
        </thead>
        <tbody>
          {acessos.map((a) => (
            <tr key={a.id} className="odd:bg-gray-50 even:bg-white">
              <td className="border border-gray-300 px-4 py-2">{new Date(a.data_hora).toLocaleString()}</td>
              <td className={`border border-gray-300 px-4 py-2 capitalize ${a.resultado === 'permitido' ? 'text-green-600' : 'text-red-600'}`}>
                {a.resultado}
              </td>
              <td className="border border-gray-300 px-4 py-2">{a.motivo_bloqueio || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
