const express = require('express');
const router = express.Router();
const { runQuery, runGet, runExecute } = require('../dbHelper');

// Normaliza datas para YYYY-MM-DD (aceita DD/MM/YYYY)
function toISODate(d) {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

/** 🔎 Pesquisa (vem antes de /:id) */
router.get('/pesquisa', async (req, res) => {
  try {
    const termo = String(req.query.termo || '').trim().toLowerCase();
    const pagina = Math.max(1, parseInt(req.query.pagina || '1'));
    const limite = Math.min(50, Math.max(1, parseInt(req.query.limite || '15')));
    const offset = (pagina - 1) * limite;

    let where = '';
    let params = [];
    if (termo) {
      where = `WHERE LOWER(a.nome) LIKE ? OR CAST(a.matricula AS TEXT) LIKE ?`;
      params = [`%${termo}%`, `%${termo}%`];
    }

    const totalRow = await runGet(`SELECT COUNT(*) AS total FROM aluno a ${where}`, params);
    const lista = await runQuery(
      `SELECT a.* FROM aluno a ${where} ORDER BY a.nome ASC LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );

    res.json({ alunos: lista, total: totalRow.total, pagina, limite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- LISTAR TODOS ----------
router.get('/', async (_req, res) => {
  try {
    const rows = await runQuery(`
      SELECT a.*,
        COALESCE((
          SELECT CASE
            WHEN MAX(m.vencimento) >= DATE('now') THEN 'em_dia'
            ELSE 'atrasado'
          END
          FROM mensalidade m
          WHERE m.aluno_id = a.id AND m.status = 'pago'
        ), 'atrasado') AS mensalidade_status,
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
      ORDER BY a.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- CRIAR (telefone OPCIONAL; demais OBRIGATÓRIOS) ----------
router.post('/', async (req, res) => {
  try {
    let { nome, status, dia_vencimento, plano_id, telefone, data_nascimento } = req.body || {};

    if (!nome || !data_nascimento || plano_id === undefined || plano_id === null || plano_id === '') {
      return res.status(400).json({ error: 'Campos obrigatórios faltando (nome, data_nascimento, plano_id, dia_vencimento)' });
    }

    const dv = Number(dia_vencimento);
    if (!dv || dv < 1 || dv > 31) {
      return res.status(400).json({ error: 'dia_vencimento inválido (1..31)' });
    }

    const planoIdFinal = Number(plano_id);
    if (Number.isNaN(planoIdFinal)) {
      return res.status(400).json({ error: 'plano_id inválido' });
    }

    const dataNascISO = toISODate(data_nascimento);
    if (!dataNascISO) {
      return res.status(400).json({ error: 'data_nascimento inválida' });
    }

    const statusFinal = (status || 'ativo') === 'inativo' ? 'inativo' : 'ativo';

    // matrícula incremental
    const last = await runGet(`SELECT MAX(matricula) AS ultima FROM aluno`);
    const novaMatricula = (Number(last?.ultima) || 1000) + 1;

    const result = await runExecute(
      `INSERT INTO aluno (matricula, nome, status, dia_vencimento, plano_id, telefone, data_nascimento)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [novaMatricula, String(nome).trim(), statusFinal, dv, planoIdFinal, telefone || null, dataNascISO]
    );

    const criado = await runGet(`SELECT * FROM aluno WHERE id = ?`, [result.lastID]);
    res.status(201).json(criado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- VERIFICAR DÉBITO ----------
router.get('/:id/debito', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    const row = await runGet(
      `SELECT COUNT(*) AS total
       FROM mensalidade
       WHERE aluno_id = ? AND status = 'em_aberto' AND vencimento < ?`,
      [id, hoje]
    );
    res.json({ em_debito: row.total > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- ATUALIZAR (telefone OPCIONAL; demais OBRIGATÓRIOS) ----------
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });

  try {
    let { nome, status, dia_vencimento, plano_id, telefone, data_nascimento } = req.body || {};

    if (!nome || !data_nascimento || plano_id === undefined || plano_id === null || plano_id === '' || dia_vencimento === undefined || dia_vencimento === null || dia_vencimento === '') {
      return res.status(400).json({ error: 'Campos obrigatórios faltando (nome, data_nascimento, plano_id, dia_vencimento)' });
    }

    const dv = Number(dia_vencimento);
    if (!dv || dv < 1 || dv > 31) {
      return res.status(400).json({ error: 'dia_vencimento inválido (1..31)' });
    }

    const planoIdFinal = Number(plano_id);
    if (Number.isNaN(planoIdFinal)) {
      return res.status(400).json({ error: 'plano_id inválido' });
    }

    const dataNascISO = toISODate(data_nascimento);
    if (!dataNascISO) {
      return res.status(400).json({ error: 'data_nascimento inválida' });
    }

    const statusFinal = (status || 'ativo') === 'inativo' ? 'inativo' : 'ativo';

    const result = await runExecute(
      `UPDATE aluno
         SET nome = ?, status = ?, dia_vencimento = ?, plano_id = ?, telefone = ?, data_nascimento = ?
       WHERE id = ?`,
      [String(nome).trim(), statusFinal, dv, planoIdFinal, telefone || null, dataNascISO, id]
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Aluno não encontrado' });

    const atualizado = await runGet(`SELECT * FROM aluno WHERE id = ?`, [id]);
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- BUSCAR POR ID ----------
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
