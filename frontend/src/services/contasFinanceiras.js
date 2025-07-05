// src/services/contasFinanceiras.js

const API_URL = 'http://localhost:3001/contas-financeiras';

// Buscar contas financeiras com paginação e filtros opcionais
export async function getContasFinanceiras({ page = 1, perPage = 10, ...filtros } = {}) {
  const params = new URLSearchParams({ page, perPage, ...filtros });
  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar contas financeiras');
  return await res.json(); // { data, total }
}

// Criar nova conta financeira
export async function criarContaFinanceira(dados) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao criar conta');
  return await res.json();
}

// Atualizar conta financeira
export async function atualizarContaFinanceira(id, dados) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao atualizar conta');
  return await res.json();
}

// Confirmar pagamento da conta (muda status para "pago")
export async function marcarComoPago(id) {
  const res = await fetch(`${API_URL}/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: "pago" }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar status');
  return await res.json();
}

// Deletar conta financeira
export async function deletarContaFinanceira(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir conta');
  return await res.json();
}
