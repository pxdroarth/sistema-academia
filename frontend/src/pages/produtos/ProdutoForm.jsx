import React, { useEffect, useState } from "react";
import { createProduto, updateProduto } from "../../services/Api";

export default function ProdutoForm({ produto, onSuccess, onCancel }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imagemFile, setImagemFile] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (produto) {
      setNome(produto.nome || "");
      setDescricao(produto.descricao || "");
      setPreco(produto.preco !== undefined ? produto.preco : "");
      setEstoque(produto.estoque !== undefined ? produto.estoque : "");
      setImagemFile(null);
      setErro(null);
    } else {
      setNome("");
      setDescricao("");
      setPreco("");
      setEstoque("");
      setImagemFile(null);
      setErro(null);
    }
  }, [produto]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);

    if (!nome.trim() || preco === "" || estoque === "") {
      setErro("Preencha os campos obrigatórios.");
      return;
    }

    // Conversão do preço para formato numérico com ponto decimal
    let precoFormatado = preco.toString().replace(",", ".");
    if (isNaN(Number(precoFormatado))) {
      setErro("Preço inválido.");
      return;
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("descricao", descricao);
    formData.append("preco", precoFormatado);
    formData.append("estoque", estoque);
    if (imagemFile) {
      formData.append("imagem", imagemFile);
    }

    try {
      if (produto && produto.id) {
        await updateProduto(produto.id, formData);
      } else {
        await createProduto(formData);
      }
      onSuccess();
    } catch (err) {
      setErro("Erro ao salvar produto: " + (err.message || "Erro desconhecido"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded shadow space-y-4">
      {erro && <p className="text-red-600">{erro}</p>}

      <div>
        <label className="block font-semibold mb-1">Nome*</label>
        <input
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Descrição</label>
        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Preço* (ex: 10.50)</label>
        <input
          type="text"
          value={preco}
          onChange={e => setPreco(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="0.00"
          required
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Estoque*</label>
        <input
          type="number"
          min="0"
          step="1"
          value={estoque}
          onChange={e => setEstoque(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Imagem</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImagemFile(e.target.files[0])}
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {produto ? "Atualizar" : "Cadastrar"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
