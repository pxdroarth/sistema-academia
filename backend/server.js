const express = require('express');
const app = express();
const port = 3001;


// Semente de dados fixa
const seedPlanoContas = require('./seeds/seedPlanoContas');
seedPlanoContas(); // Popula tabela de planos de contas, se necessário

// Importação dos módulos de rotas
const dashboardFinanceiroRouter = require('./routes/dashboardFinanceiro');
const ativosRouter = require('./routes/ativos');
const orcamentoRouter = require('./routes/orcamento');

// Middlewares globais
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Rotas principais do sistema
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

// Rotas do dashboard financeiro (KPIs e sincronização)
app.use('/dashboard/financeiro', dashboardFinanceiroRouter);

// Outros módulos financeiros
app.use('/financeiro/ativos', ativosRouter);
app.use('/financeiro/orcamento', orcamentoRouter);

// Teste de conexão com banco (healthcheck)
const db = require('./database');
app.get('/test-db', (req, res) => {
  db.get('SELECT datetime("now") AS agora', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ db_time: row.agora });
  });
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`API backend rodando na porta ${port}`);
  console.log(`Dashboard financeiro: http://localhost:${port}/dashboard/financeiro/kpis`);
  console.log(`Sincronização:       http://localhost:${port}/dashboard/financeiro/sincronizar`);
});