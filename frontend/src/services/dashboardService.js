// services/dashboardService.js

const BASE_URL = 'http://localhost:3001';

/**
 * Busca os KPIs do dashboard financeiro
 * @param {Object} filtros - Ex: { periodo: 'mensal' }
 * @returns {Promise<Object>} - Dados do dashboard
 */
export async function getDashboardKPIs(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const url = `${BASE_URL}/dashboard/financeiro/kpis?${params}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const erro = await res.text();
      console.error('Erro ao buscar KPIs:', erro);
      throw new Error('Falha ao buscar dados do dashboard');
    }

    const data = await res.json();

    // Previne erros em gráficos vazios
    return {
      ...data,
      despesas_top5: data.despesas_top5 || [],
      receitas_categoria: data.receitas_categoria || []
    };
  } catch (err) {
    console.error('[DASHBOARD_SERVICE]', err);
    throw err;
  }
}
