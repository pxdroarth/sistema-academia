import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-white shadow-lg p-4 flex flex-col">
      <h1 className="text-xl font-bold text-blue-700 mb-6">Academia SA</h1>
      <nav className="flex-grow space-y-2">
        <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100 font-medium">
          📊 Dashboard
        </Link>
        <Link to="/alunos" className="block px-4 py-2 rounded hover:bg-gray-100 font-medium">
          👤 Alunos
        </Link>
        {/* outros links futuros aqui */}
      </nav>
    </aside>
  );
}
