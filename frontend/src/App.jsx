import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AlunosPage from "./pages/alunos/AlunosPage";
import FormAlunoPage from "./pages/alunos/FormAlunoPage"; // ✅ Corrigido
import PerfilPage from "./pages/alunos/PerfilPage";
import PlanosPage from "./pages/planos/PlanosPage";
import ProdutosPage from "./pages/produtos/ProdutosPage";
import VendasProdutosPage from "./pages/vendasProdutos/VendasProdutosPage";
import PagamentoAntecipado from './pages/mensalidades/PagamentoAntecipado';
import PlanoContasPage from './pages/financeiro/PlanoContasPage';
import FinanceiroLayout from './pages/financeiro/FinanceiroLayout';
import FinanceiroDashboard from "./pages/financeiro/FinanceiroDashboard";
import ContasFinanceirasPage from './pages/financeiro/ContasFinanceirasPage';

// Wrapper para Pagamento Antecipado
function PagamentoAntecipadoWrapper() {
  const params = useParams();
  const alunoId = parseInt(params.alunoId, 10);
  return <PagamentoAntecipado alunoId={alunoId} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Alunos */}
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="/alunos/novo" element={<FormAlunoPage />} /> {/* ✅ Corrigido */}
          <Route path="/alunos/editar/:id" element={<FormAlunoPage />} /> {/* ✅ Corrigido */}
          <Route path="/alunos/:id" element={<PerfilPage />} />

          {/* Outros módulos */}
          <Route path="/planos" element={<PlanosPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/vendas-produtos" element={<VendasProdutosPage />} />
          <Route path="/mensalidades/pagamento-antecipado/:alunoId" element={<PagamentoAntecipadoWrapper />} />

          {/* Financeiro */}
          <Route path="/financeiro" element={<FinanceiroLayout />}>
            <Route index element={<FinanceiroDashboard />} />
            <Route path="dashboardFinanceiro" element={<FinanceiroDashboard />} />
            <Route path="contas-financeiras" element={<ContasFinanceirasPage />} />
            <Route path="plano-contas" element={<PlanoContasPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
