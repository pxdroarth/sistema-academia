import React from "react";

export default function Header() {
  return (
    <header className="header-fixed">
      <div>
        <h2 className="text-lg font-semibold">SCA - Gestão Fitness</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="hover:bg-blue-600 rounded p-2" title="Buscar">
          🔍
        </button>
        <button className="hover:bg-blue-600 rounded p-2" title="Notificações">
          🔔
        </button>
        <div className="flex items-center space-x-2 cursor-pointer">
          <img
            src="/user-avatar.png"
            alt="Usuário"
            className="w-8 h-8 rounded-full"
          />
          <span>José</span>
        </div>
      </div>
    </header>
  );
}
