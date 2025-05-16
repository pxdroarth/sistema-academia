import React from "react";

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-blue-900 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-8">SCA</h1>
      <nav className="flex flex-col gap-4">
        <a href="/alunos" className="px-3 py-2 rounded bg-blue-700 font-semibold">Alunos</a>
        <a href="/mensalidades" className="px-3 py-2 rounded hover:bg-blue-700">Mensalidades</a>
        <a href="/acessos" className="px-3 py-2 rounded hover:bg-blue-700">Acessos</a>
        {/* Adicione mais itens aqui */}
      </nav>
    </aside>
  );
}

function Header() {
  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-blue-800 text-white flex items-center justify-end px-6 shadow-md">
      <div className="flex items-center gap-4">
        <span>Olá, José</span>
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Usuário"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </header>
  );
}

function App() {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-14 p-6 bg-gray-100 min-h-screen">
        {/* Conteúdo principal aqui */}
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6">Dashboard / Alunos</h2>
          <p>Conteúdo das páginas vai aqui.</p>
        </div>
      </main>
    </>
  );
}

export default App;
