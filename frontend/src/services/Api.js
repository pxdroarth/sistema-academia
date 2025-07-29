const API_BASE_URL = 'http://localhost:3001';

// ============ ALUNOS ============

export async function fetchAlunos() {
  const response = await fetch(`${API_BASE_URL}/alunos`);
  if (!response.ok) throw new Error("Erro ao buscar alunos com status");
  return await response.json();
}

export async function fetchAlunoById(id) {
  const res = await fetch(`${API_BASE_URL}/alunos/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar aluno");
  return await res.json();
}

export async function createAluno(dadosAluno) {
  const response = await fetch(`${API_BASE_URL}/alunos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAluno),
  });
  if (!response.ok) throw new Error("Erro ao criar aluno");
  return await response.json();
}

export async function updateAluno(id, dadosAluno) {
  const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAluno),
  });
  if (!response.ok) throw new Error("Erro ao atualizar aluno");
  return await response.json();
}

// ============ MENSALIDADES ============

export async function cadastrarMensalidade(dados) {
  const response = await fetch(`${API_BASE_URL}/mensalidades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error("Erro ao cadastrar mensalidade");
  return await response.json();
}

export async function fetchMensalidadesPorAluno(alunoId, pagina = 1, limite = 10) {
  const response = await fetch(`${API_BASE_URL}/mensalidades/aluno/${alunoId}?pagina=${pagina}&limite=${limite}`);
  if (!response.ok) throw new Error("Erro ao buscar mensalidades do aluno");
  return await response.json();
}

// ============ ACESSOS ============

export async function fetchAcessos(alunoId) {
  const response = await fetch(`${API_BASE_URL}/acessos/aluno/${alunoId}`);
  if (!response.ok) throw new Error("Erro ao buscar acessos");
  return await response.json();
}

export async function fetchTodosAcessos() {
  const response = await fetch(`${API_BASE_URL}/acessos`);
  if (!response.ok) throw new Error("Erro ao buscar acessos");
  return await response.json();
}

// ============ PLANOS ============

export async function fetchPlanos() {
  const response = await fetch(`${API_BASE_URL}/planos`);
  if (!response.ok) throw new Error("Erro ao buscar planos");
  return await response.json();
}

// ============ PRODUTOS ============

export async function fetchProdutos() {
  const response = await fetch(`${API_BASE_URL}/produtos`);
  if (!response.ok) throw new Error("Erro ao buscar produtos");
  return await response.json();
}

export async function createProduto(dadosProduto) {
  const response = await fetch(`${API_BASE_URL}/produtos`, {
    method: 'POST',
    body: dadosProduto,
  });
  if (!response.ok) throw new Error("Erro ao criar produto");
  return await response.json();
}

export async function updateProduto(id, dadosProduto) {
  const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
    method: 'PUT',
    body: dadosProduto,
  });
  if (!response.ok) throw new Error("Erro ao atualizar produto");
  return await response.json();
}

export async function deleteProduto(id) {
  const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error("Erro ao deletar produto");
  return await response.json();
}

// ============ VENDAS ============

export async function fetchVendasProdutos({ data_inicial = "", data_final = "", pagina = 1, limite = 10 } = {}) {
  const params = new URLSearchParams();
  if (data_inicial) params.append('data_inicial', data_inicial);
  if (data_final) params.append('data_final', data_final);
  params.append('pagina', pagina);
  params.append('limite', limite);

  const response = await fetch(`${API_BASE_URL}/vendas-produtos?${params.toString()}`);
  if (!response.ok) throw new Error("Erro ao buscar vendas");
  return await response.json(); // { vendas: [], total: n }
}

export async function createVendaProduto(dadosVenda) {
  const response = await fetch(`${API_BASE_URL}/vendas-produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosVenda),
  });
  if (!response.ok) throw new Error("Erro ao registrar venda");
  return await response.json();
}

