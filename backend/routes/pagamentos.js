const express = require('express');
const router = express.Router();
const { runQuery } = require('../dbHelper');

// POST /pagamentos - Criar novo pagamento
router.post('/', async (req, res) => {
  const { mensalidade_id, data_pagamento, valor_pago } = req.body;

  if (!mensalidade_id || !data_pagamento || !valor_pago) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  }

  try {
    const result = await runQuery(
      'INSERT INTO pagamento (mensalidade_id, data_pagamento, valor_pago) VALUES (?, ?, ?)',
      [mensalidade_id, data_pagamento, valor_pago]
    );

    res.status(201).json({
      id: result.lastID,
      mensalidade_id,
      data_pagamento,
      valor_pago,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /pagamentos - Listar todos os pagamentos
router.get('/', async (req, res) => {
  try {
    const rows = await runQuery('SELECT * FROM pagamento');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /pagamentos/aluno/:aluno_id - Pagamentos por aluno
router.get('/aluno/:aluno_id', async (req, res) => {
  const alunoId = parseInt(req.params.aluno_id);

  try {
    const rows = await runQuery(`
      SELECT p.*, m.vencimento, m.valor_cobrado
      FROM pagamento p
      JOIN mensalidade m ON p.mensalidade_id = m.id
      JOIN aluno a ON m.aluno_id = a.id
      WHERE a.id = ?
    `, [alunoId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
