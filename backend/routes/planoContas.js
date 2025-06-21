const express = require('express');
const router = express.Router();
const pool = require('../database');

// 🔹 GET /plano-contas - listar todas as contas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM plano_contas ORDER BY nome');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar plano de contas', detalhes: err.message });
  }
});

// 🔹 POST /plano-contas - criar nova conta
router.post('/', async (req, res) => {
  const { nome, tipo, descricao } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO plano_contas (nome, tipo, descricao) VALUES (?, ?, ?)',
      [nome, tipo, descricao || null]
    );
    res.status(201).json({ id: result.insertId, nome, tipo, descricao });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar conta', detalhes: err.message });
  }
});

// 🔹 PUT /plano-contas/:id - atualizar conta existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, descricao } = req.body;

  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE plano_contas SET nome = ?, tipo = ?, descricao = ? WHERE id = ?',
      [nome, tipo, descricao || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Plano de conta não encontrado' });
    }

    res.json({ id, nome, tipo, descricao });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar conta', detalhes: err.message });
  }
});

// 🔹 DELETE /plano-contas/:id - remover conta
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM plano_contas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Plano de conta não encontrado para excluir' });
    }

    res.json({ mensagem: 'Conta removida com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover conta', detalhes: err.message });
  }
});

module.exports = router;
