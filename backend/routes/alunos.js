// backend/routes/alunos.js

const express = require('express');
const router = express.Router();
const pool = require('../database'); // Conexão com o MySQL

// Listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aluno');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar aluno por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
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

// Criar um novo aluno
router.post('/', async (req, res) => {
  const { nome, cpf, status, plano_id, numero, email, biometria_facial_hash } = req.body;

  if (!nome || !cpf || !status || !plano_id) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO aluno (nome, cpf, status, plano_id, numero, email, biometria_facial_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, cpf, status, plano_id, numero || null, email || null, biometria_facial_hash || null]
    );
    res.status(201).json({ id: result.insertId, nome, cpf, status, plano_id, numero, email, biometria_facial_hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar aluno por ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, cpf, status, plano_id, numero, email, biometria_facial_hash } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE aluno SET nome = ?, cpf = ?, status = ?, plano_id = ?, numero = ?, email = ?, biometria_facial_hash = ? WHERE id = ?`,
      [nome, cpf, status, plano_id, numero || null, email || null, biometria_facial_hash || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado para atualizar' });
    }

    res.json({ id, nome, cpf, status, plano_id, numero, email, biometria_facial_hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar aluno por ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const [result] = await pool.query('DELETE FROM aluno WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado para deletar' });
    }

    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
