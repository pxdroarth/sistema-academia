const express = require("express");
const router = express.Router();
const { runQuery } = require("../dbHelper");
const { sincronizarFinanceiro } = require("../services/FinanceService");

// 🔹 Listar vendas com filtro por data e paginação
router.get("/", async (req, res) => {
  const { data_inicial, data_final, pagina = 1, limite = 10 } = req.query;

  const offset = (parseInt(pagina) - 1) * parseInt(limite);
  const params = [];

  let filtros = "WHERE 1=1";
  if (data_inicial) {
    filtros += " AND vp.data_venda >= ?";
    params.push(data_inicial);
  }
  if (data_final) {
    filtros += " AND vp.data_venda <= ?";
    params.push(data_final);
  }

  try {
    const sql = `
      SELECT vp.id, vp.produto_nome, vp.quantidade, vp.preco_unitario, vp.valor_total, vp.data_venda
      FROM venda_produto vp
      ${filtros}
      ORDER BY vp.data_venda DESC
      LIMIT ? OFFSET ?
    `;
    const vendas = await runQuery(sql, [...params, parseInt(limite), offset]);

    const countSql = `
      SELECT COUNT(*) as total
      FROM venda_produto vp
      ${filtros}
    `;
    const countResult = await runQuery(countSql, params);
    const total = countResult[0]?.total || 0;

    res.json({ vendas, total });
  } catch (error) {
    console.error("❌ Erro ao listar vendas:", error);
    res.status(500).json({ error: "Erro ao listar vendas" });
  }
});

// 🔹 Registrar nova venda e salvar nome do produto
router.post("/", async (req, res) => {
  const { produto_id, quantidade, preco_unitario } = req.body;

  if (!produto_id || !quantidade || !preco_unitario) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  try {
    const produto = await runQuery("SELECT nome, estoque FROM produto WHERE id = ?", [produto_id]);

    if (!produto || produto.length === 0) {
      console.warn("⚠️ Produto não encontrado:", produto_id);
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const { nome: produto_nome, estoque } = produto[0];

    if (estoque < quantidade) {
      return res.status(400).json({ error: "Estoque insuficiente" });
    }

    const valor_total = quantidade * preco_unitario;

    const insert = `
      INSERT INTO venda_produto (produto_id, produto_nome, quantidade, preco_unitario, valor_total)
      VALUES (?, ?, ?, ?, ?)
    `;
    const venda = await runQuery(insert, [produto_id, produto_nome, quantidade, preco_unitario, valor_total]);

    await runQuery("UPDATE produto SET estoque = estoque - ? WHERE id = ?", [quantidade, produto_id]);
    await sincronizarFinanceiro();

    res.status(201).json({
      id: venda.lastID,
      produto_id,
      produto_nome,
      quantidade,
      preco_unitario,
      valor_total
    });
  } catch (error) {
    console.error("❌ Erro ao registrar venda:", error);
    res.status(500).json({ error: "Erro interno ao registrar venda" });
  }
});

module.exports = router;
