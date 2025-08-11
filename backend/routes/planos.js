const express = require('express');
const router = express.Router();
const { runQuery } = require('../dbHelper');

// 🔹 Listar todos os planos
router.get('/', async (req, res) => {
  try {
    const rows = await runQuery('SELECT * FROM plano');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Buscar plano por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const rows = await runQuery('SELECT * FROM plano WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Plano não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Criar um novo plano
router.post('/', async (req, res) => {
  const { nome, valor_base, descricao, duracao_em_dias, compartilhado } = req.body;

  if (!nome || valor_base == null || !duracao_em_dias) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando: nome, valor_base, duração' });
  }

  try {
    const result = await runQuery(
      `INSERT INTO plano (nome, valor_base, descricao, duracao_em_dias, compartilhado)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, valor_base, descricao || null, duracao_em_dias, compartilhado ? 1 : 0]
    );
    res.status(201).json({
      id: result.lastID,
      nome,
      valor_base,
      descricao,
      duracao_em_dias,
      compartilhado: compartilhado ? 1 : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Atualizar plano por ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, valor_base, descricao, duracao_em_dias, compartilhado } = req.body;

  if (!nome || valor_base == null || !duracao_em_dias) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando para atualização' });
  }

  try {
    const result = await runQuery(
      `UPDATE plano SET nome = ?, valor_base = ?, descricao = ?, duracao_em_dias = ?, compartilhado = ? WHERE id = ?`,
      [nome, valor_base, descricao || null, duracao_em_dias, compartilhado ? 1 : 0, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Plano não encontrado para atualizar' });

    res.json({ id, nome, valor_base, descricao, duracao_em_dias, compartilhado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Deletar plano por ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await runQuery('DELETE FROM plano WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Plano não encontrado para deletar' });
    res.json({ message: 'Plano deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
