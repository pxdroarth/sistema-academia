const express = require('express'); 
const router = express.Router();
const pool = require('../database');

// Listar todas as mensalidades (sem paginação, uso interno ou admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mensalidade');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar mensalidades por aluno_id com paginação e filtro por status
router.get('/aluno/:alunoId', async (req, res) => {
  const alunoId = parseInt(req.params.alunoId);
  const status = req.query.status || 'todos'; // aceita 'em_aberto', 'pago', 'todos'
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

    const [rows] = await pool.query(query, params);

    // Contar total de mensalidades para paginação
    let countQuery = 'SELECT COUNT(*) AS total FROM mensalidade WHERE aluno_id = ?';
    const countParams = [alunoId];

    if (status !== 'todos') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countRows] = await pool.query(countQuery, countParams);
    const total = countRows[0].total;

    res.json({
      mensalidades: rows,
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
    const [rows] = await pool.query('SELECT * FROM mensalidade WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Mensalidade não encontrada' });
    res.json(rows[0]);
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
    const [result] = await pool.query(
      'INSERT INTO mensalidade (aluno_id, vencimento, valor_cobrado, desconto_aplicado, status) VALUES (?, ?, ?, ?, ?)',
      [aluno_id, vencimento, valor_cobrado, desconto_aplicado || 0, status || 'debito']
    );
    res.status(201).json({
      id: result.insertId,
      aluno_id,
      vencimento,
      valor_cobrado,
      desconto_aplicado: desconto_aplicado || 0,
      status: status || 'debito'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar mensalidade por ID (completa)
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { aluno_id, vencimento, valor_cobrado, desconto_aplicado, status } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE mensalidade SET aluno_id = ?, vencimento = ?, valor_cobrado = ?, desconto_aplicado = ?, status = ? WHERE id = ?',
      [aluno_id, vencimento, valor_cobrado, desconto_aplicado || 0, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mensalidade não encontrada para atualizar' });
    }

    res.json({ id, aluno_id, vencimento, valor_cobrado, desconto_aplicado, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar só status (PATCH)
router.patch('/:id/status', async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE mensalidade SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mensalidade não encontrada' });
    }

    res.json({ id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar mensalidade por ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await pool.query('DELETE FROM mensalidade WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Mensalidade não encontrada para deletar' });
    res.json({ message: 'Mensalidade deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pagamento antecipado de múltiplas mensalidades
router.post('/pagamento-antecipado', async (req, res) => {
  const { mensalidadesIds, desconto = 0 } = req.body;

  if (!Array.isArray(mensalidadesIds) || mensalidadesIds.length === 0) {
    return res.status(400).json({ error: 'Ids das mensalidades são obrigatórios' });
  }

  try {
    const resultados = [];
    for (const id of mensalidadesIds) {
      // Buscar mensalidade para validar existência
      const [rows] = await pool.query('SELECT * FROM mensalidade WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: `Mensalidade ${id} não encontrada` });
      }

      const m = rows[0];
      // Calcular valor com desconto
      const valorComDesconto = m.valor_cobrado * (1 - desconto / 100);

      // Atualizar mensalidade com valor e status pago
      const [result] = await pool.query(
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

// Confirmar pagamento (forma alternativa ao PATCH /:id/status)
router.put('/:id/pagar', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE mensalidade SET status = ? WHERE id = ?',
      ['pago', id]
    );
    res.json({ message: 'Mensalidade marcada como paga com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar vencimento isoladamente (forma alternativa ao PUT completo)
router.put('/:id/vencimento', async (req, res) => {
  const { id } = req.params;
  const { novoVencimento } = req.body;

  if (!novoVencimento) {
    return res.status(400).json({ error: 'Data de vencimento é obrigatória' });
  }

  try {
    await pool.query(
      'UPDATE mensalidade SET vencimento = ? WHERE id = ?',
      [novoVencimento, id]
    );
    res.json({ message: 'Vencimento atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// === NOVA ROTA PARA GERAR MENSALIDADES FUTURAS COM DIA BASEADO NA ÚLTIMA ALTERAÇÃO ===
router.post('/gerar-futuras', async (req, res) => {
  const { alunoId, planoId, meses } = req.body;

  if (!alunoId || !planoId || !meses || meses <= 0) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  try {
    // Buscar último vencimento já cadastrado para o aluno, ordenado por último update para pegar data da última alteração
    const [ultimasMensalidades] = await pool.query(`
      SELECT vencimento FROM mensalidade WHERE aluno_id = ? ORDER BY updated_at DESC, vencimento DESC LIMIT 1
    `, [alunoId]);

    let diaVencimento;
    if (ultimasMensalidades.length > 0) {
      // Usar dia da última mensalidade alterada
      const ultimaData = new Date(ultimasMensalidades[0].vencimento);
      diaVencimento = ultimaData.getDate();
    } else {
      // Se não houver mensalidade, buscar dia_vencimento do aluno
      const [alunoData] = await pool.query('SELECT dia_vencimento FROM aluno WHERE id = ?', [alunoId]);
      if (alunoData.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
      diaVencimento = alunoData[0].dia_vencimento || 1;
    }

    // Buscar valor do plano
    const [planos] = await pool.query('SELECT valor_base FROM plano WHERE id = ?', [planoId]);
    if (planos.length === 0) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }
    const valorBase = planos[0].valor_base;

    const mensalidadesCriadas = [];

    const hoje = new Date();

    // Data inicial para gerar mensalidades: próximo mês após última mensalidade existente
    let dataInicial;
    if (ultimasMensalidades.length > 0) {
      const ultimoVencimento = new Date(ultimasMensalidades[0].vencimento);
      dataInicial = new Date(ultimoVencimento.getFullYear(), ultimoVencimento.getMonth() + 1, diaVencimento);
    } else {
      dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
      if (hoje.getDate() > diaVencimento) {
        dataInicial.setMonth(dataInicial.getMonth() + 1);
      }
    }

    for (let i = 0; i < meses; i++) {
      const vencimentoDate = new Date(dataInicial.getFullYear(), dataInicial.getMonth() + i, diaVencimento);
      const vencimentoISO = vencimentoDate.toISOString().slice(0, 10);

      // Verificar se já existe mensalidade para essa data
      const [existentes] = await pool.query(
        'SELECT * FROM mensalidade WHERE aluno_id = ? AND vencimento = ?',
        [alunoId, vencimentoISO]
      );

      if (existentes.length === 0) {
        // Criar mensalidade
        const [result] = await pool.query(
          'INSERT INTO mensalidade (aluno_id, vencimento, valor_cobrado, desconto_aplicado, status) VALUES (?, ?, ?, ?, ?)',
          [alunoId, vencimentoISO, valorBase, 0, 'em_aberto']
        );
        mensalidadesCriadas.push({
          id: result.insertId,
          aluno_id: alunoId,
          vencimento: vencimentoISO,
          valor_cobrado: valorBase,
          desconto_aplicado: 0,
          status: 'em_aberto'
        });
      }
    }

    res.json({
      message: `${mensalidadesCriadas.length} mensalidades futuras geradas.`,
      mensalidadesCriadas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  


module.exports = router;
