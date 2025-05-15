import React, { useEffect, useState } from 'react';
import TelaAluno from './components/TelaAluno';
import TelaMensalidade from './components/TelaMensalidade';
import TelaAcesso from './components/TelaAcesso';

import { fetchAlunos, fetchMensalidades, fetchAcessos } from './services/Api';

function App() {
  const alunoId = 1; // Ajuste para o aluno que deseja testar
  const [aluno, setAluno] = useState(null);
  const [mensalidades, setMensalidades] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setError(null);

        const alunosData = await fetchAlunos();
        const alunoEncontrado = alunosData.find(a => a.id === alunoId);
        setAluno(alunoEncontrado);

        const mensalidadesData = await fetchMensalidades(alunoId);
        setMensalidades(mensalidadesData);

        const acessosData = await fetchAcessos(alunoId);
        setAcessos(acessosData);

      } catch (err) {
        setError('Erro ao carregar dados. Tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [alunoId]);

  if (loading) return <p className="p-6">Carregando dados...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="App p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Sistema de Academia</h1>
      
      <TelaAluno aluno={aluno} debitos={mensalidades.find(m => m.status !== 'paga')} />
      <TelaMensalidade mensalidades={mensalidades} />
      <TelaAcesso acessos={acessos} />
    </div>
  );
}

export default App;
