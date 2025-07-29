import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function FormAlunoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNovo = !id || id === "novo";

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    status: "ativo",
    dia_vencimento: "",
    plano_id: "",
  });

  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/planos")
      .then(res => res.json())
      .then(setPlanos)
      .catch(() => setErro("Erro ao carregar planos"));
  }, []);

  useEffect(() => {
    if (isNovo) return;
    async function carregarAluno() {
      try {
        const res = await fetch(`http://localhost:3001/alunos/${id}`);
        if (!res.ok) throw new Error("Aluno não encontrado");
        const data = await res.json();
        setForm({
          nome: data.nome,
          cpf: data.cpf,
          email: data.email,
          status: data.status,
          dia_vencimento: data.dia_vencimento || "",
          plano_id: data.plano_id || "",
        });
      } catch (err) {
        setErro(err.message);
      }
    }
    carregarAluno();
  }, [id, isNovo]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const metodo = isNovo ? "POST" : "PUT";
      const url = isNovo
        ? "http://localhost:3001/alunos"
        : `http://localhost:3001/alunos/${id}`;

      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao salvar aluno");

      toast.success(isNovo ? "Aluno cadastrado com sucesso!" : "Aluno atualizado com sucesso!");
      navigate("/alunos");
    } catch (error) {
      toast.error(error.message || "Erro ao salvar aluno");
    } finally {
      setCarregando(false);
    }
  }

  if (erro) return <div className="p-4 text-red-600 font-bold">Erro: {erro}</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">
        {isNovo ? "Cadastrar Novo Aluno" : "Editar Aluno"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-semibold">Nome:</label>
          <input name="nome" value={form.nome} onChange={handleChange} required className="w-full border rounded px-4 py-2" />
        </div>
        <div>
          <label className="font-semibold">CPF:</label>
          <input name="cpf" value={form.cpf} onChange={handleChange} required className="w-full border rounded px-4 py-2" />
        </div>
        <div>
          <label className="font-semibold">Email:</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-4 py-2" />
        </div>
        <div>
          <label className="font-semibold">Status:</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-4 py-2">
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div>
          <label className="font-semibold">Dia de Vencimento:</label>
          <input type="number" name="dia_vencimento" value={form.dia_vencimento} onChange={handleChange} min={1} max={31} required className="w-full border rounded px-4 py-2" />
        </div>
        <div>
          <label className="font-semibold">Plano:</label>
          <select name="plano_id" value={form.plano_id} onChange={handleChange} required className="w-full border rounded px-4 py-2">
            <option value="">Selecione o plano</option>
            {planos.map(plano => (
              <option key={plano.id} value={plano.id}>{plano.nome}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate("/alunos")} className="border px-4 py-2 rounded text-gray-700 hover:bg-gray-100">Cancelar</button>
          <button type="submit" disabled={carregando} className={`px-4 py-2 rounded text-white font-bold ${carregando ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
            {carregando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
