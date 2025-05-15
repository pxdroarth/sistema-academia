const API_BASE_URL = 'http://localhost:3001';

// Buscar alunos
export async function fetchAlunos() {
  const response = await fetch(`${API_BASE_URL}/alunos`);
  if (!response.ok) throw new Error('Erro ao buscar alunos');
  return response.json();
}

// Buscar mensalidades de um aluno
export async function fetchMensalidades(alunoId) {
  const response = await fetch(`${API_BASE_URL}/mensalidades/aluno/${alunoId}`);
  if (!response.ok) throw new Error('Erro ao buscar mensalidades');
  return response.json();
}

// Buscar acessos de um aluno
export async function fetchAcessos(alunoId) {
  const response = await fetch(`${API_BASE_URL}/acessos/aluno/${alunoId}`);
  if (!response.ok) throw new Error('Erro ao buscar acessos');
  return response.json();
}

// Criar aluno
export async function createAluno(dadosAluno) {
  const response = await fetch(`${API_BASE_URL}/alunos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAluno),
  });

  if (!response.ok) throw new Error('Erro ao criar aluno');
  return response.json();
}

// Atualizar aluno
export async function updateAluno(id, dadosAluno) {
  const response = await fetch(`${API_BASE_URL}/alunos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAluno),
  });

  if (!response.ok) throw new Error('Erro ao atualizar aluno');
  return response.json();
}
