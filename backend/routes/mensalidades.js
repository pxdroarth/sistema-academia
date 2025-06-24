const express = require('express');
const router = express.Router();
const { runQuery, runGet, runExecute } = require('../dbHelper');

// Listar todas as mensalidades
router.get('/', async (req, res) => {
  try {
    const rows = await runQuery('SELECT * FROM mensalidade');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar mensalidades por aluno (com paginação e filtro de status)
router.get('/aluno/:alunoId', async (req, res) => {
  const alunoId = parseInt(req.params.alunoId);
  const status = req.query.status || 'todos';
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = parseInt(req.query.limite) || 10;
  const offset = (pagina - 1) * limite;

  try {
    let query = 'SELECT * FROM mensalidade WHERE aluno_id = ?';
    const params = [alunoId];

    if (status !== 'todos') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY vencimento DESC LIMIT ? OFFSET ?';
    params.push(limite, offset);

    const mensalidades = await runQuery(query, params);

    let countQuery = 'SELECT COUNT(*) AS total FROM mensalidade WHERE aluno_id = ?';
    const countParams = [alunoId];

    if (status !== 'todos') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const totalRow = await runGet(countQuery, countParams);
    const total = totalRow.total;

    res.json({
      mensalidades,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar mensalidade por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const row = await runGet('SELECT * FROM mensalidade WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'Mensalidade não encontrada' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar nova mensalidade
router.post('/', async (req, res) => {
  const { aluno_id, vencimento, valor_cobrado, desconto_aplicado, status } = req.body;

  if (!aluno_id || !vencimento || !valor_cobrado) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  try {
    const result = await runExecute(
      'INSERT INTO mensalidade (aluno_id, vencimento, valor_cobrado, desconto_aplicado, status) VALUES (?, ?, ?, ?, ?)',
      [aluno_id, vencimento, valor_cobrado, desconto_aplicado || 0, status || 'em_aberto']
    );
    res.status(201).json({ id: result.id, aluno_id, vencimento, valor_cobrado, desconto_aplicado, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar mensalidade
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { aluno_id, vencimento, valor_cobrado, desconto_aplicado, status } = req.body;

  try {
    const result = await runExecute(
      'UPDATE mensalidade SET aluno_id = ?, vencimento = ?, valor_cobrado = ?, desconto_aplicado = ?, status = ? WHERE id = ?',
      [aluno_id, vencimento, valor_cobrado, desconto_aplicado || 0, status, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Mensalidade não encontrada para atualizar' });
    res.json({ id, aluno_id, vencimento, valor_cobrado, desconto_aplicado, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar status
router.patch('/:id/status', async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status é obrigatório' });

  try {
    const result = await runExecute('UPDATE mensalidade SET status = ? WHERE id = ?', [status, id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Mensalidade não encontrada' });
    res.json({ id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirmar pagamento
router.put('/:id/pagar', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await runExecute('UPDATE mensalidade SET status = ? WHERE id = ?', ['pago', id]);
    res.json({ message: 'Mensalidade marcada como paga com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar vencimento
router.put('/:id/vencimento', async (req, res) => {
  const { id } = req.params;
  const { novoVencimento } = req.body;

  if (!novoVencimento) return res.status(400).json({ error: 'Data de vencimento é obrigatória' });

  try {
    await runExecute('UPDATE mensalidade SET vencimento = ? WHERE id = ?', [novoVencimento, id]);
    res.json({ message: 'Vencimento atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pagamento antecipado múltiplo
router.post('/pagamento-antecipado', async (req, res) => {
  const { mensalidadesIds, desconto = 0 } = req.body;

  if (!Array.isArray(mensalidadesIds) || mensalidadesIds.length === 0) {
    return res.status(400).json({ error: 'Ids das mensalidades são obrigatórios' });
  }

  try {
    const resultados = [];
    for (const id of mensalidadesIds) {
      const row = await runGet('SELECT * FROM mensalidade WHERE id = ?', [id]);
      if (!row) return res.status(404).json({ error: `Mensalidade ${id} não encontrada` });

      const valorComDesconto = row.valor_cobrado * (1 - desconto / 100);
      await runExecute(
        'UPDATE mensalidade SET valor_cobrado = ?, desconto_aplicado = ?, status = ? WHERE id = ?',
        [valorComDesconto, desconto, 'pago', id]
      );
      resultados.push({ id, valor_cobrado: valorComDesconto });
    }

    res.json({ message: 'Pagamento antecipado registrado com sucesso', mensalidades: resultados });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar mensalidade
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

// Gerar mensalidades futuras
router.post('/gerar-futuras', async (req, res) => {
  const { alunoId, planoId, meses } = req.body;

  if (!alunoId || !planoId || !meses || meses <= 0) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  try {
    const ultimas = await runQuery(
      `SELECT vencimento FROM mensalidade WHERE aluno_id = ? ORDER BY vencimento DESC LIMIT 1`, [alunoId]
    );

    let diaVencimento;
    if (ultimas.length > 0) {
      diaVencimento = new Date(ultimas[0].vencimento).getDate();
    } else {
      const aluno = await runGet('SELECT dia_vencimento FROM aluno WHERE id = ?', [alunoId]);
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado' });
      diaVencimento = aluno.dia_vencimento || 1;
    }

    const plano = await runGet('SELECT valor_base FROM plano WHERE id = ?', [planoId]);
    if (!plano) return res.status(404).json({ error: 'Plano não encontrado' });

    const valorBase = plano.valor_base;
    const mensalidadesCriadas = [];

    const hoje = new Date();
    let dataInicial = ultimas.length > 0
      ? new Date(new Date(ultimas[0].vencimento).setMonth(new Date(ultimas[0].vencimento).getMonth() + 1))
      : new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);

    if (hoje.getDate() > diaVencimento) dataInicial.setMonth(dataInicial.getMonth() + 1);

    for (let i = 0; i < meses; i++) {
      const vencimentoDate = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, diaVencimento);
      const vencimentoISO = vencimentoDate.toISOString().slice(0, 10);

      const existente = await runGet(
        'SELECT id FROM mensalidade WHERE aluno_id = ? AND vencimento = ?', [alunoId, vencimentoISO]
      );

      if (!existente) {
        const result = await runExecute(
          'INSERT INTO mensalidade (aluno_id, vencimento, valor_cobrado, desconto_aplicado, status) VALUES (?, ?, ?, ?, ?)',
          [alunoId, vencimentoISO, valorBase, 0, 'em_aberto']
        );
        mensalidadesCriadas.push({ id: result.id, aluno_id: alunoId, vencimento: vencimentoISO });
      }
    }

    res.json({ message: `${mensalidadesCriadas.length} mensalidades futuras geradas.`, mensalidadesCriadas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
