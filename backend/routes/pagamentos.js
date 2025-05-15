// backend/routes/pagamentos.js

const express = require('express');
const router = express.Router();
const pool = require('../database');

// Rota POST para criar um novo pagamento
router.post('/', async (req, res) => {
  const { mensalidade_id, data_pagamento, valor_pago } = req.body;

  // Validação básica dos campos obrigatórios
  if (!mensalidade_id || !data_pagamento || !valor_pago) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  }

  try {
    // Insere no banco de dados
    const [result] = await pool.query(
      'INSERT INTO pagamento (mensalidade_id, data_pagamento, valor_pago) VALUES (?, ?, ?)',
      [mensalidade_id, data_pagamento, valor_pago]
    );

    // Resposta com dados do pagamento criado
    res.status(201).json({
      id: result.insertId,
      mensalidade_id,
      data_pagamento,
      valor_pago,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota GET para listar todos os pagamentos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pagamento');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota GET para listar pagamentos por aluno (via JOIN)
router.get('/aluno/:aluno_id', async (req, res) => {
  const alunoId = parseInt(req.params.aluno_id);

  try {
    const [rows] = await pool.query(
      `SELECT p.*, m.vencimento, m.valor_cobrado
       FROM pagamento p
       JOIN mensalidade m ON p.mensalidade_id = m.id
       JOIN aluno a ON m.aluno_id = a.id
       WHERE a.id = ?`,
      [alunoId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
