const express = require('express');
const app = express();
const port = 3001;
require('./cron');

// Semente de dados
const seedPlanoContas = require('./seeds/seedPlanoContas');
seedPlanoContas(); // popula dados fixos se necessário

// Importações de rotas personalizadas
const dashboardFinanceiroRouter = require('./routes/dashboardFinanceiro');
const ativosRouter = require('./routes/ativos');
const orcamentoRouter = require('./routes/orcamento');

// Middlewares globais
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Rotas principais
app.use('/alunos', require('./routes/alunos'));
app.use('/pagamentos', require('./routes/pagamentos'));
app.use('/planos', require('./routes/planos'));
app.use('/acessos', require('./routes/acessos'));
app.use('/mensalidades', require('./routes/mensalidades'));
app.use('/produtos', require('./routes/produtos'));
app.use('/vendas-produtos', require('./routes/vendasProdutos'));
app.use('/financeiro', require('./routes/financeiro'));
app.use('/relatorios', require('./routes/relatorios'));
app.use('/plano-contas', require('./routes/planoContas'));
app.use('/contas-financeiras', require('./routes/contasFinanceiras'));


app.use('/dashboard/financeiro', dashboardFinanceiroRouter);

// Outros módulos financeiros
app.use('/financeiro/ativos', ativosRouter);
app.use('/financeiro/orcamento', orcamentoRouter);

// Teste de conexão com banco
const db = require('./database');
app.get('/test-db', (req, res) => {
  db.get('SELECT datetime("now") AS agora', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ db_time: row.agora });
  });
});

app.listen(port, () => {
  console.log(`API backend rodando na porta ${port}`);
});
