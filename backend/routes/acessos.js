// routes/acessos.js
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

// Buscar acessos por aluno_id
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

  // Validação básica dos campos obrigatórios
  if (!aluno_id || !resultado) {
    return res.status(400).json({ error: 'Campos obrigatórios: aluno_id e resultado' });
  }

  // Validar resultado para aceitar somente 'liberado' ou 'bloqueado'
  const resultadoValido = ['liberado', 'bloqueado'];
  if (!resultadoValido.includes(resultado.toLowerCase())) {
    return res.status(400).json({ error: `Resultado inválido. Valores válidos: ${resultadoValido.join(', ')}` });
  }

  // Se data_hora não for enviada, usa o horário atual
  const dataHoraParaInserir = data_hora ? new Date(data_hora) : new Date();

  try {
    const [result] = await pool.query(
      'INSERT INTO acesso (aluno_id, data_hora, resultado, motivo_bloqueio) VALUES (?, ?, ?, ?)',
      [aluno_id, dataHoraParaInserir, resultado.toLowerCase(), motivo_bloqueio || null]
    );

    res.status(201).json({
      id: result.insertId,
      aluno_id,
      data_hora: dataHoraParaInserir,
      resultado: resultado.toLowerCase(),
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

  // Validar resultado para aceitar somente 'liberado' ou 'bloqueado'
  const resultadoValido = ['liberado', 'bloqueado'];
  if (!resultadoValido.includes(resultado.toLowerCase())) {
    return res.status(400).json({ error: `Resultado inválido. Valores válidos: ${resultadoValido.join(', ')}` });
  }

  try {
    const [result] = await pool.query(
      'UPDATE acesso SET aluno_id = ?, data_hora = ?, resultado = ?, motivo_bloqueio = ? WHERE id = ?',
      [aluno_id, data_hora, resultado.toLowerCase(), motivo_bloqueio || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Acesso não encontrado para atualizar' });
    }

    res.json({ id, aluno_id, data_hora, resultado: resultado.toLowerCase(), motivo_bloqueio });
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
