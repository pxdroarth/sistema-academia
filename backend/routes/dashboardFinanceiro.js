const express = require('express');
const router = express.Router();
const db = require('../dbHelper');
const { obterIntervaloPorPeriodo } = require('./helpers/periodoHelper');
const { sincronizarFinanceiro } = require('../services/FinanceService');

// Listar contas financeiras da academia (filtra só contas administrativas)
router.get('/', async (req, res) => {
  try {
    const contas = await db.runQuery(
      `SELECT * FROM conta_financeira WHERE origem = 'conta_financeira' ORDER BY data_lancamento DESC`
    );
    res.json(contas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// KPIs do dashboard financeiro
router.get('/kpis', async (req, res) => {
  try {
    const { periodo = 'mes_atual', data_inicio, data_fim } = req.query;
    const { dataInicio, dataFim } = obterIntervaloPorPeriodo(periodo, data_inicio, data_fim);

    // 1. Mensalidades recebidas (pagamento e antigas pagas direto na mensalidade)
    // Pagamentos realizados de mensalidades (novos)
    const pagosQuery = `
      SELECT COALESCE(SUM(valor_pago), 0) AS total_pagamento
      FROM pagamento
      WHERE data_pagamento IS NOT NULL
        AND data_pagamento BETWEEN ? AND ?
    `;
    const totalPagamentos = (await db.runGet(pagosQuery, [dataInicio, dataFim])).total_pagamento || 0;

    // Mensalidades antigas pagas (sem registro em pagamento)
    const mensalidadesAntigasQuery = `
      SELECT COALESCE(SUM(valor_cobrado), 0) AS total_mensalidade
      FROM mensalidade
      WHERE status = 'pago'
        AND (id NOT IN (SELECT mensalidade_id FROM pagamento WHERE data_pagamento IS NOT NULL))
        AND vencimento BETWEEN ? AND ?
        AND vencimento != '0000-00-00'
    `;
    const totalMensalidadesAntigas = (await db.runGet(mensalidadesAntigasQuery, [dataInicio, dataFim])).total_mensalidade || 0;

    const totalRecebido = Number(totalPagamentos) + Number(totalMensalidadesAntigas);

    // 2. Vendas recebidas
    const vendasQuery = `
      SELECT COALESCE(SUM(quantidade * preco_unitario), 0) AS vendas_recebidas
      FROM venda_produto
      WHERE data_venda BETWEEN ? AND ?
    `;
    const vendasData = await db.runGet(vendasQuery, [dataInicio, dataFim]);

    // 3. Despesas pagas e pendentes (só contas administrativas)
    const despesasQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END), 0) AS despesas_pagas,
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END), 0) AS despesas_pendentes
      FROM conta_financeira
      WHERE data_lancamento BETWEEN ? AND ?
        AND tipo = 'despesa'
        AND origem = 'conta_financeira'
    `;
    const despesasData = await db.runGet(despesasQuery, [dataInicio, dataFim]);

    // 4. Mensalidades a receber e clientes pendentes (pode ajustar conforme necessidade)
    const aReceberQuery = `
      SELECT COALESCE(SUM(valor_cobrado), 0) AS a_receber, COUNT(*) AS clientes_pendentes
      FROM mensalidade
      WHERE status = 'em_aberto'
        AND vencimento BETWEEN ? AND ?
        AND vencimento != '0000-00-00'
    `;
    const aReceberData = await db.runGet(aReceberQuery, [dataInicio, dataFim]);

    // 5. Lucro real
    const despesasPagas = Number(despesasData.despesas_pagas);
    const receitaRealTotal = totalRecebido;
    const lucroReal = receitaRealTotal - despesasPagas;

    res.json({
      mensalidades_recebidas: receitaRealTotal,
      vendas_recebidas: Number(vendasData.vendas_recebidas),
      receita_real_total: receitaRealTotal + Number(vendasData.vendas_recebidas),
      despesas_pagas: despesasPagas,
      despesas_a_pagar: Number(despesasData.despesas_pendentes),
      lucro_real: lucroReal,
      saldo_atual: receitaRealTotal - despesasPagas,
      a_receber: Number(aReceberData.a_receber),
      clientes_pendentes: Number(aReceberData.clientes_pendentes),
      variacao_mensal: 0, // Implementar depois
    });
  } catch (error) {
    console.error('Erro em /dashboard/financeiro/kpis:', error);
    res.status(500).json({ erro: 'Erro ao gerar KPIs do financeiro' });
  }
});

// 🔹 Novo endpoint: sincronização manual do financeiro
router.post('/sincronizar', async (req, res) => {
  try {
    await sincronizarFinanceiro();
    res.json({ ok: true, message: 'Sincronização executada com sucesso!' });
  } catch (e) {
    console.error('Erro ao sincronizar financeiro:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
