const express = require('express');
const router = express.Router();
const { runQuery, runGet, runExecute } = require('../dbHelper');

function validarCamposObrigatorios(body, campos) {
  for (const campo of campos) {
    if (!body[campo]) return `Campo obrigatório ausente: ${campo}`;
  }
  return null;
}

// 🔹 GET /contas-financeiras?tipo=&status=&data_inicial=&data_final=
router.get('/', async (req, res) => {
  const { tipo, status, data_inicial, data_final } = req.query;
  const params = [];
  let sql = `
    SELECT cf.*, pc.nome AS plano_nome
    FROM conta_financeira cf
    LEFT JOIN plano_contas pc ON cf.plano_contas_id = pc.id
    WHERE 1=1`;

  if (tipo && tipo !== 'todos') {
    sql += ' AND cf.tipo = ?';
    params.push(tipo);
  }
  if (status && status !== 'todos') {
    sql += ' AND cf.status = ?';
    params.push(status);
  }
  if (data_inicial) {
    sql += ' AND date(cf.data_lancamento) >= date(?)';
    params.push(data_inicial);
  }
  if (data_final) {
    sql += ' AND date(cf.data_lancamento) <= date(?)';
    params.push(data_final);
  }

  try {
    const rows = await runQuery(sql + ' ORDER BY cf.data_lancamento DESC', params);
    res.json(rows);
  } catch (e) {
    console.error('[ERRO GET contas-financeiras]', e);
    res.status(500).json({ error: 'Erro ao buscar contas financeiras' });
  }
});

// 🔹 POST /contas-financeiras
router.post('/', async (req, res) => {
  const { descricao, tipo, valor, data_lancamento, status, plano_contas_id, observacao } = req.body;
  const erro = validarCamposObrigatorios(req.body, ['descricao', 'tipo', 'valor', 'data_lancamento', 'status']);
  if (erro) return res.status(400).json({ error: erro });

  try {
    const result = await runExecute(`
      INSERT INTO conta_financeira 
      (descricao, tipo, valor, data_lancamento, status, plano_contas_id, observacao, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [descricao, tipo, valor, data_lancamento, status, plano_contas_id || null, observacao || null]);

    res.status(201).json({ id: result.id });
  } catch (e) {
    console.error('[ERRO POST contas-financeiras]', e);
    res.status(500).json({ error: 'Erro ao criar conta financeira' });
  }
});

// 🔹 PUT /contas-financeiras/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { descricao, tipo, valor, data_lancamento, status, plano_contas_id, observacao } = req.body;

  try {
    const result = await runExecute(`
      UPDATE conta_financeira SET
        descricao = ?, tipo = ?, valor = ?, data_lancamento = ?, status = ?, 
        plano_contas_id = ?, observacao = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [descricao, tipo, valor, data_lancamento, status, plano_contas_id || null, observacao || null, id]);

    if (result.changes === 0) return res.status(404).json({ error: 'Conta não encontrada' });

    res.json({ message: 'Conta atualizada com sucesso' });
  } catch (e) {
    console.error('[ERRO PUT contas-financeiras]', e);
    res.status(500).json({ error: 'Erro ao atualizar conta financeira' });
  }
});

// 🔹 DELETE /contas-financeiras/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await runExecute('DELETE FROM conta_financeira WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Conta não encontrada' });

    res.json({ message: 'Conta excluída com sucesso' });
  } catch (e) {
    console.error('[ERRO DELETE contas-financeiras]', e);
    res.status(500).json({ error: 'Erro ao excluir conta financeira' });
  }
});

module.exports = router;
