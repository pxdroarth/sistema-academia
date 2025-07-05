const express = require("express");
const router = express.Router();
const { runQuery } = require("../dbHelper");

// Listar vendas com filtro opcional por data
router.get("/", async (req, res) => {
  const { data_inicial, data_final } = req.query;
  let sql = `
    SELECT vp.*, p.nome AS produto_nome
    FROM venda_produto vp
    LEFT JOIN produto p ON vp.produto_id = p.id
    WHERE 1=1`;
  const params = [];
  if (data_inicial) { sql += " AND vp.data_venda >= ?"; params.push(data_inicial); }
  if (data_final)   { sql += " AND vp.data_venda <= ?"; params.push(data_final); }
  sql += " ORDER BY vp.data_venda DESC";
  try {
    const rows = await runQuery(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar nova venda e atualizar estoque
router.post("/", async (req, res) => {
  const { produto_id, quantidade, preco_unitario } = req.body;
  if (!produto_id || !quantidade || !preco_unitario) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }
  try {
    // Verifica estoque atual
    const produto = await runQuery("SELECT estoque FROM produto WHERE id = ?", [produto_id]);
    if (produto.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    const estoqueAtual = produto[0].estoque;
    if (estoqueAtual < quantidade) {
      return res.status(400).json({ error: "Estoque insuficiente" });
    }
    // Registra a venda
    const venda = await runQuery(
      "INSERT INTO venda_produto (produto_id, quantidade, preco_unitario) VALUES (?, ?, ?)",
      [produto_id, quantidade, preco_unitario]
    );
    // Atualiza o estoque do produto
    await runQuery("UPDATE produto SET estoque = estoque - ? WHERE id = ?", [quantidade, produto_id]);
    res.status(201).json({
      id: venda.lastID,
      produto_id,
      quantidade,
      preco_unitario
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
