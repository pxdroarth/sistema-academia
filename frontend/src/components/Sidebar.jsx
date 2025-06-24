import { NavLink } from "react-router-dom";
import { useState } from "react";

const menu = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/alunos", label: "Alunos", icon: "👤" },
  { to: "/produtos", label: "Produtos", icon: "🛒" },
  { to: "/vendas-produtos", label: "Vendas", icon: "💰" },
  { to: "/financeiro", label: "Financeiro", icon: "💸" },
];

export default function Sidebar({ aberta = true }) {
  const [hovering, setHovering] = useState(false);
  const expanded = hovering || aberta;

  return (
    <aside
      className={`transition-all duration-300 h-screen fixed top-0 left-0 bg-white shadow-lg border-r 
        ${expanded ? "w-64" : "w-16"} 
        flex flex-col z-50`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Logo / título */}
      <div className="h-16 flex items-center justify-center font-bold text-blue-700 text-lg border-b">
        {expanded ? "Academia SA" : "🏋️"}
      </div>

      {/* Navegação */}
      <nav className="flex-grow px-2 py-4 space-y-1 overflow-y-auto">
        {menu.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="text-xl">{icon}</span>
            {expanded && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
