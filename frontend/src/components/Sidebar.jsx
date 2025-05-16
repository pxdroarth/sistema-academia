import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar-fixed">
      <div className="sidebar-header">SISTEMA SCA</div>
      <nav className="sidebar-links">
        <NavLink
          to="/alunos"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Alunos
        </NavLink>
        <NavLink
          to="/financeiro"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Financeiro
        </NavLink>
        <NavLink
          to="/relacionamento"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Relacionamento
        </NavLink>
        {/* Adicione outros links conforme o sistema */}
      </nav>
      <div className="p-4 border-t border-blue-700 flex items-center space-x-3">
        <img
          src="/user-avatar.png"
          alt="Usuário"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="text-sm font-semibold">José</p>
          <p className="text-xs text-blue-300">Administrador</p>
        </div>
      </div>
    </aside>
  );
}
