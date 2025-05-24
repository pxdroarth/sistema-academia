const express = require('express');
const router = express.Router();
const pool = require('../database');

// Listar todos os alunos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aluno');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar novo aluno
router.post('/', async (req, res) => {
  let { nome, cpf, email, status, dia_vencimento } = req.body;

  if (!nome || !cpf || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  // Define dia_vencimento para dia atual se não informado ou inválido
  if (!dia_vencimento || isNaN(dia_vencimento) || dia_vencimento < 1 || dia_vencimento > 31) {
    const hoje = new Date();
    dia_vencimento = hoje.getDate();
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO aluno (nome, cpf, email, status, dia_vencimento) VALUES (?, ?, ?, ?, ?)',
      [nome, cpf, email, status || 'ativo', dia_vencimento]
    );
    res.status(201).json({
      id: result.insertId,
      nome,
      cpf,
      email,
      status: status || 'ativo',
      dia_vencimento,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar aluno por ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let { nome, cpf, email, status, dia_vencimento } = req.body;

  if (!nome || !cpf || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  // Valida dia_vencimento, se enviado
  if (dia_vencimento && (isNaN(dia_vencimento) || dia_vencimento < 1 || dia_vencimento > 31)) {
    return res.status(400).json({ error: 'dia_vencimento inválido' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE aluno SET nome = ?, cpf = ?, email = ?, status = ?, dia_vencimento = ? WHERE id = ?',
      [nome, cpf, email, status, dia_vencimento || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado para atualizar' });
    }

    res.json({ id, nome, cpf, email, status, dia_vencimento });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar aluno por ID com última mensalidade
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
