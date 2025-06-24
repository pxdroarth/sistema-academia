const express = require('express');
const router = express.Router();
const { runQuery, runGet, runExecute } = require('../dbHelper');

// Função para criar mensalidade automática para o mês atual, se não existir
async function criarMensalidadeSeNaoExistir(alunoId, planoId) {
  try {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();

    const alunoData = await runGet('SELECT dia_vencimento FROM aluno WHERE id = ?', [alunoId]);
    if (!alunoData) return;

    const dia = alunoData.dia_vencimento || 1;
    const vencimentoDate = new Date(ano, mes - 1, dia);
    const vencimento = vencimentoDate.toISOString().slice(0, 10);

    const existentes = await runQuery(
      `SELECT * FROM mensalidade WHERE aluno_id = ? AND 
      strftime('%m', vencimento) = ? AND strftime('%Y', vencimento) = ?`,
      [alunoId, String(mes).padStart(2, '0'), String(ano)]
    );
    if (existentes.length === 0) {
      const plano = await runGet('SELECT valor_base FROM plano WHERE id = ?', [planoId]);
      if (!plano) return;

      await runExecute(
        'INSERT INTO mensalidade (aluno_id, vencimento, valor_cobrado, desconto_aplicado, status) VALUES (?, ?, ?, ?, ?)',
        [alunoId, vencimento, plano.valor_base, 0, 'em_aberto']
      );
      console.log('✅ Mensalidade criada com vencimento em:', vencimento);
    } else {
      console.log('⏩ Mensalidade já existente');
    }
  } catch (err) {
    console.error('❌ Erro ao criar mensalidade:', err.message);
  }
}

// Listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const rows = await runQuery('SELECT * FROM aluno');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo aluno com mensalidade automática
router.post('/', async (req, res) => {
  let { nome, cpf, email, status, dia_vencimento, plano_id } = req.body;

  if (!nome || !cpf || !email || !plano_id) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando (nome, cpf, email, plano_id)' });
  }

  if (!dia_vencimento || isNaN(dia_vencimento) || dia_vencimento < 1 || dia_vencimento > 31) {
    dia_vencimento = new Date().getDate();
  }

  try {
    const result = await runExecute(
      'INSERT INTO aluno (nome, cpf, email, status, dia_vencimento, plano_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cpf, email, status || 'ativo', dia_vencimento, plano_id]
    );

    const alunoId = result.id;
    await criarMensalidadeSeNaoExistir(alunoId, plano_id);

    res.status(201).json({
      id: alunoId,
      nome, cpf, email, status: status || 'ativo', dia_vencimento, plano_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar se aluno está em débito
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

// Atualizar aluno
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let { nome, cpf, email, status, dia_vencimento, plano_id } = req.body;

  if (!nome || !cpf || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  if (dia_vencimento && (isNaN(dia_vencimento) || dia_vencimento < 1 || dia_vencimento > 31)) {
    return res.status(400).json({ error: 'dia_vencimento inválido' });
  }

  try {
    const result = await runExecute(
      'UPDATE aluno SET nome = ?, cpf = ?, email = ?, status = ?, dia_vencimento = ?, plano_id = ? WHERE id = ?',
      [nome, cpf, email, status, dia_vencimento || null, plano_id || null, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado para atualizar' });
    }

    if (plano_id) {
      await criarMensalidadeSeNaoExistir(id, plano_id);
    }

    res.json({ id, nome, cpf, email, status, dia_vencimento, plano_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar aluno por ID com indicador de débito
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

    if (!row) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
