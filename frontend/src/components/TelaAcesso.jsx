import React from "react";

export default function TelaAcesso({ acessos }) {
  if (!acessos || acessos.length === 0) {
    return <p className="text-center mt-6">Nenhum acesso registrado.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white rounded shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Acessos</h3>
      <ul className="space-y-3">
        {acessos.map(({ id, data_hora, resultado }) => (
          <li key={id} className="flex justify-between border-b pb-2">
            <span>{new Date(data_hora).toLocaleString("pt-BR")}</span>
            <span className={`font-semibold ${resultado === "permitido" ? "text-green-600" : "text-red-600"}`}>
              {resultado === "permitido" ? "Permitido" : "Negado"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
