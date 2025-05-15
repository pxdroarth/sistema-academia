const express = require('express');
const router = express.Router();
const pool = require('../database');

// Listar todos os acessos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM acesso');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar acesso por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [rows] = await pool.query('SELECT * FROM acesso WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Acesso não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar acessos por aluno_id (rota nova)
router.get('/aluno/:alunoId', async (req, res) => {
  const alunoId = parseInt(req.params.alunoId);
  try {
    const [rows] = await pool.query('SELECT * FROM acesso WHERE aluno_id = ?', [alunoId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo acesso
router.post('/', async (req, res) => {
  const { aluno_id, data_hora, resultado, motivo_bloqueio } = req.body;

  if (!aluno_id || !data_hora || !resultado) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO acesso (aluno_id, data_hora, resultado, motivo_bloqueio) VALUES (?, ?, ?, ?)',
      [aluno_id, data_hora, resultado, motivo_bloqueio || null]
    );
    res.status(201).json({
      id: result.insertId,
      aluno_id,
      data_hora,
      resultado,
      motivo_bloqueio: motivo_bloqueio || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar acesso por ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { aluno_id, data_hora, resultado, motivo_bloqueio } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE acesso SET aluno_id = ?, data_hora = ?, resultado = ?, motivo_bloqueio = ? WHERE id = ?',
      [aluno_id, data_hora, resultado, motivo_bloqueio || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Acesso não encontrado para atualizar' });
    }

    res.json({ id, aluno_id, data_hora, resultado, motivo_bloqueio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar acesso por ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await pool.query('DELETE FROM acesso WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Acesso não encontrado para deletar' });
    res.json({ message: 'Acesso deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
