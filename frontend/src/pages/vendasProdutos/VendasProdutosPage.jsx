import React, { useEffect, useState } from "react";
import { fetchProdutos, fetchVendasProdutos, createVendaProduto } from "../../services/Api";

export default function VendasProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  useEffect(() => {
    carregarProdutos();
    carregarVendas();
  }, []);

  async function carregarProdutos() {
    try {
      const dados = await fetchProdutos();
      setProdutos(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function carregarVendas() {
    try {
      const dados = await fetchVendasProdutos();
      setVendas(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function handleVenda(e) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!produtoSelecionado) {
      setErro("Selecione um produto.");
      return;
    }
    if (quantidade <= 0) {
      setErro("Quantidade deve ser maior que zero.");
      return;
    }
    if (quantidade > produtoSelecionado.estoque) {
      setErro("Quantidade maior que o estoque disponível.");
      return;
    }

    try {
      await createVendaProduto({
        produto_id: produtoSelecionado.id,
        quantidade,
        preco_unitario: Number(produtoSelecionado.preco),
      });
      setSucesso("Venda registrada com sucesso!");
      setQuantidade(1);
      setProdutoSelecionado(null);
      carregarProdutos();
      carregarVendas();
    } catch (e) {
      setErro("Erro ao registrar venda: " + e.message);
    }
  }

  // Converter preço seguro para string formatada com 2 casas decimais
  const formatPreco = (preco) => {
    const n = Number(preco);
    return isNaN(n) ? "0.00" : n.toFixed(2);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Vendas de Produtos</h2>

      {erro && <p className="text-red-600">{erro}</p>}
      {sucesso && <p className="text-green-600">{sucesso}</p>}

      <form onSubmit={handleVenda} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-semibold">Produto</label>
          <select
            value={produtoSelecionado ? produtoSelecionado.id : ""}
            onChange={(e) =>
              setProdutoSelecionado(produtos.find(p => p.id === Number(e.target.value)))
            }
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Selecione um produto</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome} (Estoque: {produto.estoque})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Quantidade</label>
          <input
            type="number"
            min="1"
            max={produtoSelecionado ? produtoSelecionado.estoque : 1}
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Preço unitário</label>
          <input
            type="text"
            value={produtoSelecionado ? `R$ ${formatPreco(produtoSelecionado.preco)}` : ""}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Total</label>
          <input
            type="text"
            value={produtoSelecionado ? `R$ ${formatPreco(Number(produtoSelecionado.preco) * quantidade)}` : ""}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Registrar Venda
        </button>
      </form>

      <h3 className="mt-8 text-xl font-semibold">Vendas Registradas</h3>
      <div className="overflow-x-auto max-h-96 mt-2 border rounded">
        <table className="min-w-full text-left">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="p-3 border">Produto</th>
              <th className="p-3 border">Quantidade</th>
              <th className="p-3 border">Preço Unitário</th>
              <th className="p-3 border">Data Venda</th>
            </tr>
          </thead>
          <tbody>
            {vendas.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-3 text-center">Nenhuma venda registrada.</td>
              </tr>
            ) : (
              vendas.map(({ id, produto_nome, quantidade, preco_unitario, data_venda }) => (
                <tr key={id} className="border-t hover:bg-gray-50">
                  <td className="p-3 border">{produto_nome}</td>
                  <td className="p-3 border">{quantidade}</td>
                  <td className="p-3 border">R$ {formatPreco(preco_unitario)}</td>
                  <td className="p-3 border">{new Date(data_venda).toLocaleString("pt-BR")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
