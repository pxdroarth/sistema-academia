const express = require('express');
const router = express.Router();
const pool = require('../database');

// Listar alunos (já existente, só para contexto)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aluno');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo aluno
router.post('/', async (req, res) => {
  const { nome, cpf, email, status } = req.body;

  if (!nome || !cpf || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO aluno (nome, cpf, email, status) VALUES (?, ?, ?, ?)',
      [nome, cpf, email, status || 'ativo']
    );
    res.status(201).json({
      id: result.insertId,
      nome,
      cpf,
      email,
      status: status || 'ativo',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar aluno por ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, cpf, email, status } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE aluno SET nome = ?, cpf = ?, email = ?, status = ? WHERE id = ?',
      [nome, cpf, email, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado para atualizar' });
    }

    res.json({ id, nome, cpf, email, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Buscar aluno por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM aluno WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
