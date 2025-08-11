const express = require('express');
const router = express.Router();
const { runQuery, runExecute } = require('../dbHelper');

// 🔹 Listar todos os vínculos com nomes
router.get('/', async (req, res) => {
  try {
    const associados = await runQuery(`
      SELECT pa.id, pa.aluno_id, pa.responsavel_id,
             a.nome, a.matricula
      FROM plano_associado pa
      JOIN aluno a ON a.id = pa.aluno_id
    `);
    res.json({ associados });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Listar vínculos por responsável
router.get('/:responsavelId', async (req, res) => {
  const id = parseInt(req.params.responsavelId);
  try {
    const associados = await runQuery(`
      SELECT pa.id, a.nome, a.matricula
      FROM plano_associado pa
      JOIN aluno a ON a.id = pa.aluno_id
      WHERE pa.responsavel_id = ?
    `, [id]);
    res.json({ associados });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Criar vínculo
router.post('/', async (req, res) => {
  const { aluno_id, responsavel_id } = req.body;
  if (!aluno_id || !responsavel_id) {
    return res.status(400).json({ error: 'Campos obrigatórios: aluno_id e responsavel_id' });
  }

  try {
    const result = await runExecute(`
      INSERT INTO plano_associado (aluno_id, responsavel_id)
      VALUES (?, ?)
    `, [aluno_id, responsavel_id]);

    res.status(201).json({ id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Deletar vínculo
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await runExecute(`DELETE FROM plano_associado WHERE id = ?`, [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vínculo não encontrado' });
    }
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
