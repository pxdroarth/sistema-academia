const express = require('express');
const router = express.Router();
const { runGet, runExecute, runQuery } = require('../dbHelper');

// POST /mensalidades — Cria mensalidade SÓ quando paga (não gera débito retroativo)
router.post('/', async (req, res) => {
  try {
    const {
      aluno_id,
      plano_id,
      valor_cobrado,
      desconto_aplicado = 0,
      data_inicio,
      vencimento,
      observacoes = ''
    } = req.body;

    if (!aluno_id || !plano_id || !valor_cobrado) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const plano = await runGet('SELECT * FROM plano WHERE id = ?', [plano_id]);
    if (!plano) return res.status(400).json({ error: 'Plano não encontrado' });

    const dataInicio = data_inicio || new Date().toISOString().slice(0, 10);
    let dataFim;
    if (plano.periodo_tipo === 'dias') {
      const di = new Date(dataInicio);
      di.setDate(di.getDate() + Number(plano.periodo_quantidade));
      dataFim = di.toISOString().slice(0, 10);
    } else if (plano.periodo_tipo === 'meses') {
      const di = new Date(dataInicio);
      di.setMonth(di.getMonth() + Number(plano.periodo_quantidade));
      dataFim = di.toISOString().slice(0, 10);
    } else {
      dataFim = dataInicio;
    }

    let venc = vencimento;
    if (!venc) {
      const aluno = await runGet('SELECT dia_vencimento FROM aluno WHERE id = ?', [aluno_id]);
      if (aluno?.dia_vencimento) {
        const hoje = new Date(dataInicio);
        let mes = hoje.getMonth();
        let ano = hoje.getFullYear();
        if (hoje.getDate() > aluno.dia_vencimento) {
          mes += 1;
          if (mes > 11) { mes = 0; ano++; }
        }
        venc = new Date(ano, mes, aluno.dia_vencimento).toISOString().slice(0, 10);
      } else {
        venc = dataInicio;
      }
    }

    const result = await runExecute(
      `INSERT INTO mensalidade 
        (aluno_id, plano_id, valor_cobrado, desconto_aplicado, status, data_inicio, data_fim, vencimento, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [aluno_id, plano_id, valor_cobrado, desconto_aplicado, 'pago', dataInicio, dataFim, venc, observacoes]
    );

    if (vencimento) {
      await runExecute(
        'UPDATE aluno SET dia_vencimento = ? WHERE id = ?',
        [Number(vencimento.split('-')[2]), aluno_id]
      );
    }

    res.status(201).json({
      id: result.id,
      aluno_id,
      plano_id,
      valor_cobrado,
      desconto_aplicado,
      status: 'pago',
      data_inicio: dataInicio,
      data_fim: dataFim,
      vencimento: venc,
      observacoes
    });
  } catch (error) {
    console.error('[ERRO POST mensalidades]', error);
    res.status(500).json({ error: 'Erro ao criar mensalidade' });
  }
});

// GET /mensalidades?filtros...
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM mensalidade WHERE 1=1';
    const params = [];

    if (req.query.aluno_id) {
      sql += ' AND aluno_id = ?';
      params.push(req.query.aluno_id);
    }
    if (req.query.plano_id) {
      sql += ' AND plano_id = ?';
      params.push(req.query.plano_id);
    }
    if (req.query.status) {
      sql += ' AND status = ?';
      params.push(req.query.status);
    }
    if (req.query.data_inicio_de) {
      sql += ' AND data_inicio >= ?';
      params.push(req.query.data_inicio_de);
    }
    if (req.query.data_inicio_ate) {
      sql += ' AND data_inicio <= ?';
      params.push(req.query.data_inicio_ate);
    }
    if (req.query.data_fim_de) {
      sql += ' AND data_fim >= ?';
      params.push(req.query.data_fim_de);
    }
    if (req.query.data_fim_ate) {
      sql += ' AND data_fim <= ?';
      params.push(req.query.data_fim_ate);
    }
    if (req.query.vencimento_de) {
      sql += ' AND vencimento >= ?';
      params.push(req.query.vencimento_de);
    }
    if (req.query.vencimento_ate) {
      sql += ' AND vencimento <= ?';
      params.push(req.query.vencimento_ate);
    }

    sql += ' ORDER BY data_inicio DESC';
    const rows = await runQuery(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /mensalidades/aluno/:alunoId
router.get('/aluno/:alunoId', async (req, res) => {
  const alunoId = parseInt(req.params.alunoId);
  try {
    const rows = await runQuery(
      `SELECT * FROM mensalidade WHERE aluno_id = ? ORDER BY data_inicio DESC`,
      [alunoId]
    );
    res.json({
      mensalidades: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('[ERRO GET mensalidades/aluno/:alunoId]', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /mensalidades/:id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { valor_cobrado, desconto_aplicado, data_inicio, data_fim, vencimento, observacoes } = req.body;
  try {
    const result = await runExecute(
      'UPDATE mensalidade SET valor_cobrado = ?, desconto_aplicado = ?, data_inicio = ?, data_fim = ?, vencimento = ?, observacoes = ? WHERE id = ?',
      [valor_cobrado, desconto_aplicado, data_inicio, data_fim, vencimento, observacoes, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Mensalidade não encontrada' });
    res.json({ message: 'Mensalidade atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /mensalidades/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await runExecute('DELETE FROM mensalidade WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Mensalidade não encontrada para deletar' });
    res.json({ message: 'Mensalidade deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /mensalidades/vigentes
router.get('/vigentes', async (req, res) => {
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    const rows = await runQuery(`
      SELECT * FROM mensalidade
      WHERE status = 'pago' AND data_inicio <= ? AND data_fim >= ?
      ORDER BY data_fim DESC
    `, [hoje, hoje]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /mensalidades/a-vencer?dias=7
router.get('/a-vencer', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 7;
    const hoje = new Date();
    const fim = new Date();
    fim.setDate(hoje.getDate() + dias);
    const rows = await runQuery(`
      SELECT * FROM mensalidade
      WHERE status = 'pago' AND data_fim > ? AND data_fim <= ?
      ORDER BY data_fim ASC
    `, [hoje.toISOString().slice(0, 10), fim.toISOString().slice(0, 10)]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /mensalidades/receita?data_de=...&data_ate=...
router.get('/receita', async (req, res) => {
  try {
    const { data_de, data_ate } = req.query;
    if (!data_de || !data_ate) return res.status(400).json({ error: 'Informe data_de e data_ate.' });
    const row = await runGet(`
      SELECT COALESCE(SUM(valor_cobrado - desconto_aplicado), 0) AS receita
      FROM mensalidade
      WHERE status = 'pago' AND data_inicio >= ? AND data_inicio <= ?
    `, [data_de, data_ate]);
    res.json({ receita: row.receita });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /mensalidades/por-plano
router.get('/por-plano', async (req, res) => {
  try {
    const { data_de, data_ate } = req.query;
    if (!data_de || !data_ate) return res.status(400).json({ error: 'Informe data_de e data_ate.' });
    const rows = await runQuery(`
      SELECT p.nome AS plano, COUNT(m.id) AS total_mensalidades, SUM(m.valor_cobrado) AS total_receita
      FROM mensalidade m
      JOIN plano p ON m.plano_id = p.id
      WHERE m.status = 'pago' AND m.data_inicio >= ? AND m.data_inicio <= ?
      GROUP BY p.nome
      ORDER BY total_receita DESC
    `, [data_de, data_ate]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /mensalidades/sem-acesso
router.get('/sem-acesso', async (req, res) => {
  try {
    const hoje = new Date().toISOString().slice(0, 10);
    const rows = await runQuery(`
      SELECT a.*
      FROM aluno a
      LEFT JOIN (
        SELECT aluno_id FROM mensalidade
        WHERE status = 'pago' AND data_inicio <= ? AND data_fim >= ?
        GROUP BY aluno_id
      ) m ON a.id = m.aluno_id
      WHERE m.aluno_id IS NULL AND a.status = 'ativo'
    `, [hoje, hoje]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
