const API_BASE_URL = 'http://localhost:3001';

export async function fetchAlunos() {
  const response = await fetch(`${API_BASE_URL}/alunos`);
  if (!response.ok) throw new Error('Erro ao buscar alunos');
  return response.json();
}

export async function fetchMensalidades(alunoId) {
  const response = await fetch(`${API_BASE_URL}/mensalidades/aluno/${alunoId}`);
  if (!response.ok) throw new Error('Erro ao buscar mensalidades');
  return response.json();
}

export async function fetchAcessos(alunoId) {
  const response = await fetch(`${API_BASE_URL}/acessos/aluno/${alunoId}`);
  if (!response.ok) throw new Error('Erro ao buscar acessos');
  return response.json();
}
