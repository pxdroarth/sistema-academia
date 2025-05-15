import React from "react";
export default function TelaAluno({ alunoId, debitos }) {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow-md mt-10">
      <h2 className="text-xl font-semibold mb-4">Informações do Aluno</h2>

      {!debitos ? (
        <p className="text-gray-500">Carregando informações...</p>
      ) : (
        <div>
          <p>
            <span className="font-semibold">ID do Aluno:</span> {alunoId}
          </p>

          {debitos?.emDebito ? (
            <>
              <p className="mt-4 font-semibold text-red-600">
                Você está com débito!
              </p>
              <p>Valor a pagar: R$ {debitos.valor}</p>
              <p className="font-bold mt-2 text-red-700">Acesso bloqueado</p>
            </>
          ) : (
            <p className="mt-4 text-green-600 font-semibold">
              Seu acesso está liberado
            </p>
          )}
        </div>
      )}
    </div>
  );
}
