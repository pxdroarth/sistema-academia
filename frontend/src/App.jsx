import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AlunosPage from "./pages/aluno/AlunosPage";
import FormAlunoPage from "./pages/aluno/FormAlunoPage";
import PerfilPage from "./pages/aluno/PerfilPage";
import PlanosPage from "./pages/planos/PlanosPage";

function App() {
  return (
    <Router>
  <Routes>
    {/* Toda rota que deve mostrar Header e Sidebar deve estar dentro de Layout */}
    <Route element={<Layout />}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/alunos" element={<AlunosPage />} />
      <Route path="/aluno/novo" element={<FormAlunoPage />} />
      <Route path="/aluno/:id" element={<PerfilPage />} />
      <Route path="/planos" element={<PlanosPage />} />
    </Route>
  </Routes>
</Router>
  );
}

export default App;
