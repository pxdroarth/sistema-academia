const express = require('express');
const router = express.Router();
const { runQuery, runGet } = require('../dbHelper');

// Função utilitária
const ymd = d => d.toISOString().slice(0, 10);

// 1) GET /financeiro/mensalidades (filtrada)
router.get('/mensalidades', async (req, res) => {
  const { data_inicial, data_final, status = 'todos' } = req.query;

  let sql = 'SELECT status, valor_cobrado FROM mensalidade WHERE 1=1';
  const params = [];

  if (data_inicial) { sql += ' AND vencimento >= ?'; params.push(data_inicial); }
  if (data_final)   { sql += ' AND vencimento <= ?'; params.push(data_final); }
  if (status !== 'todos') { sql += ' AND status = ?'; params.push(status); }

  try {
    const rows = await runQuery(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar mensalidades' });
  }
});

// 2) GET /financeiro/vendas-produtos (filtrada)
router.get('/vendas-produtos', async (req, res) => {
  const { data_inicial, data_final } = req.query;

  let sql = 'SELECT quantidade, preco_unitario FROM venda_produto WHERE 1=1';
  const params = [];

  if (data_inicial) { sql += ' AND data_venda >= ?'; params.push(data_inicial); }
  if (data_final)   { sql += ' AND data_venda <= ?'; params.push(data_final); }

  try {
    const rows = await runQuery(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao buscar vendas' });
  }
});

// 3) GET /financeiro/fluxo (Entradas × Saídas por dia)
router.get('/fluxo', async (req, res) => {
  try {
    const { periodo = 'mensal' } = req.query;
    const hoje = new Date();
    let inicio;

    if (periodo === 'diario') {
      inicio = hoje;
    } else if (periodo === 'semanal') {
      inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - hoje.getDay());
    } else {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    const ini = ymd(inicio);
    const fim = ymd(hoje);

    const entradas = await runQuery(`
      SELECT DATE(d) AS dia, SUM(v) AS total
      FROM (
        SELECT data_pagamento AS d, valor_pago AS v FROM pagamento
        UNION ALL
        SELECT data_venda AS d, quantidade * preco_unitario AS v FROM venda_produto
      ) t
      WHERE d BETWEEN ? AND ?
      GROUP BY DATE(d)
      ORDER BY DATE(d)
    `, [ini, fim]);

    let saidas = [];
    try {
      saidas = await runQuery(`
        SELECT DATE(data_despesa) AS dia, SUM(valor) AS total
        FROM despesa
        WHERE data_despesa BETWEEN ? AND ?
        GROUP BY DATE(data_despesa)
      `, [ini, fim]);
    } catch (_) { /* tabela ainda não existe */ }

    const toSerie = (rows, id) => ({
      id,
      data: rows.map(r => ({
        x: new Date(r.dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        y: Number(r.total)
      }))
    });

    res.json([toSerie(entradas, 'Entradas'), toSerie(saidas, 'Saídas')]);
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao gerar fluxo de caixa' });
  }
});

// 4) GET /financeiro/resumo
router.get('/resumo', async (req, res) => {
  try {
    const { periodo = 'mensal' } = req.query;
    const hoje = new Date();
    let inicio;

    if (periodo === 'diario') inicio = hoje;
    else if (periodo === 'semanal') {
      inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - hoje.getDay());
    } else {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    const ini = ymd(inicio), fim = ymd(hoje);

    const mens = await runGet(`
      SELECT
        SUM(CASE WHEN status = 'pago' THEN valor_cobrado ELSE 0 END) AS receita_recebida,
        SUM(CASE WHEN status = 'em_aberto' THEN valor_cobrado ELSE 0 END) AS pendencias
      FROM mensalidade
      WHERE vencimento BETWEEN ? AND ?
    `, [ini, fim]);

    const vend = await runGet(`
      SELECT
        COALESCE(SUM(quantidade * preco_unitario), 0) AS receita_vendas,
        COUNT(*) AS total_vendas
      FROM venda_produto
      WHERE data_venda BETWEEN ? AND ?
    `, [ini, fim]);

    res.json({ periodo, intervalo: { inicio: ini, fim }, mensalidades: mens, vendas: vend });
  } catch (e) {
    res.status(500).json({ erro: 'Falha no resumo' });
  }
});

// 5) GET /financeiro/indicadores
router.get('/indicadores', async (req, res) => {
  try {
    const { periodo = 'mensal' } = req.query;
    const hoje = new Date();
    let inicio;

    if (periodo === 'diario') {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    } else if (periodo === 'semanal') {
      inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - hoje.getDay());
    } else {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    const ini = ymd(inicio), fim = ymd(hoje);

    const mens = await runGet(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_cobrado ELSE 0 END), 0) AS receita_mensalidades,
        COALESCE(SUM(CASE WHEN status = 'em_aberto' THEN valor_cobrado ELSE 0 END), 0) AS pendencias
      FROM mensalidade
      WHERE data_pagamento BETWEEN ? AND ?
    `, [ini, fim]);

    const vend = await runGet(`
      SELECT COALESCE(SUM(quantidade * preco_unitario), 0) AS receita_vendas
      FROM venda_produto
      WHERE data_venda BETWEEN ? AND ?
    `, [ini, fim]);

    let despesas = 0;
    try {
      const result = await runGet(`
        SELECT COALESCE(SUM(valor), 0) AS total
        FROM despesa
        WHERE data_despesa BETWEEN ? AND ?
      `, [ini, fim]);
      despesas = result.total;
    } catch (_) { /* Tabela não existe */ }

    const receita_total = mens.receita_mensalidades + vend.receita_vendas;
    const saldo_atual = receita_total - despesas;

    res.json({
      receita_total,
      despesas_total: despesas,
      saldo_atual,
      pendencias: mens.pendencias
    });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao gerar indicadores financeiros' });
  }
});
// 6) GET /financeiro/kpis
router.get('/kpis', async (req, res) => {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ini = ymd(inicio);
    const fim = ymd(hoje);

    // Receita recebida = apenas mensalidades pagas
    const mensalidades = await runGet(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_cobrado ELSE 0 END), 0) AS receita_recebida,
        COALESCE(SUM(CASE WHEN status = 'em_aberto' THEN valor_cobrado ELSE 0 END), 0) AS pendencias
      FROM mensalidade
      WHERE vencimento BETWEEN ? AND ?
    `, [ini, fim]);

    // Receita de vendas de produtos
    const vendas = await runGet(`
      SELECT COALESCE(SUM(quantidade * preco_unitario), 0) AS receita_vendas
      FROM venda_produto
      WHERE data_venda BETWEEN ? AND ?
    `, [ini, fim]);

    // Despesas (se houver tabela)
    let despesas = 0;
    try {
      const r = await runGet(`
        SELECT COALESCE(SUM(valor), 0) AS total
        FROM despesa
        WHERE data_despesa BETWEEN ? AND ?
      `, [ini, fim]);
      despesas = r.total;
    } catch (_) {}

    const receita_total = mensalidades.receita_recebida + vendas.receita_vendas;
    const saldo_atual = receita_total - despesas;

    res.json({
      receita_total,
      despesas_total: despesas,
      saldo_atual,
      pendencias: mensalidades.pendencias
    });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao calcular KPIs' });
  }
});

module.exports = router;
