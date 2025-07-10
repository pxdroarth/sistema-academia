const express = require('express'); 
const router = express.Router();
const { runQuery, runGet, runExecute } = require('../dbHelper');

// Listar todos os acessos
router.get('/', async (req, res) => {
  try {
    const rows = await runQuery('SELECT * FROM acesso ORDER BY data_hora DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar acesso por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const row = await runGet('SELECT * FROM acesso WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Acesso não encontrado' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar acessos por aluno_id
router.get('/aluno/:alunoId', async (req, res) => {
  const alunoId = parseInt(req.params.alunoId);
  try {
    const rows = await runQuery('SELECT * FROM acesso WHERE aluno_id = ? ORDER BY data_hora DESC', [alunoId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo acesso
router.post('/', async (req, res) => {
  const { aluno_id, data_hora, resultado, motivo_bloqueio } = req.body;

  if (!aluno_id || !resultado) {
    return res.status(400).json({ error: 'Campos obrigatórios: aluno_id e resultado' });
  }

  const resultadoValido = ['permitido', 'negado'];
  const resultadoNormalizado = resultado.toLowerCase();

  if (!resultadoValido.includes(resultadoNormalizado)) {
    return res.status(400).json({ error: `Resultado inválido. Valores válidos: ${resultadoValido.join(', ')}` });
  }

  const dataHoraParaInserir = data_hora ? new Date(data_hora).toISOString() : new Date().toISOString();

  try {
    const result = await runExecute(
      'INSERT INTO acesso (aluno_id, data_hora, resultado, motivo_bloqueio) VALUES (?, ?, ?, ?)',
      [aluno_id, dataHoraParaInserir, resultadoNormalizado, motivo_bloqueio || null]
    );

    res.status(201).json({
      id: result.id,
      aluno_id,
      data_hora: dataHoraParaInserir,
      resultado: resultadoNormalizado,
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

  const resultadoValido = ['permitido', 'negado'];
  const resultadoNormalizado = resultado.toLowerCase();

  if (!resultadoValido.includes(resultadoNormalizado)) {
    return res.status(400).json({ error: `Resultado inválido. Valores válidos: ${resultadoValido.join(', ')}` });
  }

  try {
    const result = await runExecute(
      'UPDATE acesso SET aluno_id = ?, data_hora = ?, resultado = ?, motivo_bloqueio = ? WHERE id = ?',
      [aluno_id, data_hora, resultadoNormalizado, motivo_bloqueio || null, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Acesso não encontrado para atualizar' });
    }

    res.json({ id, aluno_id, data_hora, resultado: resultadoNormalizado, motivo_bloqueio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar acesso por ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await runExecute('DELETE FROM acesso WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Acesso não encontrado para deletar' });
    res.json({ message: 'Acesso deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
