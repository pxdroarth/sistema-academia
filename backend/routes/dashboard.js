const express = require('express');
const router = express.Router();
const { runQuery } = require('../dbHelper');

/**
 * GET /dashboard/financeiro/kpis
 * Query params:
 *   - periodo: 'diario' | 'semanal' | 'mensal' | 'personalizado'
 *   - data_inicial: 'YYYY-MM-DD' (opcional, obrigatório se personalizado)
 *   - data_final: 'YYYY-MM-DD' (opcional, obrigatório se personalizado)
 */
router.get('/financeiro/kpis', async (req, res) => {
  try {
    let { periodo = "mensal", data_inicial, data_final } = req.query;

    // Ajuste automático de datas pelo período
    const today = new Date();
    let dataIni, dataFim;
    if (periodo === 'diario') {
      dataIni = dataFim = today.toISOString().slice(0, 10);
    } else if (periodo === 'semanal') {
      const first = today.getDate() - today.getDay(); // domingo
      dataIni = new Date(today.setDate(first)).toISOString().slice(0, 10);
      dataFim = new Date().toISOString().slice(0, 10);
    } else if (periodo === 'mensal') {
      dataIni = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      dataFim = new Date().toISOString().slice(0, 10);
    } else if (periodo === 'personalizado' && data_inicial && data_final) {
      dataIni = data_inicial;
      dataFim = data_final;
    } else {
      // Default para mensal
      dataIni = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      dataFim = new Date().toISOString().slice(0, 10);
    }

    // Filtros SQL
    const filtros = `date(data_lancamento) >= date(?) AND date(data_lancamento) <= date(?)`;

    // KPIs
    const [receita]    = await runQuery(`SELECT IFNULL(SUM(valor),0) as valor FROM conta_financeira WHERE tipo='receita' AND status='pago' AND ${filtros}`, [dataIni, dataFim]);
    const [receitaPrev]= await runQuery(`SELECT IFNULL(SUM(valor),0) as valor FROM conta_financeira WHERE tipo='receita' AND ${filtros}`, [dataIni, dataFim]);
    const [despesa]    = await runQuery(`SELECT IFNULL(SUM(valor),0) as valor FROM conta_financeira WHERE tipo='despesa' AND status='pago' AND ${filtros}`, [dataIni, dataFim]);
    const [despesaPrev]= await runQuery(`SELECT IFNULL(SUM(valor),0) as valor FROM conta_financeira WHERE tipo='despesa' AND ${filtros}`, [dataIni, dataFim]);
    const [aReceber]   = await runQuery(`SELECT IFNULL(SUM(valor),0) as valor FROM conta_financeira WHERE tipo='receita' AND status='pendente' AND ${filtros}`, [dataIni, dataFim]);
    const [aPagar]     = await runQuery(`SELECT IFNULL(SUM(valor),0) as valor FROM conta_financeira WHERE tipo='despesa' AND status='pendente' AND ${filtros}`, [dataIni, dataFim]);
    const [clientesPend]= await runQuery(`SELECT COUNT(DISTINCT observacao) as qtd FROM conta_financeira WHERE tipo='receita' AND status='pendente' AND ${filtros}`, [dataIni, dataFim]);
    const [saldoAtual] = await runQuery(
      `SELECT 
        (SELECT IFNULL(SUM(valor),0) FROM conta_financeira WHERE tipo='receita' AND status='pago') -
        (SELECT IFNULL(SUM(valor),0) FROM conta_financeira WHERE tipo='despesa' AND status='pago')
        AS saldo`, []
    );

    // Crescimento receita vs período anterior (exemplo para mensal)
    // Você pode sofisticar aqui para cada período
    let variacaoReceita = 0, receitaAnterior = 0;
    if (periodo === 'mensal') {
      let mesAnteriorIni = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 10);
      let mesAnteriorFim = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().slice(0, 10);
      const [rAnterior] = await runQuery(
        `SELECT IFNULL(SUM(valor),0) as valor FROM conta_financeira WHERE tipo='receita' AND status='pago' AND date(data_lancamento) >= date(?) AND date(data_lancamento) <= date(?)`,
        [mesAnteriorIni, mesAnteriorFim]
      );
      receitaAnterior = rAnterior.valor || 0;
      variacaoReceita = receitaAnterior === 0 ? 0 : ((receita.valor - receitaAnterior) / receitaAnterior) * 100;
    }

    // Despesas Top 5 (por categoria/plano de contas)
    const despesasTop = await runQuery(
      `SELECT pc.nome as categoria, SUM(cf.valor) as total
       FROM conta_financeira cf
       LEFT JOIN plano_contas pc ON cf.plano_contas_id = pc.id
       WHERE cf.tipo='despesa' AND cf.status='pago' AND ${filtros}
       GROUP BY cf.plano_contas_id
       ORDER BY total DESC
       LIMIT 5`, [dataIni, dataFim]
    );

    // Distribuição de receitas por categoria (para gráfico de pizza)
    const receitasPorCategoria = await runQuery(
      `SELECT pc.nome as categoria, SUM(cf.valor) as total
       FROM conta_financeira cf
       LEFT JOIN plano_contas pc ON cf.plano_contas_id = pc.id
       WHERE cf.tipo='receita' AND cf.status='pago' AND ${filtros}
       GROUP BY cf.plano_contas_id
       ORDER BY total DESC`, [dataIni, dataFim]
    );

    res.json({
      periodo,
      data_inicial: dataIni,
      data_final: dataFim,
      receita_real: receita.valor,
      receita_presumida: receitaPrev.valor,
      despesas_pagas: despesa.valor,
      despesas_presumidas: despesaPrev.valor,
      saldo_atual: saldoAtual.saldo,
      a_receber: aReceber.valor,
      a_pagar: aPagar.valor,
      clientes_pendentes: clientesPend.qtd,
      variacao_receita_mensal: variacaoReceita,
      receita_mes_anterior: receitaAnterior,
      lucro_real: receita.valor - despesa.valor,
      despesas_top5: despesasTop,
      receitas_categoria: receitasPorCategoria
    });

  } catch (err) {
    console.error("[DASHBOARD/KPIS]", err);
    res.status(500).json({ error: "Erro ao calcular KPIs do financeiro" });
  }
});

module.exports = router;
