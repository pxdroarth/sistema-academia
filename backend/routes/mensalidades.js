const express = require('express'); 
const router = express.Router();
const pool = require('../database');

// Listar todas as mensalidades
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM mensalidade');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar mensalidades por aluno_id (nova rota)
router.get('/aluno/:alunoId', async (req, res) => {
  const alunoId = parseInt(req.params.alunoId);
  try {
    const [rows] = await pool.query('SELECT * FROM mensalidade WHERE aluno_id = ?', [alunoId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar mensalidade por ID (id da mensalidade)
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

// *** NOVA ROTA PATCH para atualizar só o status ***
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

// Rota para pagamento antecipado de múltiplas mensalidades
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

module.exports = router;
