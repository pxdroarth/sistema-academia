const API_URL = 'http://localhost:3001/contas-financeiras';

// Buscar contas com filtros opcionais
export async function getContasFinanceiras({ tipo = 'todos', status = 'todos', data_inicial, data_final } = {}) {
  const params = new URLSearchParams();
  if (tipo !== 'todos') params.append('tipo', tipo);
  if (status !== 'todos') params.append('status', status);
  if (data_inicial) params.append('data_inicial', data_inicial);
  if (data_final) params.append('data_final', data_final);

  const res = await fetch(`${API_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar contas financeiras');
  return await res.json();
}

// Criar nova conta
export async function criarContaFinanceira(dados) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao criar conta');
  return await res.json();
}

// Atualizar conta
export async function atualizarContaFinanceira(id, dados) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error('Erro ao atualizar conta');
  return await res.json();
}

// Deletar conta
export async function deletarContaFinanceira(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir conta');
  return await res.json();
}
