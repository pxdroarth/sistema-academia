import React, { useEffect, useState } from 'react';
import TelaAluno from './components/TelaAluno';
import TelaMensalidade from './components/TelaMensalidade';
import TelaAcesso from './components/TelaAcesso';
import FormAluno from './components/FormAluno';

import {
  fetchAlunos,
  fetchMensalidades,
  fetchAcessos,
  createAluno,
  updateAluno,
} from './services/Api';

function App() {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [mensalidades, setMensalidades] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [formAberto, setFormAberto] = useState(false);
  const [error, setError] = useState(null);

  // Novo estado para a busca
  const [buscaNome, setBuscaNome] = useState('');

  useEffect(() => {
    carregarAlunos();
  }, []);

  async function carregarAlunos() {
    try {
      const dados = await fetchAlunos();
      setAlunos(dados);
      if (dados.length > 0) {
        setAlunoSelecionado(dados[0]);
      }
    } catch (err) {
      setError('Erro ao carregar alunos.');
    }
  }

  useEffect(() => {
    if (alunoSelecionado) {
      carregarMensalidades(alunoSelecionado.id);
      carregarAcessos(alunoSelecionado.id);
    } else {
      setMensalidades([]);
      setAcessos([]);
    }
  }, [alunoSelecionado]);

  async function carregarMensalidades(alunoId) {
    try {
      const dados = await fetchMensalidades(alunoId);
      setMensalidades(dados);
    } catch {
      setError('Erro ao carregar mensalidades.');
    }
  }

  async function carregarAcessos(alunoId) {
    try {
      const dados = await fetchAcessos(alunoId);
      setAcessos(dados);
    } catch {
      setError('Erro ao carregar acessos.');
    }
  }

  function abrirForm(aluno = null) {
    setAlunoSelecionado(aluno);
    setFormAberto(true);
  }

  function fecharForm() {
    setFormAberto(false);
    setAlunoSelecionado(null);
  }

  async function salvarAluno(dadosAluno) {
    try {
      if (alunoSelecionado && alunoSelecionado.id) {
        await updateAluno(alunoSelecionado.id, dadosAluno);
      } else {
        await createAluno(dadosAluno);
      }
      fecharForm();
      carregarAlunos();
    } catch {
      setError('Erro ao salvar aluno.');
    }
  }

  // Filtra alunos pelo nome usando o texto da busca
  const alunosFiltrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(buscaNome.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* Sidebar lateral */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h1 className="text-xl font-bold text-blue-700 mb-4">Alunos</h1>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
          className="mb-4 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          onClick={() => abrirForm()}
          className="mb-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          + Novo Aluno
        </button>
        <nav className="flex-grow overflow-y-auto">
          {alunosFiltrados.length === 0 && <p className="text-gray-500">Nenhum aluno encontrado.</p>}
          <ul>
            {alunosFiltrados.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setAlunoSelecionado(a)}
                  className={`w-full text-left px-3 py-2 mb-1 rounded transition ${
                    alunoSelecionado?.id === a.id
                      ? 'bg-blue-200 font-semibold'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {a.nome}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Área principal */}
      <main className="flex-grow p-6 overflow-y-auto">
        {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

        {formAberto ? (
          <div
            className="max-w-md mx-auto bg-white shadow-md rounded p-6
            animate-fadeIn"
          >
            <FormAluno aluno={alunoSelecionado} onSalvar={salvarAluno} onCancelar={fecharForm} />
          </div>
        ) : alunoSelecionado ? (
          <>
            <div className="max-w-4xl mx-auto space-y-6">
              <TelaAluno
                aluno={alunoSelecionado}
                debitos={mensalidades.find((m) => m.status !== 'paga')}
              />
              <TelaMensalidade mensalidades={mensalidades} />
              <TelaAcesso acessos={acessos} />
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">Selecione um aluno ou crie um novo.</p>
        )}
      </main>
    </div>
  );
}

export default App;
