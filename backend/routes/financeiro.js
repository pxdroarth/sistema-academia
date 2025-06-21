const express = require('express');
const router  = express.Router();
const pool    = require('../database');

// ───────────────────────────────────────────────────────────
// RE–USO dos controladores antigos ( continuam funcionando )
// ───────────────────────────────────────────────────────────
router.use('/mensalidades',    require('./mensalidades'));      // CRUD completo
router.use('/vendas-produtos', require('./vendasProdutos'));    // CRUD completo

// util
const ymd = d => d.toISOString().slice(0,10);

// ───────────────────────────────────────────────────────────
// 1)  GET /financeiro/mensalidades         (filtrada)
// ───────────────────────────────────────────────────────────
router.get('/mensalidades', async (req,res)=>{
  const { data_inicial, data_final, status='todos' } = req.query;

  let sql = `SELECT status, valor_cobrado FROM mensalidade WHERE 1=1`;
  const params = [];
  if (data_inicial) { sql += ' AND vencimento >= ?'; params.push(data_inicial); }
  if (data_final)   { sql += ' AND vencimento <= ?'; params.push(data_final); }
  if (status !== 'todos') { sql += ' AND status = ?'; params.push(status); }

  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

// ───────────────────────────────────────────────────────────
// 2)  GET /financeiro/vendas-produtos      (filtrada)
// ───────────────────────────────────────────────────────────
router.get('/vendas-produtos', async (req,res) =>{
  const { data_inicial, data_final } = req.query;

  let sql = `SELECT quantidade, preco_unitario FROM venda_produto WHERE 1=1`;
  const params = [];
  if (data_inicial){ sql+=' AND data_venda >= ?'; params.push(data_inicial); }
  if (data_final)  { sql+=' AND data_venda <= ?'; params.push(data_final); }

  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

// ───────────────────────────────────────────────────────────
// 3)  GET /financeiro/fluxo         (Entradas × Saídas por dia)
// ───────────────────────────────────────────────────────────
router.get('/fluxo', async (req, res) => {
  try {
    const { periodo = 'mensal' } = req.query;

    const hoje = new Date();
    let inicio;
    if (periodo === 'diario')  inicio = hoje;
    else if (periodo === 'semanal') {
      inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - hoje.getDay());   // domingo
    } else {                                            // mensal
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    const ymd = d => d.toISOString().slice(0, 10);
    const ini = ymd(inicio);
    const fim = ymd(hoje);

    /*----------------------------------------*
     *  ENTRADAS  =  Pagamentos  +  Vendas    *
     *----------------------------------------*/
    const [entradas] = await pool.query(
      `
      SELECT DATE(d) dia, SUM(v) total
      FROM (
          SELECT p.data_pagamento AS d, p.valor_pago                   AS v
          FROM   pagamento p
          UNION ALL
          SELECT vp.data_venda     AS d, (vp.quantidade*vp.preco_unitario) AS v
          FROM   venda_produto vp
      ) t
      WHERE d BETWEEN ? AND ?
      GROUP BY DATE(d)
      ORDER BY DATE(d)
      `,
      [ini, fim]
    );

    /*----------------------------------------*
     *  SAÍDAS  (opcional)                   *
     *----------------------------------------*/
    let saidas = [];
    try {
      [saidas] = await pool.query(
        `
        SELECT DATE(data_despesa) dia, SUM(valor) total
        FROM despesa
        WHERE data_despesa BETWEEN ? AND ?
        GROUP BY DATE(data_despesa)
        `,
        [ini, fim]
      );
    } catch (_) {
      /* tabela despesa ainda não existe – retorna 0 */
    }

    const toSerie = (rows, id) => ({
      id,
      data: rows.map(r => ({
        x: new Date(r.dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        y: Number(r.total)
      }))
    });

    res.json([
      toSerie(entradas, 'Entradas'),
      toSerie(saidas,   'Saídas')
    ]);

  } catch (e) {
    console.error('fluxo', e);
    res.status(500).json({ erro: 'Erro interno ao gerar fluxo de caixa' });
  }

  // ENTRADAS: mensalidades pagas + vendas
  const [entradas] = await pool.query(`
    SELECT DATE(d) AS dia, SUM(v) total
    FROM (
      SELECT pagamento_data AS d, valor_cobrado           AS v FROM mensalidade   WHERE status='pago'
      UNION ALL
      SELECT data_venda     AS d, quantidade*preco_unitario FROM venda_produto
    ) t
    WHERE d BETWEEN ? AND ?
    GROUP BY DATE(d)
    ORDER BY DATE(d)
  `,[ini,fim]);

  // SAÍDAS (se ainda não existir tabela despesa, devolve zero)
  let saidas = [];
  try{
    [saidas] = await pool.query(`
      SELECT DATE(data_despesa) dia, SUM(valor) total
      FROM despesa
      WHERE data_despesa BETWEEN ? AND ?
      GROUP BY DATE(data_despesa)
    `,[ini,fim]);
  }catch{ /* tabela não existe – ignora */ }

  const toSerie = (rows,id) => ({
    id,
    data: rows.map(r=>({ x:new Date(r.dia).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}), y:Number(r.total) }))
  });

  res.json([ toSerie(entradas,'Entradas'), toSerie(saidas,'Saídas') ]);
});

// ───────────────────────────────────────────────────────────
// 4)  (já existia) GET /financeiro/resumo
// ───────────────────────────────────────────────────────────
router.get('/resumo', async (req,res)=>{
  try{
    const { periodo='mensal' } = req.query;
    const hoje = new Date();
    let inicio;
    if (periodo==='diario')  inicio = hoje;
    else if (periodo==='semanal'){ inicio=new Date(hoje); inicio.setDate(hoje.getDate()-hoje.getDay()); }
    else inicio = new Date(hoje.getFullYear(),hoje.getMonth(),1);

    const ini = ymd(inicio); const fim=ymd(hoje);

    const [[mens]] = await pool.query(`
      SELECT
        SUM(CASE WHEN status='pago'      THEN valor_cobrado END) receita_recebida,
        SUM(CASE WHEN status='em_aberto' THEN valor_cobrado END) pendencias
      FROM mensalidade
      WHERE vencimento BETWEEN ? AND ?`,[ini,fim]);

    const [[vend]] = await pool.query(`
      SELECT COALESCE(SUM(quantidade*preco_unitario),0) receita_vendas,
             COUNT(*) total_vendas
      FROM venda_produto
      WHERE data_venda BETWEEN ? AND ?`,[ini,fim]);

    res.json({ periodo, intervalo:{inicio:ini,fim}, mensalidades:mens, vendas:vend });
  }catch(e){
    console.error(e); res.status(500).json({erro:'Falha no resumo'});
  }
});
// GET /financeiro/indicadores?periodo=diario|semanal|mensal
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

    const ini = ymd(inicio);
    const fim = ymd(hoje);

    // Receita de mensalidades pagas
    const [[mens]] = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_cobrado ELSE 0 END), 0) AS receita_mensalidades,
        COALESCE(SUM(CASE WHEN status = 'em_aberto' THEN valor_cobrado ELSE 0 END), 0) AS pendencias
      FROM mensalidade
      WHERE data_pagamento BETWEEN ? AND ?
    `, [ini, fim]);

    // Receita de vendas de produtos
    const [[vend]] = await pool.query(`
      SELECT COALESCE(SUM(quantidade * preco_unitario), 0) AS receita_vendas
      FROM venda_produto
      WHERE data_venda BETWEEN ? AND ?
    `, [ini, fim]);

    // Despesas
    let despesas = 0;
    try {
      const [[resDespesas]] = await pool.query(`
        SELECT COALESCE(SUM(valor), 0) AS total
        FROM despesa
        WHERE data_despesa BETWEEN ? AND ?
      `, [ini, fim]);
      despesas = resDespesas.total;
    } catch (_) {
      // Tabela de despesas não existe, manter zero
    }

    const receita_total = mens.receita_mensalidades + vend.receita_vendas;
    const saldo_atual = receita_total - despesas;

    res.json({
      receita_total,
      despesas_total: despesas,
      saldo_atual,
      pendencias: mens.pendencias
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao gerar indicadores financeiros' });
  }
});

module.exports = router;
