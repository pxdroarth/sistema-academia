const express = require('express');
const router = express.Router();
const pool = require('../database');

// Função para criar mensalidade automática para o mês atual, se não existir
async function criarMensalidadeSeNaoExistir(alunoId, planoId) {
  try {
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();

    // Buscar o dia_vencimento do aluno
    const [alunoData] = await pool.query('SELECT dia_vencimento FROM aluno WHERE id = ?', [alunoId]);
    if (alunoData.length === 0) return;

    const dia = alunoData[0].dia_vencimento || 1;

    // Monta a data de vencimento com o dia informado
    const vencimentoDate = new Date(ano, mes - 1, dia);
    const vencimento = vencimentoDate.toISOString().slice(0, 10);

    // Verificar se mensalidade para mês e ano já existe
    const [existentes] = await pool.query(
      'SELECT * FROM mensalidade WHERE aluno_id = ? AND MONTH(vencimento) = ? AND YEAR(vencimento) = ?',
      [alunoId, mes, ano]
    );

    if (existentes.length === 0) {
      const [planos] = await pool.query('SELECT valor_base FROM plano WHERE id = ?', [planoId]);
      if (planos.length === 0) return;

      const valorBase = planos[0].valor_base;

      await pool.query(
        'INSERT INTO mensalidade (aluno_id, vencimento, valor_cobrado, desconto_aplicado, status) VALUES (?, ?, ?, ?, ?)',
        [alunoId, vencimento, valorBase, 0, 'em_aberto']
      );

      console.log('✅ Mensalidade criada com vencimento em:', vencimento);
    } else {
      console.log('⏩ Mensalidade já existente');
    }
  } catch (err) {
    console.error('❌ Erro ao criar mensalidade:', err);
  }
}

// Listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aluno');
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
    const hoje = new Date();
    dia_vencimento = hoje.getDate();
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO aluno (nome, cpf, email, status, dia_vencimento, plano_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cpf, email, status || 'ativo', dia_vencimento, plano_id]
    );

    const alunoId = result.insertId;

    // Criar mensalidade automática se não existir
    await criarMensalidadeSeNaoExistir(alunoId, plano_id);

    res.status(201).json({
      id: alunoId,
      nome,
      cpf,
      email,
      status: status || 'ativo',
      dia_vencimento,
      plano_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verificar se aluno está em débito (mensalidades vencidas e em aberto)
router.get('/:id/debito', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) > 0 AS em_debito
      FROM mensalidade
      WHERE aluno_id = ? AND status = 'em_aberto' AND vencimento < CURDATE()
    `, [id]);

    res.json({ em_debito: !!rows[0].em_debito });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar aluno por ID com verificação da mensalidade automática
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
    const [result] = await pool.query(
      'UPDATE aluno SET nome = ?, cpf = ?, email = ?, status = ?, dia_vencimento = ?, plano_id = ? WHERE id = ?',
      [nome, cpf, email, status, dia_vencimento || null, plano_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado para atualizar' });
    }

    // Criar mensalidade automática se não existir para o plano atualizado
    if (plano_id) {
      await criarMensalidadeSeNaoExistir(id, plano_id);
    }

    res.json({ id, nome, cpf, email, status, dia_vencimento, plano_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar aluno por ID com indicador se está em débito
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const [rows] = await pool.query(`
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
    `, [hojeStr, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
