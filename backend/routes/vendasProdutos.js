const express = require("express");
const router = express.Router();
const pool = require("../database");

// Listar todas vendas de produtos
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT vp.*, p.nome AS produto_nome
      FROM venda_produto vp
      LEFT JOIN produto p ON vp.produto_id = p.id
      ORDER BY vp.data_venda DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar venda de produto
router.post("/", async (req, res) => {
  const { produto_id, quantidade, preco_unitario } = req.body;

  if (!produto_id || !quantidade || !preco_unitario) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  try {
    // Atualiza estoque do produto
    const [produtoRows] = await pool.query("SELECT estoque FROM produto WHERE id = ?", [produto_id]);
    if (produtoRows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const estoqueAtual = produtoRows[0].estoque;

    if (estoqueAtual < quantidade) {
      return res.status(400).json({ error: "Estoque insuficiente" });
    }

    // Insere venda
    const [result] = await pool.query(
      "INSERT INTO venda_produto (produto_id, quantidade, preco_unitario) VALUES (?, ?, ?)",
      [produto_id, quantidade, preco_unitario]
    );

    // Atualiza estoque
    await pool.query("UPDATE produto SET estoque = estoque - ? WHERE id = ?", [quantidade, produto_id]);

    res.status(201).json({ id: result.insertId, produto_id, quantidade, preco_unitario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
