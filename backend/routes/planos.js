const express = require('express');
const router = express.Router();
const pool = require('../database');

// Listar todos os planos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM plano');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar plano por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [rows] = await pool.query('SELECT * FROM plano WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Plano não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar um novo plano
router.post('/', async (req, res) => {
  const { nome, valor_base, descricao } = req.body;
  if (!nome || !valor_base) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  try {
    const [result] = await pool.query(
      'INSERT INTO plano (nome, valor_base, descricao) VALUES (?, ?, ?)',
      [nome, valor_base, descricao || null]
    );
    res.status(201).json({ id: result.insertId, nome, valor_base, descricao });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar plano por ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, valor_base, descricao } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE plano SET nome = ?, valor_base = ?, descricao = ? WHERE id = ?',
      [nome, valor_base, descricao || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Plano não encontrado para atualizar' });
    res.json({ id, nome, valor_base, descricao });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar plano por ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await pool.query('DELETE FROM plano WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Plano não encontrado para deletar' });
    res.json({ message: 'Plano deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
