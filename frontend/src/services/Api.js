const API_BASE_URL = 'http://localhost:3001'; // Ajuste para a URL do seu backend

// Alunos
export async function fetchAlunos() {
  const response = await fetch(`${API_BASE_URL}/alunos`);
  if (!response.ok) {
    throw new Error("Erro ao buscar alunos");
  }
  return await response.json();
}
export async function fetchAlunoById(id) {
  const response = await fetch(`${API_BASE_URL}/alunos/${id}`);
  if (!response.ok) throw new Error('Erro ao buscar aluno');
  return await response.json();
}

export async function createAluno(dadosAluno) {
  const response = await fetch(`${API_BASE_URL}/alunos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAluno),
  });
  if (!response.ok) throw new Error('Erro ao criar aluno');
  return await response.json();
}

export async function updateAluno(id, dadosAluno) {
  const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAluno),
  });
  if (!response.ok) throw new Error('Erro ao atualizar aluno');
  return await response.json();
}

// Mensalidades
export async function fetchMensalidades(alunoId) {
  const response = await fetch(`${API_BASE_URL}/mensalidades?alunoId=${alunoId}`);
  if (!response.ok) throw new Error('Erro ao buscar mensalidades');
  return await response.json();
}

// Acessos
export async function fetchAcessos(alunoId) {
  const response = await fetch(`${API_BASE_URL}/acessos?alunoId=${alunoId}`);
  if (!response.ok) throw new Error('Erro ao buscar acessos');
  return await response.json();
}
//planos
export async function fetchPlanos() {
  const response = await fetch("http://localhost:3001/planos");
  if (!response.ok) {
    throw new Error("Erro ao buscar planos");
  }
  return await response.json();
}