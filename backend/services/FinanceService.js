const { runQuery, runGet, runExecute } = require('../dbHelper');

// Sincroniza mensalidade -> pagamento (garante 1 pagamento p/ cada mensalidade)
async function sincronizarPagamentosDeMensalidades() {
  const mensalidades = await runQuery('SELECT * FROM mensalidade');
  for (const m of mensalidades) {
    const pag = await runGet('SELECT * FROM pagamento WHERE mensalidade_id = ?', [m.id]);
    if (!pag) {
      await runExecute(
        'INSERT INTO pagamento (mensalidade_id, valor_previsto) VALUES (?, ?)',
        [m.id, m.valor_cobrado]
      );
    }
  }
}

async function sincronizarFinanceiro() {
  await sincronizarPagamentosDeMensalidades();
  // Futuro: await sincronizarOrcamentos();
  // Futuro: await sincronizarVendas();
  // ...mais integrações!
  return true;
}

module.exports = { sincronizarFinanceiro };
