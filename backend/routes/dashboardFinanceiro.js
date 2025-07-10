const express = require('express');
const router = express.Router();
const db = require('../dbHelper');
const { obterIntervaloPorPeriodo } = require('./helpers/periodoHelper');

router.get('/kpis', async (req, res) => {
  try {
    const { periodo = 'mes_atual', data_inicio, data_fim } = req.query;
    const { dataInicio, dataFim } = obterIntervaloPorPeriodo(periodo, data_inicio, data_fim);

    // 1. Mensalidades recebidas (pagamento)
    const pagamentoQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN data_pagamento IS NOT NULL THEN valor_pago ELSE 0 END), 0) AS mensalidades_recebidas,
        COALESCE(SUM(CASE WHEN data_pagamento IS NULL THEN valor_previsto ELSE 0 END), 0) AS a_receber,
        COUNT(DISTINCT CASE WHEN data_pagamento IS NULL THEN mensalidade_id END) AS clientes_pendentes
      FROM pagamento
      WHERE (data_pagamento BETWEEN ? AND ? OR data_pagamento IS NULL)
    `;
    const pagamentoData = await db.runGet(pagamentoQuery, [dataInicio, dataFim]);

    // 2. Vendas recebidas
    const vendasQuery = `
      SELECT COALESCE(SUM(quantidade * preco_unitario), 0) AS vendas_recebidas
      FROM venda_produto
      WHERE data_venda BETWEEN ? AND ?
    `;
    const vendasData = await db.runGet(vendasQuery, [dataInicio, dataFim]);

    // 3. Despesas pagas e pendentes (ATUALIZADO PARA USAR status)
    const despesasQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END), 0) AS despesas_pagas,
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END), 0) AS despesas_pendentes
      FROM conta_financeira
      WHERE data_lancamento BETWEEN ? AND ?
    `;
    const despesasData = await db.runGet(despesasQuery, [dataInicio, dataFim]);

    // 4. Lucro real
    const receitaRealTotal = Number(pagamentoData.mensalidades_recebidas);
    const despesasPagas = Number(despesasData.despesas_pagas);
    const lucroReal = receitaRealTotal - despesasPagas;

    res.json({
      mensalidades_recebidas: receitaRealTotal,
      vendas_recebidas: Number(vendasData.vendas_recebidas),
      receita_real_total: receitaRealTotal + Number(vendasData.vendas_recebidas), // só exibir
      despesas_pagas: despesasPagas,
      despesas_a_pagar: Number(despesasData.despesas_pendentes),
      lucro_real: lucroReal,
      saldo_atual: receitaRealTotal - despesasPagas,
      a_receber: Number(pagamentoData.a_receber),
      clientes_pendentes: Number(pagamentoData.clientes_pendentes),
      variacao_mensal: 0, // Implementar depois
    });
  } catch (error) {
    console.error('Erro em /dashboard/financeiro/kpis:', error);
    res.status(500).json({ erro: 'Erro ao gerar KPIs do financeiro' });
  }
});

module.exports = router;
