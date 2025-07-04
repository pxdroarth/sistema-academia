import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AlunosPage from "./pages/alunos/AlunosPage";
import FormAlunoPage from "./pages/alunos/FormAlunoPage";
import PerfilPage from "./pages/alunos/PerfilPage";
import PlanosPage from "./pages/planos/PlanosPage";
import ProdutosPage from "./pages/produtos/ProdutosPage";
import VendasProdutosPage from "./pages/vendasProdutos/VendasProdutosPage";
import PagamentoAntecipado from './pages/mensalidades/PagamentoAntecipado';
import PlanoContasPage from './pages/financeiro/PlanoContasPage';


// ✅ Módulo Financeiro
import FinanceiroLayout from './pages/financeiro/FinanceiroLayout';
import FinanceiroDashboard from "./pages/financeiro/FinanceiroDashboard";
import ContasFinanceirasPage from './pages/financeiro/ContasFinanceirasPage';

// Wrapper para passar o alunoId da URL para o componente
function PagamentoAntecipadoWrapper() {
  const params = useParams();
  const alunoId = parseInt(params.alunoId, 10);
  return <PagamentoAntecipado alunoId={alunoId} />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Todas as rotas com layout fixo (sidebar, header) */}
        <Route element={<Layout />}>
          {/* Redirecionamento */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Rotas principais */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="/alunos/novo" element={<FormAlunoPage />} />
          <Route path="/alunos/:id" element={<PerfilPage />} />
          <Route path="/alunos/editar/:id" element={<FormAlunoPage />} />
          <Route path="/planos" element={<PlanosPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/vendas-produtos" element={<VendasProdutosPage />} />
          <Route path="/mensalidades/pagamento-antecipado/:alunoId" element={<PagamentoAntecipadoWrapper />} />

          {/* ✅ Módulo Financeiro com rotas aninhadas */}
          <Route path="/financeiro" element={<FinanceiroLayout />}>
            <Route index element={<FinanceiroDashboard />} />
<<<<<<< HEAD
=======
            <Route path="dashboard" element={<FinanceiroDashboard />} />
>>>>>>> 8417fe8 (atualizacao de componentes)
            <Route path="contas-financeiras" element={<ContasFinanceirasPage />} />
            <Route path="plano-contas" element={<PlanoContasPage />} />
            {/* Aqui você poderá adicionar futuras rotas como relatórios, despesas, etc */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
