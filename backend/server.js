const express = require('express');
const cors = require('cors'); // ✅ Importado ANTES de usar
const app = express();
const port = 3001;

// Middlewares globais
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// 🔧 Middleware manual adicional (opcional, reforço ao CORS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 📌 Rotas de planos compartilhados
const planoAssociadoRoutes = require('./routes/planoAssociado');
app.use('/plano-associado', planoAssociadoRoutes);

// 📌 Semente de dados fixa (planos de contas)
const seedPlanoContas = require('./seeds/seedPlanoContas');
seedPlanoContas();

// 📌 Importação de rotas modulares
const dashboardFinanceiroRouter = require('./routes/dashboardFinanceiro');
const ativosRouter = require('./routes/ativos');
const orcamentoRouter = require('./routes/orcamento');

// 📌 Rotas principais
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

// 📌 Dashboard financeiro
app.use('/dashboard/financeiro', dashboardFinanceiroRouter);
app.use('/financeiro/ativos', ativosRouter);
app.use('/financeiro/orcamento', orcamentoRouter);

// 📌 Teste de conexão com banco (healthcheck)
const db = require('./database');
app.get('/test-db', (req, res) => {
  db.get('SELECT datetime("now") AS agora', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ db_time: row.agora });
  });
});

// ✅ Inicialização do servidor
app.listen(port, () => {
  console.log(`API backend rodando na porta ${port}`);
  console.log(`Dashboard financeiro: http://localhost:${port}/dashboard/financeiro/kpis`);
  console.log(`Sincronização:       http://localhost:${port}/dashboard/financeiro/sincronizar`);
});
