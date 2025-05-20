import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-white shadow-lg p-4 flex flex-col">
      <h1 className="text-xl font-bold text-blue-700 mb-6">Academia SA</h1>
      <nav className="flex-grow space-y-2">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            "block px-4 py-2 rounded font-medium " + 
            (isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100")
          }
        >
          📊 Dashboard
        </NavLink>
        <NavLink 
          to="/alunos" 
          className={({ isActive }) => 
            "block px-4 py-2 rounded font-medium " + 
            (isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100")
          }
        >
          👤 Alunos
        </NavLink>
        <NavLink 
          to="/produtos" 
          className={({ isActive }) => 
            "block px-4 py-2 rounded font-medium " + 
            (isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100")
          }
        >
          🛒 Produtos
        </NavLink>
        <NavLink 
          to="/vendas-produtos" 
          className={({ isActive }) => 
            "block px-4 py-2 rounded font-medium " + 
            (isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100")
          }
        >
          💰 Vendas
        </NavLink>
        {/* Outros links futuros */}
      </nav>
    </aside>
  );
}
