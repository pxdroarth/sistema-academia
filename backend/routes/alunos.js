const express = require('express');
const router = express.Router();
const { runQuery, runGet, runExecute } = require('../dbHelper');

// 🔹 Listar todos os alunos com status de mensalidade e status_ativo
router.get('/', async (req, res) => {
  try {
    const rows = await runQuery(`
      SELECT a.*,

        -- ✅ Status da mensalidade (em dia ou atrasado)
        COALESCE((
          SELECT CASE
            WHEN MAX(m.vencimento) >= DATE('now') THEN 'em_dia'
            ELSE 'atrasado'
          END
          FROM mensalidade m
          WHERE m.aluno_id = a.id AND m.status = 'pago'
        ), 'atrasado') AS mensalidade_status,

        -- ✅ Atividade nos últimos 3 meses
        CASE
          WHEN EXISTS (
            SELECT 1 FROM mensalidade m
            WHERE m.aluno_id = a.id
              AND m.status = 'pago'
              AND m.data_fim >= DATE('now', '-3 months')
          ) THEN 'ativo'
          ELSE 'inativo'
        END AS status_ativo

      FROM aluno a
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Criar novo aluno
router.post('/', async (req, res) => {
  let { nome, email, status, dia_vencimento, plano_id, telefone, data_nascimento } = req.body;

  if (!nome || !email || !plano_id || !data_nascimento) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando (nome, email, data_nascimento, plano_id)' });
  }

  if (!dia_vencimento || isNaN(dia_vencimento) || dia_vencimento < 1 || dia_vencimento > 31) {
    dia_vencimento = new Date().getDate();
  }

  try {
    // 🔸 Geração automática de matrícula (incremental)
    const last = await runGet(`SELECT MAX(matricula) AS ultima FROM aluno`);
    const novaMatricula = (last?.ultima || 1000) + 1;

    const result = await runExecute(
      `INSERT INTO aluno (matricula, nome, email, status, dia_vencimento, plano_id, telefone, data_nascimento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [novaMatricula, nome, email, status || 'ativo', dia_vencimento, plano_id, telefone, data_nascimento]
    );

    res.status(201).json({
      id: result.id,
      matricula: novaMatricula,
      nome, email, status: status || 'ativo', dia_vencimento, plano_id, telefone, data_nascimento
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Verificar se aluno está em débito
router.get('/:id/debito', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    const row = await runGet(`
      SELECT COUNT(*) AS total
      FROM mensalidade
      WHERE aluno_id = ? AND status = 'em_aberto' AND vencimento < ?
    `, [id, hoje]);

    res.json({ em_debito: row.total > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Atualizar aluno
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let { nome, email, status, dia_vencimento, plano_id, telefone, data_nascimento } = req.body;

  if (!nome || !email || !data_nascimento) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  if (dia_vencimento && (isNaN(dia_vencimento) || dia_vencimento < 1 || dia_vencimento > 31)) {
    return res.status(400).json({ error: 'dia_vencimento inválido' });
  }

  try {
    const result = await runExecute(
      `UPDATE aluno SET nome = ?, email = ?, status = ?, dia_vencimento = ?, plano_id = ?, telefone = ?, data_nascimento = ?
       WHERE id = ?`,
      [nome, email, status, dia_vencimento || null, plano_id || null, telefone, data_nascimento, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado para atualizar' });
    }

    res.json({ id, nome, email, status, dia_vencimento, plano_id, telefone, data_nascimento });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Buscar aluno por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const hoje = new Date().toISOString().slice(0, 10);

    const row = await runGet(`
      SELECT a.*,
        EXISTS (
          SELECT 1 FROM mensalidade m 
          WHERE m.aluno_id = a.id 
            AND m.status != 'pago' 
            AND m.vencimento < ?
        ) AS em_debito,
        COALESCE(p.nome, 'Sem plano') AS plano_nome
      FROM aluno a
      LEFT JOIN plano p ON a.plano_id = p.id
      WHERE a.id = ?
    `, [hoje, id]);

    if (!row) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
