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

// Buscar aluno por ID com última mensalidade e plano
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             COALESCE(m.valor_cobrado, 0) AS valor, 
             COALESCE(m.vencimento, a.dia_vencimento) AS dia_vencimento_mensalidade, 
             COALESCE(m.status, 'não pago') AS status_mensalidade,
             COALESCE(p.nome, 'Sem plano') AS plano_nome
      FROM aluno a
      LEFT JOIN mensalidade m ON a.id = m.aluno_id
      LEFT JOIN plano p ON a.plano_id = p.id
      WHERE a.id = ?
      ORDER BY m.vencimento DESC
      LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const aluno = rows[0];
    aluno.pendente = aluno.status_mensalidade !== 'pago';

    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
