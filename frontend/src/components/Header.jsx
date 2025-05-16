import React from "react";

export default function Header() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-blue-800 text-white flex items-center justify-between px-6 shadow-md z-50">
      <div>
        <h2 className="text-lg font-semibold">SA - Gestão Academia</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button
          className="hover:bg-blue-700 rounded p-2"
          title="Buscar"
          aria-label="Buscar"
        >
          🔍
        </button>
        <button
          className="hover:bg-blue-700 rounded p-2"
          title="Notificações"
          aria-label="Notificações"
        >
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
