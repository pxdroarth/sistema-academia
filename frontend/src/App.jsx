import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AlunosPage from "./pages/alunos/AlunosPage";
import FormAlunoPage from "./pages/alunos/FormAlunoPage";
import PerfilPage from "./pages/alunos/PerfilPage";
import PlanosPage from "./pages/planos/PlanosPage";
import ProdutosPage from "./pages/produtos/ProdutosPage";
import VendasProdutosPage from "./pages/vendasProdutos/VendasProdutosPage";

function App() {
  return (
    <Router>
  <Routes>
    {/* Toda rota que deve mostrar Header e Sidebar deve estar dentro de Layout */}
    <Route element={<Layout />}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/alunos" element={<AlunosPage />} />
      <Route path="/planos" element={<PlanosPage />} />
      <Route path="/alunos/novo" element={<FormAlunoPage />} />
      <Route path="/alunos/:id" element={<PerfilPage />} />
      <Route path="/alunos/editar/:id" element={<FormAlunoPage />} />
      <Route path="/produtos" element={<ProdutosPage />} />
      <Route path="/vendas-produtos" element={<VendasProdutosPage />} />

    </Route>
  </Routes>
</Router>
  );
}

export default App;
