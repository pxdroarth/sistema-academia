import React, { useState, useEffect } from 'react';

export default function FormAluno({ aluno, onSalvar, onCancelar }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('ativo');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (aluno) {
      setNome(aluno.nome || '');
      setCpf(aluno.cpf || '');
      setEmail(aluno.email || '');
      setStatus(aluno.status || 'ativo');
    } else {
      setNome('');
      setCpf('');
      setEmail('');
      setStatus('ativo');
    }
    setErro('');
  }, [aluno]);

  function validarCampos() {
    if (!nome.trim()) return 'Nome é obrigatório.';
    if (!cpf.trim()) return 'CPF é obrigatório.';
    if (!email.trim()) return 'Email é obrigatório.';
    // Pode incluir validação mais complexa aqui (ex: formato de email/CPF)
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const erroValidacao = validarCampos();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(true);
    setErro('');
    try {
      await onSalvar({ nome, cpf, email, status });
    } catch {
      setErro('Erro ao salvar aluno. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">{aluno ? 'Editar Aluno' : 'Novo Aluno'}</h2>

      {erro && <p className="text-red-600 font-semibold">{erro}</p>}

      <div>
        <label className="block font-medium mb-1" htmlFor="nome">Nome</label>
        <input
          type="text"
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nome completo"
          disabled={salvando}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1" htmlFor="cpf">CPF</label>
        <input
          type="text"
          id="cpf"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="CPF"
          disabled={salvando}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1" htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="email@exemplo.com"
          disabled={salvando}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1" htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={salvando}
          required
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={salvando}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>

        <button
          type="button"
          onClick={onCancelar}
          disabled={salvando}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
